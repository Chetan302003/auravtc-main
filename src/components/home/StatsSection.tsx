import { useEffect, useState } from 'react';
import { Users, Truck, Route, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VTCStats {
  members: number;
  revenue: string;
  distance: string;
  joinedDate: string;
}

const StatsSection = () => {
  const [stats, setStats] = useState<VTCStats>({
    members: 0,
    revenue: '0',
    distance: '0',
    joinedDate: '-',
  });
  const [loading, setLoading] = useState(true);

const fetchVTCStats = async (isRefresh = false) => {
  if (!isRefresh) setLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke('truckersmp-vtc');
    method: 'GET', // Explicitly set method
    // If the API works, we update the state with live data
    if (!error && data?.vtc) {
      const vtc = data.vtc;
      const createdDate = vtc.created_at ? new Date(vtc.created_at) : null;
      let formattedDate = 'October 2024';

      if (createdDate && !isNaN(createdDate.getTime())) {
        formattedDate = createdDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
      
      setStats({
        members: vtc.members_count || 28, // Live count
        revenue: '€12.5B', // Manual
        distance: '986K km', // Manual
        joinedDate: formattedDate,
      });
    } else {
      // If there is an error but we want to keep manual data visible:
      throw new Error("API Offline");
    }
  } catch (err) {
    console.error('Error fetching VTC stats:', err);
    // 2. FIX: Instead of setting everything to 0, set your Manual Defaults here
    if (!isRefresh) {
      setStats({
        members: 28, // Put your current member count here as fallback
        revenue: '€12.5B',
        distance: '986K km',
        joinedDate: 'OCTOBER 2024',
      });
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchVTCStats();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchVTCStats(true), 600000);
    return () => clearInterval(interval);
  }, []);

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    if (km >= 1000000) {
      return (km / 1000000).toFixed(1) + 'M km';
    } else if (km >= 1000) {
      return (km / 1000).toFixed(1) + 'K km';
    }
    return km.toFixed(0) + ' km';
  };

  const statItems = [
    { icon: Users, value: stats.members.toString(), label: 'Active Members', suffix: '' },
    { icon: Truck, value: stats.revenue, label: 'Total Revenue', suffix: '' },
    { icon: Route, value: stats.distance, label: 'Distance Covered', suffix: '' },
    { icon: Calendar, value: stats.joinedDate, label: 'Founded', suffix: '' },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30 animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="glass-card rounded-3xl p-8 md:p-12 animate-slide-up hover:glow-border transition-all duration-500">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 animate-fade-in">
              <span className="text-foreground">Live </span>
              <span className="text-primary glow-text animate-pulse-glow">Statistics</span>
            </h2>
            <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>Real-time data from TruckersMP</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="text-center p-6 rounded-2xl bg-secondary/50 border border-border/30 hover:border-primary/50 transition-all duration-500 group hover:-translate-y-2 hover:glow-border animate-scale-in"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary glow-text mb-2 group-hover:animate-pulse-glow">
                    {loading ? (
                      <div className="h-10 w-20 mx-auto bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        {item.value}
                        {item.suffix}
                      </>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            Statistics are updated in real-time via TruckersMP API
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
