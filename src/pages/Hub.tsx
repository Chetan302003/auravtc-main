import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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
  LayoutDashboard
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';

const stats = [
  { icon: Milestone, value: '152.4K km', label: 'Total Distance', color: 'text-primary' },
  { icon: Truck, value: '3,847', label: 'Deliveries', color: 'text-primary' },
  { icon: DollarSign, value: '$2.1M', label: 'Revenue', color: 'text-yellow-400' },
  { icon: Users, value: '42', label: 'Active Drivers', color: 'text-emerald-400' },
];

const features = [
  { 
    icon: Activity, 
    title: 'Live Telemetry', 
    description: 'Sub-millisecond data sync for fuel, speed, and location tracking across all European routes.',
    color: 'border-primary'
  },
  { 
    icon: Terminal, 
    title: 'Auto Job Logger', 
    description: 'Forget manual entry. Every delivery is captured, verified, and ranked instantly on the grid.',
    color: 'border-emerald-500'
  },
  { 
    icon: Share2, 
    title: 'Rich Presence', 
    description: 'Broadcast your current truck model, cargo, and ETA directly to your Discord status.',
    color: 'border-green-400'
  },
  { 
    icon: LineChart, 
    title: 'Fleet Analytics', 
    description: 'Deep dive into fuel efficiency, damage reports, and driver ROI with visualized charts.',
    color: 'border-yellow-500'
  },
  { 
    icon: Calendar, 
    title: 'Event Calendar', 
    description: 'Coordinate massive convoys and community events with integrated sign-up systems.',
    color: 'border-red-500'
  },
  { 
    icon: ShieldCheck, 
    title: 'Role Security', 
    description: 'Granular permissions for managers, dispatchers, and drivers using Discord OAuth2.',
    color: 'border-primary'
  },
];

const topDrivers = [
  { 
    rank: 1, 
    name: 'RoadReaper_99', 
    tier: 'Platinum Elite', 
    distance: '12,450 km', 
    deliveries: 84, 
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC53XgaotiOQzIuaB4K9_fqmFKg6zmJRE-W79lOxvluW7sytwJtmynhXxqkFYl2gFErLdAoaWz1POD4uCwBZzTAN7GsrmwgDXWSzAI3eV5LGI2Ee3R_FlL7UVDyBAWORUbA6eI7LDqPtslP9qslPq06_Om4Ubn5mKVbzgY9QabCd4XYbhnubJrh7oZPgXHgTND8uBsznDaw91H2YFERMrcVuEKKkwLVd84M9zmoEG3ms6wki8dAr2u-fnl_cdtgyWnl_27TyW8EJcql',
    rankColor: 'text-yellow-500', 
    rankBg: 'bg-yellow-500/20' 
  },
  { 
    rank: 2, 
    name: 'TruckMaster_NL', 
    tier: 'Gold Fleet', 
    distance: '10,122 km', 
    deliveries: 72, 
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjWBiY6KXMU5TEK24b-apfl-kXbXDsVp0WXYnE2RxJCpO8sxdhWQYSITRkaHvj8gGrzwJbvo8ToRBYTQYCs6wYAy0ErlPcScWQJCOPkIbWtxWn657-PaqFnAbrVqnm2UgJriNfkmanjZkDTTlF4IN1ZIZbKvA9jpiVv6R_kDrIou-h7Pnen3W-Xi8QaAwWjSkEEMf8LIzdWdzt7uqR9QtJhZK0fQX-iBk2r80EnEhmlWjhbJJyGmyjsGG1vbskX34Hu02fTgEa563r',
    rankColor: 'text-slate-300', 
    rankBg: 'bg-slate-300/20' 
  },
  { 
    rank: 3, 
    name: 'DieselQueen', 
    tier: 'Silver Wing', 
    distance: '8,890 km', 
    deliveries: 61, 
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSaAb0OmBqdoA9B53mByMrVKaLgOYKibtsr5STolaslUin_OFxBYSnn8fFvpMPTTfdj0YEbf3ExUoisxBrhRg4Ggu1C2ve8E7tjrmNFO_vqdkX-XTyzB-XZGJJui0tgb3vzEba1DHQ3UUv90TNdyOTtUDtaaYTaY0bplzg0fY8hOurVscCLQbGr3aHn2f5GKMnPXFHB0CObzG4QOoZ-owqLbxA-lahLrSfCObechNubEkuITTbLrlpKt6sbUyoieg9WcDhCsUuSSA',
    rankColor: 'text-orange-700', 
    rankBg: 'bg-orange-700/20' 
  },
  { 
    rank: 4, 
    name: 'OldSchoolPete', 
    tier: 'Standard Tier', 
    distance: '5,200 km', 
    deliveries: 45, 
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApNc60KqPIFQyDJUHtWl7DWxz-utsgIgC3vN8NLCGqRdUZ8KiCLNsBSsWoLUIML8h6Mp-vgk4S5gtlq0VmCRmZ3d4pixCII8c1KK6LCEpwQX81XJNl4VkttHJTaU98HgozJxIxEySZPirABZRYeKIK3MbA2Cctn70A3GIDyTyNOLMHIZLd6hqXjn6aoupJjV4TTMY90oCXhytlhoTlO3DcfJgFua5VSQdTfgm8a3bjGUpnHCbJ6-DEh1i3LcJ6f-GkyvXDdt9uRbG',
    rankColor: 'text-muted-foreground', 
    rankBg: 'bg-muted/20' 
  },
];

const Hub = () => {
  const [downloadUrl, setDownloadUrl] = useState('https://github.com/Chetan302003/Aura-Hub/releases/latest');

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/Chetan302003/Aura-Hub/releases/latest');
        const data = await response.json();
        const exeAsset = data.assets?.find((asset: any) => asset.name.endsWith('.exe'));
        if (exeAsset) {
          setDownloadUrl(exeAsset.browser_download_url);
        }
      } catch (error) {
        console.error('Error fetching latest release:', error);
      }
    };
    fetchLatestRelease();
  }, []);

  return (
    <PageTransition>
      <Layout>
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          {/* Hero Section */}
          <section className="flex flex-col items-center text-center mb-32 relative">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-widest uppercase mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              ⚡ Powered by Rust + Tauri
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-none"
            >
             <span className="text-foreground">AURA VTC</span>{' '}
             <span className="text-primary glow-text-strong">HUB</span>
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

          {/* Live Fleet Statistics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
            {stats.map((stat, index) => (
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
                  <h3 className="text-3xl font-bold font-display text-white">{stat.value}</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-widest">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Features Grid */}
          <section className="mb-32">
            <div className="flex flex-col items-center mb-16">
              <h2 className="text-4xl font-display font-bold text-white mb-4">Tactical Engineering</h2>
              <div className="h-1 w-20 bg-primary rounded-full"></div>
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

          {/* Top Drivers */}
          <section className="mb-32">
            <h2 className="text-3xl font-display font-bold text-white mb-10 flex items-center gap-4">
              <Trophy className="text-yellow-500" /> Top Drivers
            </h2>
            
            <div className="space-y-4">
              {topDrivers.map((driver, index) => (
                <motion.div
                  key={driver.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all border-white/5 hover:border-primary/20"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-10 h-10 rounded-full ${driver.rankBg} flex items-center justify-center font-display font-black ${driver.rankColor} border border-white/10`}>
                      {driver.rank}
                    </div>
                    <div className="relative">
                      <img src={driver.avatar} alt={driver.name} className="w-12 h-12 rounded-full border-2 border-primary/50 group-hover:border-primary transition-colors" />
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{driver.name}</p>
                      <p className="text-primary text-[10px] uppercase tracking-tighter font-display">{driver.tier}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="hidden sm:block text-right">
                      <p className="text-white font-bold">{driver.distance}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Range</p>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-primary font-bold">{driver.deliveries}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Deliveries</p>
                    </div>
                    <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Card */}
          <section className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-12 overflow-hidden relative group border-primary/10 hover:border-primary/30 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
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

          {/* Designer Credit */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 pb-10 text-center"
          >
            <p className="text-muted-foreground text-sm font-display tracking-widest uppercase opacity-50">
              Designed and developed by{" "}
              <a href="#" className="text-primary hover:glow-text-strong transition-all duration-300">
                Chetan
              </a>
            </p>
          </motion.div>
        </div>
      </Layout>
    </PageTransition>
  );
};

export default Hub;
