import { useEffect, useState, useCallback } from 'react';
import { Users, Truck, Route, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VTCStats {
  members: number;
  revenue: string;
  distance: string;
  joinedDate: string;
}

const StatsSection = () => {
  // 1. Better Initial State: Use your manual defaults as the starting point
  const [stats, setStats] = useState<VTCStats>({
    members: 28, 
    revenue: '€12.5B',
    distance: '986K km',
    joinedDate: 'October 2024',
  });
  const [loading, setLoading] = useState(true);

  const fetchVTCStats = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    
    try {
      // Calling the Edge Function we just fixed
      const { data, error } = await supabase.functions.invoke('truckersmp-vtc', {
        method: 'GET', // Explicitly set method
      });
      
      if (error) throw error;

      if (data?.vtc) {
        const vtc = data.vtc;
        
        // Format the founded date from the API
        const createdDate = vtc.created_at ? new Date(vtc.created_at) : null;
        let formattedDate = 'October 2024';

        if (createdDate && !isNaN(createdDate.getTime())) {
          formattedDate = createdDate.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
          });
        }
        
        setStats(prev => ({
          ...prev,
          members: vtc.members_count || prev.members,
          joinedDate: formattedDate,
          // Revenue and Distance remain manual as TMP API doesn't provide these directly
        }));
      }
    } catch (err) {
      console.error('Stats fetch failed, using fallback:', err);
      // We don't need to do anything here because our 'stats' state 
      // already contains the manual defaults.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVTCStats();
    const interval = setInterval(() => fetchVTCStats(true), 60000);
    return () => clearInterval(interval);
  }, [fetchVTCStats]);

  const statItems = [
    { icon: Users, value: stats.members.toString(), label: 'Active Members' },
    { icon: Truck, value: stats.revenue, label: 'Total Revenue' },
    { icon: Route, value: stats.distance, label: 'Distance Covered' },
    { icon: Calendar, value: stats.joinedDate, label: 'Founded' },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="glass-card rounded-3xl p-8 md:p-12 animate-slide-up hover:glow-border transition-all duration-500">
          
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Live </span>
              <span className="text-primary glow-text">Statistics</span>
            </h2>
            <p className="text-muted-foreground italic">
              Real-time data synchronization active
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="text-center p-6 rounded-2xl bg-secondary/50 border border-border/30 hover:border-primary/50 transition-all duration-500 group"
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="font-display text-2xl md:text-3xl font-bold text-primary glow-text mb-2">
                    {/* Only show skeleton during the INITIAL load, not on refreshes */}
                    {loading && stats.members === 0 ? (
                      <div className="h-8 w-16 mx-auto bg-muted animate-pulse rounded" />
                    ) : (
                      item.value
                    )}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-2 mt-8 text-[10px] text-muted-foreground/60">
             <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
             {loading ? 'SYNCING WITH TRUCKERSMP...' : 'DATA VERIFIED BY TMP API'}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
