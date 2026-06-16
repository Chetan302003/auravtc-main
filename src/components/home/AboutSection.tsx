import { Truck, MapPin, Award, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const staticStats = [
  { icon: Truck, value: '500+', label: 'Deliveries Completed' },
  { icon: MapPin, value: '50+', label: 'Routes Covered' },
  { icon: Clock, value: '24/7', label: 'Support Available' },
];

const AboutSection = () => {
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchMemberCount = async () => {
      try {
        const { data } = await supabase.functions.invoke('truckersmp-members');
        setMemberCount(data?.members_count || data?.members?.length || 0);
      } catch (err) {
        console.error('Error fetching member count:', err);
      }
    };

    fetchMemberCount();
    const interval = setInterval(fetchMemberCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    ...staticStats,
    { icon: Award, value: memberCount !== null ? `${memberCount}+` : '...', label: 'Active Drivers' },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            <span className="text-foreground">Welcome to </span>
            <span className="text-primary glow-text">METH VTC</span>
          </h2>
          <div className="neon-line max-w-xs mx-auto animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card rounded-2xl p-8 space-y-4 hover:glow-border transition-all duration-500 hover:-translate-y-1">
              <h3 className="font-display text-2xl font-semibold text-primary animate-pulse-glow inline-block">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                🎮 We are proud to bring you an exceptional virtual trucking experience. Meth VTC represents the pinnacle of professional trucking on TruckersMP, where skill meets community.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                🎮 Our drivers embody unity, professionalism, and dedication. We ensure that every member feels valued and every journey is memorable.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                🎮 Join us today and become part of a family that shares your passion for virtual trucking. Together, we're building something extraordinary.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass-card rounded-2xl p-6 text-center group hover:border-primary/50 transition-all duration-500 hover:glow-border hover:-translate-y-2 animate-scale-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="font-display text-3xl font-bold text-primary glow-text mb-1 group-hover:animate-pulse-glow">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Join Us */}
        <div className="glass-card rounded-3xl p-8 md:p-12 animate-slide-up hover:glow-border transition-all duration-500" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-display text-3xl font-bold text-center mb-8">
            Why Choose <span className="text-primary animate-pulse-glow">Meth VTC</span>?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Professional Environment',
                description: 'Experience structured convoys, organized events, and a professional atmosphere that enhances your trucking experience.',
              },
              {
                title: 'Active Community',
                description: 'Join a vibrant community of like-minded truckers. Make friends, share experiences, and grow together.',
              },
              {
                title: 'Career Progression',
                description: 'Advance through ranks, earn achievements, and take on leadership roles as you prove your dedication.',
              },
            ].map((feature, index) => (
              <div key={feature.title} className="text-center space-y-3 group hover:-translate-y-2 transition-all duration-300" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                <h4 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
