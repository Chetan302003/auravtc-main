import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Milestone,
  Truck,
  DollarSign,
  Users,
  Activity,
  Terminal,
  Share2,
  LineChart,
  Calendar,
  ShieldCheck,
  Trophy,
  ArrowRight,
  Download,
  ChevronRight,
  Zap,
  LayoutDashboard,
  Fuel,
  TrendingUp,
  Loader2
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';

// ─── Hardcoded Supabase Client ─────────────────────────────────────────────────
const hubSupabase = createClient(
  'https://kmaiqezwmmpmprpektvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttYWlxZXp3bW1wbXBycGVrdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMTEyODMsImV4cCI6MjA4MzY4NzI4M30.nglWvG-B_KnoniDWJSGhzyNRbQML8XoxsPgVNovbctg'
);

// ─── Types ─────────────────────────────────────────────────────────────────────
interface FleetStats {
  id: string;
  type: string;
  total_distance: number;
  total_deliveries: number;
  total_fuel: number;
  total_income: number;
  total_expenses: number;
  total_profit: number;
  active_drivers: number;
  avg_load_weight: number;
  last_updated: string;
}

interface LeaderboardEntry {
  id: string;
  type: string;
  username: string;
  avatar_url: string;
  total_distance: number;
  total_deliveries: number;
  total_earnings: number;
  last_updated: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) => n?.toLocaleString('en-US', { maximumFractionDigits: 1 }) ?? '—';
const fmtCurrency = (n: number) =>
  n != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
    : '—';

const rankStyle = (i: number) =>
  i === 0 ? { color: 'text-yellow-500', bg: 'bg-yellow-500/20' }
    : i === 1 ? { color: 'text-slate-300', bg: 'bg-slate-300/20' }
      : i === 2 ? { color: 'text-orange-700', bg: 'bg-orange-700/20' }
        : { color: 'text-muted-foreground', bg: 'bg-muted/20' };

// ─── Static Features ───────────────────────────────────────────────────────────
const features = [
  { icon: Activity,    title: 'Live Telemetry',  description: 'Sub-millisecond data sync for fuel, speed, and location tracking across all European routes.', color: 'border-primary' },
  { icon: Terminal,    title: 'Auto Job Logger',  description: 'Forget manual entry. Every delivery is captured, verified, and ranked instantly on the grid.', color: 'border-emerald-500' },
  { icon: Share2,      title: 'Rich Presence',    description: 'Broadcast your current truck model, cargo, and ETA directly to your Discord status.', color: 'border-green-400' },
  { icon: LineChart,   title: 'Fleet Analytics',  description: 'Deep dive into fuel efficiency, damage reports, and driver ROI with visualized charts.', color: 'border-yellow-500' },
  { icon: Calendar,    title: 'Event Calendar',   description: 'Coordinate massive convoys and community events with integrated sign-up systems.', color: 'border-red-500' },
  { icon: ShieldCheck, title: 'Role Security',    description: 'Granular permissions for managers, dispatchers, and drivers using Discord OAuth2.', color: 'border-primary' },
];

// ─── Component ─────────────────────────────────────────────────────────────────
const Hub = () => {
  // ✅ Correct separate state for fleet stats and leaderboard
  const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState('https://github.com/Chetan302003/Aura-Hub/releases/latest');

  // Fetch latest GitHub release
  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/Chetan302003/Aura-Hub/releases/latest');
        const data = await response.json();
        const exeAsset = data.assets?.find((asset: any) => asset.name.endsWith('.exe'));
        if (exeAsset) setDownloadUrl(exeAsset.browser_download_url);
      } catch (error) {
        console.error('Error fetching latest release:', error);
      }
    };
    fetchLatestRelease();
  }, []);

  // Fetch data + Realtime
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        // Fleet stats row
        const { data: statsRow, error: statsError } = await hubSupabase
          .from('hub_broadcast')
          .select('*')
          .eq('type', 'fleet_stats')
          .single();

        if (statsError) console.error('Stats error:', statsError);
        else setFleetStats(statsRow as FleetStats);

        // Leaderboard rows
        const { data: leaderboardRows, error: lbError } = await hubSupabase
          .from('hub_broadcast')
          .select('*')
          .eq('type', 'leaderboard')
          .order('total_distance', { ascending: false });

        if (lbError) console.error('Leaderboard error:', lbError);
        else setLeaderboard(leaderboardRows as LeaderboardEntry[]);

      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();

    const channel = hubSupabase
      .channel('hub-broadcast')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'hub_broadcast' },
        () => { fetchInitial(); }
      )
      .subscribe();

    return () => { hubSupabase.removeChannel(channel); };
  }, []);

  const statCards = [
    { icon: Milestone,   value: fleetStats ? `${fmt(fleetStats.total_distance)} km`  : '—', label: 'Total Distance',  color: 'text-primary' },
    { icon: Truck,       value: fleetStats ? fmt(fleetStats.total_deliveries)          : '—', label: 'Deliveries',      color: 'text-primary' },
    { icon: DollarSign,  value: fleetStats ? fmtCurrency(fleetStats.total_income)      : '—', label: 'Revenue',         color: 'text-yellow-400' },
    { icon: Users,       value: fleetStats ? String(fleetStats.active_drivers)         : '—', label: 'Active Drivers',  color: 'text-emerald-400' },
    { icon: Fuel,        value: fleetStats ? `${fmt(fleetStats.total_fuel)} L`         : '—', label: 'Fuel Consumed',   color: 'text-orange-400' },
    { icon: TrendingUp,  value: fleetStats ? fmtCurrency(fleetStats.total_profit)      : '—', label: 'Net Profit',      color: 'text-green-400' },
  ];

  return (
    <PageTransition>
      <Layout>
        <div className="container mx-auto px-4 py-12 md:py-20 relative">

          {/* ── Hero ── */}
          <section className="flex flex-col items-center text-center mb-32 relative">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            {/* <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-widest uppercase mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              ⚡ Powered by Rust + Tauri
            </motion.div> */}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-none"
            >
              <span className="text-foreground">AURA VTC HUB </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl text-muted-foreground text-lg md:text-xl font-light mb-10 leading-relaxed"
            >
              A modern, ultra-performant trucking hub for ETS2 & ATS. Live telemetry, auto job logging, fleet analytics, and Discord integration—all in ~40MB RAM.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <a href="https://aurahub-web.vercel.app/login" target="_blank" rel="noopener noreferrer">
                <Button size="xl" className="rounded-xl shadow-primary/20 shadow-lg group">
                  Login to Hub <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="xl" className="rounded-xl group">
                  <Download className="mr-2 w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Download Desktop
                </Button>
              </a>
            </motion.div>
          </section>

          {/* ── Live Fleet Statistics ── */}
          <section className="mb-32">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Live Fleet Statistics
              </h2>
              {fleetStats?.last_updated && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Updated {new Date(fleetStats.last_updated).toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <stat.icon size={64} className={stat.color} />
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary mb-1" />
                    ) : (
                      <h3 className="text-3xl font-bold font-display text-white">{stat.value}</h3>
                    )}
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Features Grid ── */}
          <section className="mb-32">
            <div className="flex flex-col items-center mb-16">
              <h2 className="text-4xl font-display font-bold text-white mb-4">Tactical Engineering</h2>
              <div className="h-1 w-20 bg-primary rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`glass-card p-8 rounded-xl border-l-4 ${feature.color} hover:-translate-y-2 transition-all cursor-default group`}
                >
                  <div className="p-3 rounded-lg bg-background/50 border border-white/5 w-fit mb-6 group-hover:border-primary/30 transition-colors">
                    <feature.icon className="text-primary w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-display font-bold text-white mb-3 uppercase tracking-tight">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Top Drivers (Live) ── */}
          <section className="mb-32">
            <h2 className="text-3xl font-display font-bold text-white mb-10 flex items-center gap-4">
              <Trophy className="text-yellow-500" /> Top Drivers
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-muted-foreground text-center py-20">No drivers yet — be the first on the board.</p>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((driver, index) => {
                  const { color, bg } = rankStyle(index);
                  return (
                    <motion.div
                      key={driver.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="glass-card p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all border-white/5 hover:border-primary/20"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center font-display font-black ${color} border border-white/10`}>
                          {index + 1}
                        </div>
                        <div className="relative">
                          {driver.avatar_url ? (
                            <img
                              src={driver.avatar_url}
                              alt={driver.username}
                              className="w-12 h-12 rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-primary/50 bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                              {driver.username?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="absolute inset-0 rounded-full bg-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                           <p className="text-white font-bold text-lg">{driver.username}</p>
                            <p className=" text-primary text-[10px] uppercase tracking-tighter font-display">
                              <span className="text-white font-bold">{fmtCurrency(driver.total_earnings)}</span>
                               <span className="text-emerald-400 ml-1"> earned</span>
                            </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="hidden sm:block text-right">
                          <p className="text-white font-bold">{fmt(driver.total_distance)} km</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Distance</p>
                        </div>
                        <div className="hidden md:block text-right">
                          <p className="text-primary font-bold">{driver.total_deliveries}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Deliveries</p>
                        </div>
                        <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── CTA ── */}
          <section className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-12 overflow-hidden relative group border-primary/10 hover:border-primary/30 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              <div className="absolute -right-20 -bottom-20 opacity-10 rotate-12 scale-150 group-hover:rotate-0 transition-transform duration-1000">
                <LayoutDashboard size={400} className="text-primary" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="text-center md:text-left">
                  <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4">Ready to Hit the Road?</h2>
                  <p className="text-muted-foreground text-lg max-w-xl">Join the most advanced virtual trucking community today. Real-time logging, professional rank systems, and a community that never sleeps.</p>
                </div>
                <a href="https://aurahub-web.vercel.app/login" target="_blank" rel="noopener noreferrer">
                  <Button size="xl" className="rounded-xl px-12 py-8 text-xl shadow-primary/30 shadow-2xl hover:scale-105 transition-transform group">
                    Get Started <Zap className="ml-2 w-6 h-6 fill-black group-hover:scale-125 transition-transform" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </section>

          {/* ── Designer Credit ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 pb-10 text-center"
          >
            <p className="text-muted-foreground text-sm font-display tracking-widest uppercase opacity-50">
              Designed and developed by{' '}
              <a href="#" className="text-primary hover:glow-text-strong transition-all duration-300">Chetan</a>
            </p>
          </motion.div>

        </div>
      </Layout>
    </PageTransition>
  );
};

export default Hub;
