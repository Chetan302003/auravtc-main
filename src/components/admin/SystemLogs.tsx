import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Trash2, ChevronDown, ChevronRight, AlertCircle, Info, AlertTriangle, Loader2, Database, Plus, Pencil, X, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface SystemLog {
  id: string;
  created_at: string;
  level: string;
  source: string;
  message: string;
  data: Record<string, unknown> | null;
  run_id: string | null;
  event_id: string | null;
  member_id: string | null;
  user_id: string | null;
}

interface GroupedLog {
  id: string;
  run_id: string;
  source: string;
  level: string;
  created_at: string;
  summary: string;
  logs: SystemLog[];
  stats?: {
    online: number;
    offline: number;
    total: number;
  };
}

interface AuditData {
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_at: string;
}

interface SystemLogsProps {
  isAdmin: boolean;
  canDelete?: boolean;
}

const SystemLogs = ({ isAdmin, canDelete = false }: SystemLogsProps) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'audit' | 'system'>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filter !== 'all') {
        query = query.eq('level', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data as SystemLog[]) || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch logs';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  // Get unique sources for filter
  const sources = useMemo(() => {
    const uniqueSources = [...new Set(logs.map(l => l.source))];
    return uniqueSources.sort();
  }, [logs]);

  // Check if a log is an audit log
  const isAuditLog = (log: SystemLog): boolean => {
    return log.source.startsWith('audit-');
  };

  // Get audit data from log
  const getAuditData = (log: SystemLog): AuditData | null => {
    if (!isAuditLog(log) || !log.data) return null;
    return log.data as unknown as AuditData;
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Plus className="w-3 h-3" />;
      case 'UPDATE':
        return <Pencil className="w-3 h-3" />;
      case 'DELETE':
        return <X className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Get action color
  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'UPDATE':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'DELETE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Get table display name
  const getTableDisplayName = (tableName: string) => {
    const names: Record<string, string> = {
      applications: 'Application',
      events: 'Event',
      gallery_items: 'Gallery Item',
      slot_bookings: 'Slot Booking',
      event_slots: 'Event Slot',
      members: 'Member',
      vtc_settings: 'VTC Setting',
      user_roles: 'User Role',
      profiles: 'Profile',
      attendance: 'Attendance',
      event_booking_settings: 'Booking Settings',
    };
    return names[tableName] || tableName;
  };

  // Calculate diff between old and new data
  const calculateDiff = (oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) => {
    const changes: { field: string; oldValue: unknown; newValue: unknown }[] = [];

    if (!oldData && newData) {
      // INSERT - show all new fields
      Object.entries(newData).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          changes.push({ field: key, oldValue: null, newValue: value });
        }
      });
    } else if (oldData && !newData) {
      // DELETE - show all old fields
      Object.entries(oldData).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          changes.push({ field: key, oldValue: value, newValue: null });
        }
      });
    } else if (oldData && newData) {
      // UPDATE - show changed fields
      Object.keys({ ...oldData, ...newData }).forEach((key) => {
        if (key !== 'updated_at' && JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
          changes.push({ field: key, oldValue: oldData[key], newValue: newData[key] });
        }
      });
    }

    return changes;
  };

  // Format value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Group attendance logs by run_id and consolidate
  const processedLogs = useMemo(() => {
    let filteredLogs = logs;

    // Apply category filter
    if (categoryFilter === 'audit') {
      filteredLogs = filteredLogs.filter(l => l.source.startsWith('audit-'));
    } else if (categoryFilter === 'system') {
      filteredLogs = filteredLogs.filter(l => !l.source.startsWith('audit-'));
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filteredLogs = filteredLogs.filter(l => l.source === sourceFilter);
    }

    // Group logs by run_id for attendance checks
    const runGroups = new Map<string, SystemLog[]>();
    const auditLogs: SystemLog[] = [];
    const otherLogs: SystemLog[] = [];

    filteredLogs.forEach(log => {
      if (log.source === 'check-attendance' && log.run_id) {
        const existing = runGroups.get(log.run_id) || [];
        existing.push(log);
        runGroups.set(log.run_id, existing);
      } else if (log.source.startsWith('audit-')) {
        auditLogs.push(log);
      } else {
        otherLogs.push(log);
      }
    });

    // Group audit logs by table + user within a 5-second window
    const auditGroups: SystemLog[][] = [];
    const usedAuditIndices = new Set<number>();

    // Sort audit logs by time
    const sortedAudit = [...auditLogs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    for (let i = 0; i < sortedAudit.length; i++) {
      if (usedAuditIndices.has(i)) continue;
      const log = sortedAudit[i];
      const auditData = getAuditData(log);
      if (!auditData) {
        otherLogs.push(log);
        continue;
      }

      const group: SystemLog[] = [log];
      usedAuditIndices.add(i);
      const baseTime = new Date(log.created_at).getTime();

      for (let j = i + 1; j < sortedAudit.length; j++) {
        if (usedAuditIndices.has(j)) continue;
        const other = sortedAudit[j];
        const otherAudit = getAuditData(other);
        if (!otherAudit) continue;

        const timeDiff = Math.abs(new Date(other.created_at).getTime() - baseTime);
        if (timeDiff > 5000) break; // beyond 5s window

        if (otherAudit.table_name === auditData.table_name &&
          other.user_id === log.user_id &&
          otherAudit.action === auditData.action) {
          group.push(other);
          usedAuditIndices.add(j);
        }
      }

      auditGroups.push(group);
    }

    // Convert grouped attendance logs to consolidated entries
    const groupedLogs: GroupedLog[] = [];

    runGroups.forEach((logsInRun, runId) => {
      // Sort by time
      logsInRun.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      // Find summary log or create one
      const summaryLog = logsInRun.find(l => l.message.includes('completed') || l.message.includes('Attendance check'));
      const firstLog = logsInRun[0];

      // Count online/offline from individual checks
      let online = 0;
      let offline = 0;
      logsInRun.forEach(log => {
        if (log.data) {
          const data = log.data as Record<string, unknown>;
          if (data.online === true) online++;
          if (data.online === false) offline++;
        }
      });

      // Extract from summary if available
      if (summaryLog?.data) {
        const data = summaryLog.data as Record<string, unknown>;
        if (typeof data.online === 'number') online = data.online;
        if (typeof data.offline === 'number') offline = data.offline;
      }

      const hasError = logsInRun.some(l => l.level === 'error');
      const hasWarning = logsInRun.some(l => l.level === 'warn');

      groupedLogs.push({
        id: runId,
        run_id: runId,
        source: 'check-attendance',
        level: hasError ? 'error' : hasWarning ? 'warn' : 'info',
        created_at: firstLog.created_at,
        summary: `Attendance check: ${online} online, ${offline} offline (${logsInRun.length} checks)`,
        logs: logsInRun,
        stats: { online, offline, total: online + offline }
      });
    });

    // Convert grouped audit logs to consolidated entries
    const auditGroupedLogs: GroupedLog[] = [];
    auditGroups.forEach((group) => {
      if (group.length === 1) {
        // Single audit log, keep as regular log
        otherLogs.push(group[0]);
      } else {
        // Multiple audit logs grouped together
        const firstLog = group[0];
        const auditData = getAuditData(firstLog);
        const tableName = auditData ? getTableDisplayName(auditData.table_name) : 'Record';
        const action = auditData?.action || 'UPDATE';

        auditGroupedLogs.push({
          id: `audit-group-${firstLog.id}`,
          run_id: `audit-group-${firstLog.id}`,
          source: firstLog.source,
          level: firstLog.level,
          created_at: firstLog.created_at,
          summary: `${action === 'INSERT' ? 'Created' : action === 'DELETE' ? 'Deleted' : 'Updated'} ${group.length} ${tableName.toLowerCase()}${group.length !== 1 ? 's' : ''}`,
          logs: group,
        });
      }
    });

    // Combine and sort by date
    const allItems: (GroupedLog | SystemLog)[] = [
      ...groupedLogs,
      ...auditGroupedLogs,
      ...otherLogs
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return allItems;
  }, [logs, sourceFilter, categoryFilter]);

  const handleClearLogs = async () => {
    if (!canDelete) {
      toast.error('You do not have permission to clear logs');
      return;
    }

    try {
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      toast.success('Logs cleared');
      fetchLogs();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear logs';
      toast.error(errorMessage);
    }
  };

  const toggleExpand = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Export logs to JSON
  const exportToJSON = () => {
    const dataToExport = processedLogs.map(item => {
      if (isGroupedLog(item)) {
        return {
          type: 'grouped',
          id: item.id,
          run_id: item.run_id,
          source: item.source,
          level: item.level,
          created_at: item.created_at,
          summary: item.summary,
          stats: item.stats,
          logs: item.logs
        };
      } else {
        const log = item as SystemLog;
        return {
          type: isAuditLog(log) ? 'audit' : 'system',
          id: log.id,
          created_at: log.created_at,
          level: log.level,
          source: log.source,
          message: log.message,
          data: log.data,
          user_id: log.user_id
        };
      }
    });

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Logs exported as JSON');
  };

  // Export logs to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Level', 'Source', 'Type', 'Action', 'Table', 'Message', 'Record ID', 'User ID', 'Data'];

    const rows = processedLogs.map(item => {
      if (isGroupedLog(item)) {
        return [
          item.created_at,
          item.level,
          item.source,
          'grouped',
          '',
          '',
          item.summary,
          item.run_id,
          '',
          JSON.stringify(item.stats || {})
        ];
      } else {
        const log = item as SystemLog;
        const auditData = getAuditData(log);
        return [
          log.created_at,
          log.level,
          log.source,
          isAuditLog(log) ? 'audit' : 'system',
          auditData?.action || '',
          auditData?.table_name || '',
          log.message,
          auditData?.record_id || log.id,
          log.user_id || '',
          JSON.stringify(log.data || {})
        ];
      }
    });

    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => escapeCSV(String(cell ?? ''))).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Logs exported as CSV');
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />;
      default:
        return <Info className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'border-destructive/30 bg-destructive/5';
      case 'warn':
        return 'border-yellow-500/20 bg-yellow-500/5';
      default:
        return 'border-primary/20 bg-primary/5';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isGroupedLog = (item: GroupedLog | SystemLog): item is GroupedLog => {
    return 'logs' in item && Array.isArray(item.logs);
  };

  // Render audit log entry
  const renderAuditLog = (log: SystemLog) => {
    const auditData = getAuditData(log);
    if (!auditData) return null;

    const diff = calculateDiff(auditData.old_data, auditData.new_data);

    return (
      <div
        key={log.id}
        className={`rounded-lg border p-2 sm:p-3 transition-all ${getLevelColor(log.level)}`}
      >
        <div
          className="flex items-start gap-2 cursor-pointer"
          onClick={() => toggleExpand(log.id)}
        >
          {expandedLogs.has(log.id) ? (
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {formatTime(log.created_at)}
              </span>

              {/* Action badge */}
              <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 ${getActionColor(auditData.action)}`}>
                {getActionIcon(auditData.action)}
                {auditData.action}
              </span>

              {/* Table name badge */}
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                {getTableDisplayName(auditData.table_name)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-foreground break-words">
              {auditData.action === 'INSERT' && `New ${getTableDisplayName(auditData.table_name).toLowerCase()} created`}
              {auditData.action === 'UPDATE' && `${getTableDisplayName(auditData.table_name)} updated`}
              {auditData.action === 'DELETE' && `${getTableDisplayName(auditData.table_name)} deleted`}
              {diff.length > 0 && auditData.action === 'UPDATE' && (
                <span className="text-muted-foreground ml-1">
                  ({diff.length} field{diff.length !== 1 ? 's' : ''} changed)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Expanded diff view */}
        {expandedLogs.has(log.id) && (
          <div className="mt-2 ml-6 sm:ml-8 space-y-1.5">
            {diff.length > 0 ? (
              <div className="space-y-1">
                {diff.map((change, idx) => (
                  <div key={idx} className="p-2 rounded bg-background/50 border border-border/30">
                    <span className="text-[10px] sm:text-xs font-medium text-foreground capitalize">
                      {change.field.replace(/_/g, ' ')}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {change.oldValue !== null && (
                        <div className="flex items-start gap-1">
                          <span className="text-[10px] text-red-400 flex-shrink-0">−</span>
                          <span className="text-[10px] sm:text-xs text-red-400 break-all">
                            {formatValue(change.oldValue)}
                          </span>
                        </div>
                      )}
                      {change.newValue !== null && (
                        <div className="flex items-start gap-1">
                          <span className="text-[10px] text-green-400 flex-shrink-0">+</span>
                          <span className="text-[10px] sm:text-xs text-green-400 break-all">
                            {formatValue(change.newValue)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 rounded bg-background/50 border border-border/30">
                <span className="text-[10px] sm:text-xs text-muted-foreground">No field changes to display</span>
              </div>
            )}

            {/* Record ID */}
            <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-2">
              Record ID: {auditData.record_id}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card rounded-lg sm:rounded-xl border border-primary/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg md:text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            System Logs
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category filter */}
            <div className="flex rounded-lg border border-border/30 overflow-hidden">
              {(['all', 'audit', 'system'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-medium capitalize transition-colors ${categoryFilter === cat
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                    }`}
                >
                  {cat === 'audit' ? 'Changes' : cat}
                </button>
              ))}
            </div>

            {/* Source filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2 py-1 text-[10px] sm:text-xs rounded-lg border border-border/30 bg-secondary/30 text-foreground"
            >
              <option value="all">All Sources</option>
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>

            {/* Level filter buttons */}
            <div className="flex rounded-lg border border-border/30 overflow-hidden">
              {(['all', 'info', 'warn', 'error'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-medium capitalize transition-colors ${filter === f
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={fetchLogs}
              disabled={loading}
              className="text-[10px] sm:text-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={processedLogs.length === 0}
                  className="text-[10px] sm:text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border">
                <DropdownMenuItem onClick={exportToJSON} className="cursor-pointer">
                  <FileJson className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearLogs}
                className="text-[10px] sm:text-xs text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="h-80 sm:h-96" data-lenis-prevent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : processedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Info className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No logs found</p>
          </div>
        ) : (
          <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
            {processedLogs.map((item) => {
              // Check if it's an audit log
              if (!isGroupedLog(item) && isAuditLog(item as SystemLog)) {
                return renderAuditLog(item as SystemLog);
              }

              if (isGroupedLog(item)) {
                // Check if it's a grouped audit log
                const isAuditGroup = item.source.startsWith('audit-');

                if (isAuditGroup) {
                  // Grouped audit logs
                  const firstAudit = getAuditData(item.logs[0]);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-2 sm:p-3 transition-all ${getLevelColor(item.level)}`}
                    >
                      <div
                        className="flex items-start gap-2 cursor-pointer"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {expandedLogs.has(item.id) ? (
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                              {formatTime(item.created_at)}
                            </span>
                            {firstAudit && (
                              <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 ${getActionColor(firstAudit.action)}`}>
                                {getActionIcon(firstAudit.action)}
                                {firstAudit.action}
                              </span>
                            )}
                            {firstAudit && (
                              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                                {getTableDisplayName(firstAudit.table_name)}
                              </span>
                            )}
                            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {item.logs.length} changes
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-foreground break-words">{item.summary}</p>
                        </div>
                      </div>

                      {expandedLogs.has(item.id) && (
                        <div className="mt-2 ml-6 sm:ml-8 space-y-1.5 max-h-60 overflow-y-auto">
                          {item.logs.map((log) => {
                            const auditData = getAuditData(log);
                            if (!auditData) return null;
                            const diff = calculateDiff(auditData.old_data, auditData.new_data);
                            return (
                              <div key={log.id} className="p-2 rounded bg-background/50 border border-border/30">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] text-muted-foreground">
                                    Record: {auditData.record_id.substring(0, 8)}...
                                  </span>
                                </div>
                                {diff.map((change, idx) => (
                                  <div key={idx} className="mt-1 p-1.5 rounded bg-background/30">
                                    <span className="text-[10px] font-medium text-foreground capitalize">
                                      {change.field.replace(/_/g, ' ')}
                                    </span>
                                    <div className="mt-0.5 space-y-0.5">
                                      {change.oldValue !== null && (
                                        <div className="flex items-start gap-1">
                                          <span className="text-[10px] text-red-400 flex-shrink-0">−</span>
                                          <span className="text-[10px] text-red-400 break-all">{formatValue(change.oldValue)}</span>
                                        </div>
                                      )}
                                      {change.newValue !== null && (
                                        <div className="flex items-start gap-1">
                                          <span className="text-[10px] text-green-400 flex-shrink-0">+</span>
                                          <span className="text-[10px] text-green-400 break-all">{formatValue(change.newValue)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Grouped attendance log
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-2 sm:p-3 transition-all ${getLevelColor(item.level)}`}
                  >
                    <div
                      className="flex items-start gap-2 cursor-pointer"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {expandedLogs.has(item.id) ? (
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}

                      {getLevelIcon(item.level)}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatTime(item.created_at)}
                          </span>
                          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                            {item.source}
                          </span>
                          {item.stats && (
                            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {item.stats.online} online • {item.stats.offline} offline
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-foreground break-words">{item.summary}</p>
                      </div>
                    </div>

                    {expandedLogs.has(item.id) && (
                      <div className="mt-2 ml-6 sm:ml-8 space-y-1.5 max-h-60 overflow-y-auto">
                        {item.logs.map((log) => (
                          <div key={log.id} className="p-2 rounded bg-background/50 border border-border/30">
                            <div className="flex items-center gap-2 mb-1">
                              {getLevelIcon(log.level)}
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(log.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-xs text-foreground">{log.message}</p>
                            {log.data && (
                              <pre className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 whitespace-pre-wrap break-all">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Regular log
                const log = item as SystemLog;
                return (
                  <div
                    key={log.id}
                    className={`rounded-lg border p-2 sm:p-3 transition-all ${getLevelColor(log.level)}`}
                  >
                    <div
                      className="flex items-start gap-2 cursor-pointer"
                      onClick={() => log.data && toggleExpand(log.id)}
                    >
                      {log.data ? (
                        expandedLogs.has(log.id) ? (
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )
                      ) : (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      )}

                      {getLevelIcon(log.level)}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatTime(log.created_at)}
                          </span>
                          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                            {log.source}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground break-words">{log.message}</p>
                      </div>
                    </div>

                    {log.data && expandedLogs.has(log.id) && (
                      <div className="mt-2 ml-6 sm:ml-8 p-2 rounded bg-background/50 border border-border/30">
                        <pre className="text-[10px] sm:text-xs text-muted-foreground whitespace-pre-wrap break-all overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SystemLogs;

