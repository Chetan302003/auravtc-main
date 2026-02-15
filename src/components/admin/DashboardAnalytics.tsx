import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, Users, Calendar, Image } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DashboardAnalyticsProps {
  isAdmin: boolean;
}

interface AnalyticsData {
  bookingStats: { status: string; count: number }[];
  attendanceTrends: { date: string; present: number; absent: number }[];
  memberActivity: { role: string; count: number }[];
  totalBookings: number;
  totalGalleryItems: number;
  totalEvents: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))', 'hsl(var(--secondary))', '#22c55e', '#f59e0b', '#ef4444'];

const DashboardAnalytics = ({ isAdmin }: DashboardAnalyticsProps) => {
  const [data, setData] = useState<AnalyticsData>({
    bookingStats: [],
    attendanceTrends: [],
    memberActivity: [],
    totalBookings: 0,
    totalGalleryItems: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch booking stats by status
      const { data: bookings } = await supabase
        .from('slot_bookings')
        .select('status');

      const bookingCounts: Record<string, number> = {};
      bookings?.forEach((b) => {
        bookingCounts[b.status] = (bookingCounts[b.status] || 0) + 1;
      });
      const bookingStats = Object.entries(bookingCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }));

      // Fetch attendance trends (last 7 events)
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('is_present, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      // Group by date
      const attendanceByDate: Record<string, { present: number; absent: number }> = {};
      attendanceData?.forEach((a) => {
        const date = new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!attendanceByDate[date]) {
          attendanceByDate[date] = { present: 0, absent: 0 };
        }
        if (a.is_present) {
          attendanceByDate[date].present++;
        } else {
          attendanceByDate[date].absent++;
        }
      });
      const attendanceTrends = Object.entries(attendanceByDate)
        .slice(0, 7)
        .reverse()
        .map(([date, counts]) => ({ date, ...counts }));

      // Fetch member activity by role
      const { data: members } = await supabase
        .from('members')
        .select('vtc_role')
        .eq('is_active', true);

      const roleCounts: Record<string, number> = {};
      members?.forEach((m) => {
        roleCounts[m.vtc_role] = (roleCounts[m.vtc_role] || 0) + 1;
      });
      const memberActivity = Object.entries(roleCounts).map(([role, count]) => ({
        role,
        count,
      }));

      // Totals
      const { count: totalGalleryItems } = await supabase
        .from('gallery_items')
        .select('*', { count: 'exact', head: true });

      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      setData({
        bookingStats,
        attendanceTrends,
        memberActivity,
        totalBookings: bookings?.length || 0,
        totalGalleryItems: totalGalleryItems || 0,
        totalEvents: totalEvents || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl border border-primary/20 p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-primary/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/30">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Dashboard Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of bookings, attendance, and member activity
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{data.totalEvents}</p>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{data.totalBookings}</p>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 text-center">
            <Image className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{data.totalGalleryItems}</p>
            <p className="text-xs text-muted-foreground">Gallery Items</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/30 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {data.attendanceTrends.reduce((acc, d) => acc + d.present, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Attendances</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Booking Status Chart */}
          <div className="p-4 rounded-lg bg-secondary/20 border border-border/30">
            <h3 className="text-sm font-medium text-foreground mb-4">Booking Status Distribution</h3>
            {data.bookingStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.bookingStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.bookingStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No booking data yet
              </div>
            )}
          </div>

          {/* Attendance Trends Chart */}
          <div className="p-4 rounded-lg bg-secondary/20 border border-border/30">
            <h3 className="text-sm font-medium text-foreground mb-4">Attendance Trends</h3>
            {data.attendanceTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="present" stroke="hsl(var(--primary))" strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Absent" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No attendance data yet
              </div>
            )}
          </div>

          {/* Member Distribution Chart */}
          <div className="p-4 rounded-lg bg-secondary/20 border border-border/30 lg:col-span-2">
            <h3 className="text-sm font-medium text-foreground mb-4">Member Distribution by Role</h3>
            {data.memberActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.memberActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="role" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Members" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No member data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
