import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Save, Loader2, Users, Truck, Route, Calendar, Eye, UserCheck } from 'lucide-react';
import VTCStatsPreview from './VTCStatsPreview';

interface VTCSettingsManagementProps {
  isAdmin: boolean;
}

const VTCSettingsManagement = ({ isAdmin }: VTCSettingsManagementProps) => {
  const [settings, setSettings] = useState({
    members_count: '0',
    total_revenue: '€0',
    distance_covered: '0 km',
    founded_date: 'Est. 2024',
  });
  const [attendanceEnabled, setAttendanceEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingAttendance, setTogglingAttendance] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vtc_settings')
        .select('setting_key, setting_value');
      
      if (error) throw error;
      
      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.setting_key] = item.setting_value;
        });
        setSettings({
          members_count: settingsMap['members_count'] || '0',
          total_revenue: settingsMap['total_revenue'] || '€0',
          distance_covered: settingsMap['distance_covered'] || '0 km',
          founded_date: settingsMap['founded_date'] || 'Est. 2024',
        });
        setAttendanceEnabled(settingsMap['attendance_enabled'] !== 'false');
      }
    } catch (error) {
      console.error('Error fetching VTC settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('vtc_settings')
          .update({ setting_value: update.setting_value })
          .eq('setting_key', update.setting_key);
        
        if (error) throw error;
      }

      toast.success('VTC settings updated successfully');
    } catch (error: any) {
      console.error('Error saving VTC settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
          }
  };

  const handleToggleAttendance = async (enabled: boolean) => {
    setTogglingAttendance(true);
    try {
      const { data: existing } = await supabase
        .from('vtc_settings')
        .select('id')
        .eq('setting_key', 'attendance_enabled')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('vtc_settings')
          .update({ setting_value: enabled.toString() })
          .eq('setting_key', 'attendance_enabled');
      } else {
        await supabase
          .from('vtc_settings')
          .insert({ setting_key: 'attendance_enabled', setting_value: enabled.toString() });
      }
      
      setAttendanceEnabled(enabled);
      toast.success(`Attendance system ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error('Failed to update attendance setting');
    } finally {
      setTogglingAttendance(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="glass-card rounded-xl border border-primary/20 p-6">
        <p className="text-muted-foreground text-center">Admin access required</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl border border-primary/20 p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-primary/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/30">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          VTC Statistics Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the statistics displayed on the homepage
        </p>
      </div>
        {/* Attendance System Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Attendance System</p>
              <p className="text-xs text-muted-foreground">Enable/disable automatic attendance checking</p>
            </div>
          </div>
          <Switch
            checked={attendanceEnabled}
            onCheckedChange={handleToggleAttendance}
            disabled={togglingAttendance}
          />
        </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Active Members
            </Label>
            <Input
              value={settings.members_count}
              onChange={(e) => setSettings(prev => ({ ...prev, members_count: e.target.value }))}
              placeholder="e.g., 150"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Total Revenue
            </Label>
            <Input
              value={settings.total_revenue}
              onChange={(e) => setSettings(prev => ({ ...prev, total_revenue: e.target.value }))}
              placeholder="e.g., €1,500,000"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" />
              Distance Covered
            </Label>
            <Input
              value={settings.distance_covered}
              onChange={(e) => setSettings(prev => ({ ...prev, distance_covered: e.target.value }))}
              placeholder="e.g., 2.5M km"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Founded Date
            </Label>
            <Input
              value={settings.founded_date}
              onChange={(e) => setSettings(prev => ({ ...prev, founded_date: e.target.value }))}
              placeholder="e.g., Est. 2024"
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
       <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="w-3 h-3" />
        <span>Preview updates in real-time below</span>
         </div>
        </div>
        {/* Live Preview */}
        <VTCStatsPreview settings={settings} />
      </div>
    </div>
  );
};

export default VTCSettingsManagement;
