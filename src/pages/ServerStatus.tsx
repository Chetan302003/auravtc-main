import { useEffect, useState } from 'react';
import { Server, Users, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client"; // Ensure you have your supabase client exported
import AnimatedList from '@/components/ui/AnimatedList';
interface ServerInfo {
  name: string;
  players: number;
  maxPlayers: number;
  queue: number;
  status: 'online' | 'offline' | 'maintenance';
  game: string;
}

// const mockServers: ServerInfo[] = [
//   { name: 'Simulation 1', players: 3421, maxPlayers: 4500, queue: 0, status: 'online', game: 'ETS2' },
//   { name: 'Simulation 2', players: 2187, maxPlayers: 4500, queue: 0, status: 'online', game: 'ETS2' },
//   { name: 'Arcade', players: 1542, maxPlayers: 4500, queue: 0, status: 'online', game: 'ETS2' },
//   { name: 'ProMods', players: 987, maxPlayers: 2000, queue: 45, status: 'online', game: 'ETS2' },
//   { name: 'ATS Simulation', players: 1234, maxPlayers: 2000, queue: 0, status: 'online', game: 'ATS' },
//   { name: 'ATS Arcade', players: 456, maxPlayers: 2000, queue: 0, status: 'online', game: 'ATS' },
// ];

const ServerStatus = () => {
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchServers = async () => {
    setLoading(true);
    try {
      // Call the Edge Function using the Supabase client
      const { data, error } = await supabase.functions.invoke('truckersmp-proxy');

      if (error) throw error;

      const liveServers: ServerInfo[] = data.response.map((s: any) => ({
        name: s.name,
        players: s.players,
        maxPlayers: s.maxplayers,
        queue: s.queue,
        status: s.online ? 'online' : 'offline',
        game: s.game,
      }));

      setServers(liveServers);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error via Edge Function:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const totalPlayers = servers.reduce((sum, s) => sum + s.players, 0);

  const getStatusColor = (status: ServerInfo['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'offline':
        return 'text-red-400';
      case 'maintenance':
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: ServerInfo['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <PageTransition>
      <Layout>
        <section className="py-24 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-16 space-y-4 animate-slide-up">
              <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-display text-sm tracking-widest inline-block">
                LIVE STATUS
              </span>
              <h1 className="font-display text-5xl md:text-6xl font-bold">
                <span className="text-foreground">Server </span>
                <span className="text-primary glow-text">Status</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Real-time TruckersMP server information
              </p>
              <div className="neon-line max-w-xs mx-auto" />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
              <div className="glass-card rounded-xl p-4 text-center">
                <Server className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-primary">{servers.length}</div>
                <div className="text-sm text-muted-foreground">Servers</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-primary">
                  {loading ? '...' : totalPlayers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Players Online</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-green-400">
                  {servers.filter((s) => s.status === 'online').length}
                </div>
                <div className="text-sm text-muted-foreground">Online</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <div className="font-display text-lg font-bold text-foreground">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--'}
                </div>
                <div className="text-sm text-muted-foreground">Last Update</div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="text-center mb-8">
              <Button variant="outline" onClick={fetchServers} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Server List */}
            {/* Server List */}
            <div className="grid gap-4 max-w-4xl mx-auto w-full">
              {loading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                      <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <AnimatedList
                  // We pass the array of server objects
                  items={servers}
                  onItemSelect={(server) => console.log("Selected server:", server.name)}
                  showGradients={true}
                  enableArrowNavigation={true}
                  displayScrollbar={true}
                  className="lenis-prevent"
                  // Assuming AnimatedList allows a custom render function for items:
                  renderItem={(server: ServerInfo) => (
                    <div className="glass-card rounded-xl p-6 hover:border-primary/50 transition-all duration-300 w-full mb-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(server.status)}
                          <div>
                            <h3 className="font-display text-lg font-bold text-foreground">
                              {server.name}
                            </h3>
                            <span className="text-sm text-muted-foreground">{server.game}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="font-display text-xl font-bold text-primary">
                              {server.players.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              / {server.maxPlayers.toLocaleString()}
                            </div>
                          </div>

                          {server.queue > 0 && (
                            <div className="text-center">
                              <div className="font-display text-lg font-bold text-yellow-400">
                                {server.queue}
                              </div>
                              <div className="text-xs text-muted-foreground">Queue</div>
                            </div>
                          )}

                          <div className="w-32 hidden md:block">
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${(server.players / server.maxPlayers) * 100}%` }}
                              />
                            </div>
                          </div>

                          <span className={`text-sm font-medium capitalize ${getStatusColor(server.status)}`}>
                            {server.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                />
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              {/* Data refreshes automatically every 60 seconds */}
            </p>
          </div>
        </section>
      </Layout>
    </PageTransition>
  );
};

export default ServerStatus;
