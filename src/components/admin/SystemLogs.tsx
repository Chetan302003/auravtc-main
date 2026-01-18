import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Trash2, ChevronDown, ChevronRight, AlertCircle, Info, AlertTriangle, Loader2, Database } from 'lucide-react';
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

interface SystemLogsProps {
  isAdmin: boolean;
}

const SystemLogs = ({ isAdmin }: SystemLogsProps) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

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

  // Group attendance logs by run_id and consolidate
  const processedLogs = useMemo(() => {
    const filteredLogs = sourceFilter === 'all' 
      ? logs 
      : logs.filter(l => l.source === sourceFilter);

    // Group logs by run_id for attendance checks
    const runGroups = new Map<string, SystemLog[]>();
    const otherLogs: SystemLog[] = [];

    filteredLogs.forEach(log => {
      if (log.source === 'check-attendance' && log.run_id) {
        const existing = runGroups.get(log.run_id) || [];
        existing.push(log);
        runGroups.set(log.run_id, existing);
      } else {
        otherLogs.push(log);
      }
    });

    // Convert grouped attendance logs to consolidated entries
    const groupedLogs: GroupedLog[] = [];

    runGroups.forEach((logsInRun, runId) => {
      // Sort by time
      logsInRun.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      // Find summary log or create one
      const summaryLog = logsInRun.find(l => l.message.includes('completed') || l.message.includes('Attendance check'));
      const firstLog = logsInRun[0];
      const lastLog = logsInRun[logsInRun.length - 1];

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

    // Combine and sort by date
    const allItems: (GroupedLog | SystemLog)[] = [
      ...groupedLogs,
      ...otherLogs
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return allItems;
  }, [logs, sourceFilter]);

  const handleClearLogs = async () => {
    if (!isAdmin) {
      toast.error('Only admins can clear logs');
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

  return (
    <div className="glass-card rounded-lg sm:rounded-xl border border-primary/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg md:text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            System Logs
          </h2>
          
          <div className="flex flex-wrap items-center gap-2">
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
                  className={`px-2 py-1 text-[10px] sm:text-xs font-medium capitalize transition-colors ${
                    filter === f 
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

            {isAdmin && (
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

      <ScrollArea className="h-80 sm:h-96">
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
              if (isGroupedLog(item)) {
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
