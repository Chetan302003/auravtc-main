import { Users, Truck, Route, Calendar } from 'lucide-react';

interface VTCStatsPreviewProps {
  settings: {
    members_count: string;
    total_revenue: string;
    distance_covered: string;
    founded_date: string;
  };
}

const VTCStatsPreview = ({ settings }: VTCStatsPreviewProps) => {
  const statItems = [
    { icon: Users, value: settings.members_count, label: 'Active Members' },
    { icon: Truck, value: settings.total_revenue, label: 'Total Revenue' },
    { icon: Route, value: settings.distance_covered, label: 'Distance Covered' },
    { icon: Calendar, value: settings.founded_date, label: 'Founded' },
  ];

  return (
    <div className="mt-6 p-4 rounded-xl bg-gradient-to-b from-primary/5 via-transparent to-transparent border border-dashed border-primary/30">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-medium text-primary uppercase tracking-wider">Live Preview</span>
      </div>
      
      <div className="glass-card rounded-2xl p-4 sm:p-6 border border-border/30">
        <div className="text-center mb-4 sm:mb-6">
          <h3 className="font-display text-lg sm:text-xl font-bold mb-1">
            <span className="text-foreground">Our </span>
            <span className="text-primary glow-text">Statistics</span>
          </h3>
          <p className="text-xs text-muted-foreground">Meth VTC achievements</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="text-center p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border/30 hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="inline-flex p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform">
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="font-display text-base sm:text-lg md:text-xl font-bold text-primary glow-text mb-0.5 break-all">
                  {item.value || '-'}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VTCStatsPreview;
