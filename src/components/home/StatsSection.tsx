import { useEffect, useState } from 'react';
import { Users, Truck, Route, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VTCStats {
  members: string;
  revenue: string;
  distance: string;
  joinedDate: string;
}

const StatsSection = () => {
  const [stats, setStats] = useState<VTCStats>({
    members: '0',
    revenue: '€0',
    distance: '0 km',
    joinedDate: '-',
  });
  const [loading, setLoading] = useState(true);

  const fetchVTCStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vtc_settings')
        .select('setting_key, setting_value');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.setting_key] = item.setting_value;
        });
        
        setStats({
          members: settingsMap['members_count'] || '0',
          revenue: settingsMap['total_revenue'] || '€0',
          distance: settingsMap['distance_covered'] || '0 km',
          joinedDate: settingsMap['founded_date'] || '-',
        });
      }
    } catch (err) {
      console.error('Error fetching VTC stats:', err);
      setStats({
        members: '-',
        revenue: '-',
        distance: '-',
        joinedDate: '-',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVTCStats();
  }, []);

  const statItems = [
    { icon: Users, value: stats.members, label: 'Active Members', suffix: '' },
    { icon: Truck, value: stats.revenue, label: 'Total Revenue', suffix: '' },
    { icon: Route, value: stats.distance, label: 'Distance Covered', suffix: '' },
    { icon: Calendar, value: stats.joinedDate, label: 'Founded', suffix: '' },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      {/* Animated background particles - hidden on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
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
        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 animate-slide-up hover:glow-border transition-all duration-500">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 animate-fade-in">
              <span className="text-foreground">Our </span>
              <span className="text-primary glow-text animate-pulse-glow">Statistics</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Meth VTC achievements
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {statItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-secondary/50 border border-border/30 hover:border-primary/50 transition-all duration-500 group hover:-translate-y-2 hover:glow-border animate-scale-in"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl bg-primary/10 text-primary mb-3 sm:mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary glow-text mb-1 sm:mb-2 group-hover:animate-pulse-glow break-all">
                    {loading ? (
                      <div className="h-8 sm:h-10 w-16 sm:w-20 mx-auto bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        {item.value}
                        {item.suffix}
                      </>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
