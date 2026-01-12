import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Trash2, ChevronDown, ChevronRight, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
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

interface SystemLogsProps {
  isAdmin: boolean;
  /**
   * Optional source filter (e.g. "check-attendance").
   * When provided, logs are scoped to that source by default.
   */
  source?: string;
  /** Optional title override for the panel header. */
  title?: string;
}

const SystemLogs = ({ isAdmin, source, title }: SystemLogsProps) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [scope, setScope] = useState<'source' | 'all'>(source ? 'source' : 'all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('level', filter);
      }

      if (source && scope === 'source') {
        query = query.eq('source', source);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, scope, source]);

  const handleClearLogs = async () => {
    if (!isAdmin) {
      toast.error('Only admins can clear logs');
      return;
    }

    try {
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

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
        return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />;
      default:
        return <Info className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'border-destructive/30 bg-destructive/5';
      case 'warn':
        return 'border-primary/20 bg-primary/5';
      default:
        return 'border-primary/20 bg-primary/5';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="glass-card rounded-lg sm:rounded-xl border border-primary/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg md:text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {title ?? (source ? 'Attendance Logs' : 'System Logs')}
          </h2>
          
          <div className="flex flex-wrap items-center gap-2">
            {source && (
              <div className="flex rounded-lg border border-border/30 overflow-hidden">
                <button
                  onClick={() => setScope('source')}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-medium transition-colors ${
                    scope === 'source'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setScope('all')}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-medium transition-colors ${
                    scope === 'all'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  All
                </button>
              </div>
            )}

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
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Info className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No logs found</p>
            <p className="text-xs text-muted-foreground mt-1">Run an attendance check to generate logs</p>
          </div>
        ) : (
          <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
            {logs.map((log) => (
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
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SystemLogs;
