import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Wifi, 
  Calendar, 
  RefreshCw, 
  LogOut, 
  Settings,
  UserCheck,
  MapPin,
  Clock,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import ParticleBackground from '@/components/effects/ParticleBackground';
import AttendanceDownload from '@/components/admin/AttendanceDownload';
import SystemLogs from '@/components/admin/SystemLogs';
import SlotManagement from '@/components/admin/SlotManagement';
import GalleryManagement from '@/components/admin/GalleryManagement';
import VTCSettingsManagement from '@/components/admin/VTCSettingsManagement';
import UserManagement from '@/components/admin/UserManagement';
interface Member {
  id: string;
  tmp_id: number;
  username: string;
  avatar_url: string | null;
  vtc_role: string;
  total_convoys: number;
  last_seen_online: string | null;
  last_seen_server: string | null;
  is_active: boolean;
}

interface Event {
  id: number;
  name: string;
  start_at: string;
  server?: { id: number; name: string };
  attendances?: { confirmed: number };
  map?: string;
  departure?: { city: string; location: string };
  arrive?: { city: string; location: string };
}

interface Stats {
  totalMembers: number;
  onlineMembers: number;
  lastAttendancePercent: number;
  totalEvents: number;
}

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    onlineMembers: 0,
    lastAttendancePercent: 0,
    totalEvents: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingAttendance, setIsCheckingAttendance] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Role priority for sorting (TruckersMP roles - lower = higher priority)
  const rolePriority: Record<string, number> = {
    'Founder': 1,
    'Manager': 2,
    'Management': 3,
    'Human Resources': 4,
    'HR': 5,
    'Member': 6,
    'Driver': 7,
    'Trainee': 8,
    'Trial': 9,
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      // Fetch members
      const { data: membersData } = await supabase
        .from('members')
        .select('*')
        .eq('is_active', true);

      // Fetch events from TruckersMP API
      let eventsData: Event[] = [];
      try {
        const { data: apiData, error: apiError } = await supabase.functions.invoke('truckersmp-events');
        if (!apiError && apiData?.events) {
          eventsData = apiData.events.slice(0, 5);
        }
      } catch (e) {
        console.error('Failed to fetch TruckersMP events:', e);
      }

      // Sort members by role priority, then by username
      const sortedMembers = [...(membersData || [])].sort((a, b) => {
        const priorityA = rolePriority[a.vtc_role] ?? 99;
        const priorityB = rolePriority[b.vtc_role] ?? 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.username.localeCompare(b.username);
      });

      // Calculate stats - online if last_seen_online is within last 5 minutes
      const totalMembers = sortedMembers.length;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const onlineMembers = sortedMembers.filter(m => {
        if (!m.last_seen_online) return false;
        return new Date(m.last_seen_online) >= fiveMinutesAgo;
      }).length;

      setMembers(sortedMembers);
      setEvents(eventsData || []);
      setStats({
        totalMembers,
        onlineMembers,
        lastAttendancePercent: 0,
        totalEvents: eventsData?.length || 0
      });
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSyncMembers = async () => {
    if (!isAdmin) {
      toast.error('Only admins can sync members');
      return;
    }
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-vtc-members');
      
      if (error) throw error;
      
      toast.success(`Synced ${data?.synced || 0} members from TruckersMP`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync members');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCheckAttendance = async (eventId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can check attendance');
      return;
    }
    setIsCheckingAttendance(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-attendance', {
        body: { mode: 'attendance', eventId }
      });

      if (error) throw error;

      toast.success(`Attendance checked: ${data?.present || 0} present, ${data?.absent || 0} absent`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to check attendance');
    } finally {
      setIsCheckingAttendance(false);
    }
  };

  const handleRefreshOnlineStatus = async () => {
    if (!isAdmin) {
      toast.error('Only admins can refresh online status');
      return;
    }
    setIsCheckingAttendance(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-attendance', {
        body: { mode: 'status' }
      });

      if (error) throw error;

      toast.success(`Online status updated: ${data?.online ?? 0} online, ${data?.offline ?? 0} offline`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to refresh online status');
    } finally {
      setIsCheckingAttendance(false);
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    suffix = '', 
    delay = 0 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    suffix?: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-primary/20 hover:border-primary/40 hover:glow-border transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-1 truncate">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground group-hover:glow-text transition-all break-all">
            {value}{suffix}
          </p>
        </div>
        <div className="p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 relative">
        <ParticleBackground />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 mb-6 sm:mb-8"
          >
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 border border-primary/30">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground glow-text">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Welcome, <span className="break-all">{user?.email}</span>
                {isAdmin && <span className="ml-2 text-primary">(Admin)</span>}
                {!isAdmin && <span className="ml-2 text-muted-foreground">(Read-only)</span>}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {isAdmin && (
                <>
                  <Button
                    onClick={handleSyncMembers}
                    disabled={isSyncing}
                    className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 font-display text-xs sm:text-sm"
                    size="sm"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    )}
                    Sync
                  </Button>

                  <Button
                    onClick={handleRefreshOnlineStatus}
                    disabled={isCheckingAttendance}
                    className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 font-display text-xs sm:text-sm"
                    size="sm"
                  >
                    {isCheckingAttendance ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                    ) : (
                      <Wifi className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    )}
                    Refresh Status
                  </Button>
                </>
              )}
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-border/50 hover:border-destructive hover:text-destructive text-xs sm:text-sm"
                size="sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard 
              title="Total Members" 
              value={stats.totalMembers} 
              icon={Users} 
              delay={0.1}
            />
            <StatCard 
              title="Currently Online" 
              value={stats.onlineMembers} 
              icon={Wifi} 
              delay={0.2}
            />
            <StatCard 
              title="Last Attendance" 
              value={stats.lastAttendancePercent} 
              icon={UserCheck} 
              suffix="%" 
              delay={0.3}
            />
            <StatCard 
              title="Total Events" 
              value={stats.totalEvents} 
              icon={Calendar} 
              delay={0.4}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Members Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="lg:col-span-2 glass-card rounded-lg sm:rounded-xl border border-primary/20 overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-border/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-base sm:text-lg md:text-xl font-display font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="truncate">Members</span>
                  </h2>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <span>{members.length} total</span>
                    {lastRefresh && (
                      <>
                        <span className="text-border">•</span>
                        <Clock className="w-3 h-3" />
                        <span>Updated {lastRefresh.toLocaleTimeString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
               <div className="overflow-x-auto max-h-80 sm:max-h-96 min-h-0">
                {dataLoading ? (
                  <div className="flex items-center justify-center p-8 sm:p-12">
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">No members synced yet</p>
                    {isAdmin && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Click "Sync" to fetch from TruckersMP</p>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-secondary/30 sticky top-0">
                      <tr>
                        <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground">Member</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground hidden sm:table-cell">Role</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground hidden md:table-cell">Convoys</th>
                        <th className="text-left p-3 sm:p-4 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <img
                                src={member.avatar_url || '/placeholder.svg'}
                                alt={member.username}
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-primary/30 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">{member.username}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground sm:hidden truncate">{member.vtc_role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 hidden sm:table-cell">
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 capitalize truncate inline-block max-w-[80px] sm:max-w-none">
                              {member.vtc_role}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 text-muted-foreground hidden md:table-cell">{member.total_convoys}</td>
                          <td className="p-3 sm:p-4">
                            {(() => {
                              // Online = last_seen_online within 5 minutes
                              const lastSeenDate = member.last_seen_online ? new Date(member.last_seen_online) : null;
                              const currentTime = new Date();
                              const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);
                              const isOnline = lastSeenDate && lastSeenDate >= fiveMinutesAgo;
                              const now = new Date();

                              // Format relative time
                              const formatRelativeTime = (date: Date | null) => {
                                if (!date) return null;
                                const mins = Math.floor((now.getTime() - date.getTime()) / 60000);
                                if (mins < 1) return 'just now';
                                if (mins < 60) return `${mins}m ago`;
                                const hours = Math.floor(mins / 60);
                                if (hours < 24) return `${hours}h ago`;
                                const days = Math.floor(hours / 24);
                                return `${days}d ago`;
                              };

                              if (isOnline) {
                                return (
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1 sm:gap-1.5">
                                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                                      <span className="text-[10px] sm:text-xs text-primary truncate max-w-[60px] sm:max-w-none">
                                        {member.last_seen_server || 'Online'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div className="flex flex-col">
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">Offline</span>
                                  {lastSeenDate && (
                                    <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">
                                      {formatRelativeTime(lastSeenDate)}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Recent Events */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="glass-card rounded-lg sm:rounded-xl border border-primary/20 overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-b border-border/30">
                  <h2 className="text-base sm:text-lg md:text-xl font-display font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Recent Events
                  </h2>
                </div>
                
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-56 sm:max-h-64 overflow-y-auto">
                  {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                      <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground mb-2 sm:mb-3" />
                      <p className="text-muted-foreground text-xs sm:text-sm">No upcoming events</p>
                    </div>
                  ) : (
                    events.map((event) => {
                      const eventDate = new Date(event.start_at);
                      const isUpcoming = eventDate > new Date();
                      const isToday = eventDate.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={event.id}
                          className="p-3 sm:p-4 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-medium text-foreground text-xs sm:text-sm line-clamp-2">{event.name}</h3>
                            <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full capitalize whitespace-nowrap ${
                              isToday 
                                ? 'bg-yellow-500/20 text-yellow-500' 
                                : isUpcoming
                                ? 'bg-primary/20 text-primary'
                                : 'bg-secondary text-muted-foreground'
                            }`}>
                              {isToday ? 'Today' : isUpcoming ? 'Upcoming' : 'Past'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {eventDate.toLocaleDateString()} {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {event.server?.name && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                <span className="truncate">{event.server.name}</span>
                              </span>
                            )}
                          </div>
                          {event.departure?.city && event.arrive?.city && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-2 truncate">
                              {event.departure.city} → {event.arrive.city}
                            </p>
                          )}
                          {event.attendances?.confirmed !== undefined && (
                            <p className="text-[10px] sm:text-xs text-primary/70 mt-1">
                              {event.attendances.confirmed} confirmed
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>

              {/* Attendance Download */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <AttendanceDownload isAdmin={isAdmin} />
              </motion.div>
            </div>
          </div>
          
          {/* VTC Settings Management - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.72 }}
            className="mt-6"
          >
            <VTCSettingsManagement isAdmin={isAdmin} />
          </motion.div>

          {/* Slot Management - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="mt-6"
          >
            <SlotManagement isAdmin={isAdmin} />
          </motion.div>

          {/* Gallery Management - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.78 }}
            className="mt-6"
          >
          <GalleryManagement isAdmin={isAdmin} />
          </motion.div>

          {/* User Management - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.79 }}
            className="mt-6"
          >
            <UserManagement isAdmin={isAdmin} />
          </motion.div>

          {/* System Logs - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6"
          >
            <SystemLogs isAdmin={isAdmin}  />
          </motion.div>
          {/* User Info Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 sm:mt-8 glass-card rounded-lg sm:rounded-xl p-4 sm:p-6 border border-primary/20"
          >
            <h3 className="text-base sm:text-lg font-display font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Your Account
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-muted-foreground mb-1">User ID</p>
                <p className="font-mono text-[10px] sm:text-xs text-foreground break-all bg-secondary/50 p-1.5 sm:p-2 rounded">{user?.id}</p>
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground mb-1">Email</p>
                <p className="text-foreground truncate">{user?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p className="text-foreground text-xs sm:text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Last Sign In</p>
                <p className="text-foreground text-xs sm:text-sm">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
