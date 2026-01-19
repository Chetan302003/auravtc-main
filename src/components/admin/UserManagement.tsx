import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Loader2,
  UserPlus,
  Trash2,
  Shield,
  Users,
  Eye,
  EyeOff,
  KeyRound,
  UserX,
  UserCheck,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  roles: AppRole[];
  is_banned?: boolean;
}

interface UserManagementProps {
  isAdmin: boolean;
}

const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: 'Full access to all features',
  moderator: 'Can moderate content',
  user: 'Basic user access',
  hr: 'Manage members and users',
  media: 'Manage gallery and media content',
  event: 'Manage events and slot bookings',
  driver: 'Driver role with limited access',
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  moderator: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  user: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  hr: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  media: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  event: 'bg-green-500/20 text-green-400 border-green-500/30',
  driver: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const UserManagement = ({ isAdmin }: UserManagementProps) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRoles = (rolesData || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role);
        
        return {
          id: profile.id,
          email: profile.display_name || 'No email',
          display_name: profile.display_name,
          created_at: profile.created_at,
          roles: userRoles,
        };
      });

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) {
      toast.error('Email and password are required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setActionLoading('create');
    try {
      // Use the admin edge function to create user without affecting current session
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'create',
          email: newEmail,
          password: newPassword,
          display_name: newDisplayName || newEmail,
          role: selectedRole,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewDisplayName('');
      setSelectedRole('user');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
          } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserId || !resetPassword) {
      toast.error('Password is required');
      return;
    }

    if (resetPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setActionLoading('reset');
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'reset_password',
          user_id: selectedUserId,
          new_password: resetPassword,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Password reset successfully');
      setIsResetPasswordDialogOpen(false);
      setResetPassword('');
      setSelectedUserId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    setActionLoading(`deactivate-${userId}`);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'deactivate',
          user_id: userId,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('User deactivated');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: true } : u));
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    setActionLoading(`reactivate-${userId}`);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'reactivate',
          user_id: userId,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('User reactivated');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: false } : u));
    } catch (err: any) {
      toast.error(err.message || 'Failed to reactivate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddRole = async (userId: string, role: AppRole) => {
    setActionLoading(`add-${userId}`);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast.success(`Role "${role}" added`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    setActionLoading(`remove-${userId}`);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast.success(`Role "${role}" removed`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove role');
    } finally {
      setActionLoading(null);
    }
  };

  const openResetPasswordDialog = (userId: string) => {
    setSelectedUserId(userId);
    setResetPassword('');
    setIsResetPasswordDialogOpen(true);
      };

  if (!isAdmin) {
    return (
      <div className="glass-card rounded-xl border border-primary/20 p-6">
        <p className="text-muted-foreground text-center">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-primary/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          User Management
        </h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with a specific role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  placeholder="John Doe"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - {ROLE_DESCRIPTIONS.admin}</SelectItem>
                    <SelectItem value="hr">HR - {ROLE_DESCRIPTIONS.hr}</SelectItem>
                    <SelectItem value="media">Media - {ROLE_DESCRIPTIONS.media}</SelectItem>
                    <SelectItem value="event">Event - {ROLE_DESCRIPTIONS.event}</SelectItem>
                    <SelectItem value="driver">Driver - {ROLE_DESCRIPTIONS.driver}</SelectItem>
                    <SelectItem value="user">User - {ROLE_DESCRIPTIONS.user}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={actionLoading === 'create'}>
                {actionLoading === 'create' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Enter a new password for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password *</label>
              <div className="relative">
                <Input
                  type={showResetPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={actionLoading === 'reset'}>
              {actionLoading === 'reset' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Legend */}
      <div className="px-4 sm:px-6 py-3 bg-secondary/20 border-b border-border/30">
        <p className="text-xs text-muted-foreground mb-2">Role Access:</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={ROLE_COLORS.admin}>Admin: All</Badge>
          <Badge variant="outline" className={ROLE_COLORS.hr}>HR: Users & Members</Badge>
          <Badge variant="outline" className={ROLE_COLORS.media}>Media: Gallery</Badge>
          <Badge variant="outline" className={ROLE_COLORS.event}>Event: Slots & Bookings</Badge>
          <Badge variant="outline" className={ROLE_COLORS.driver}>Driver: Limited</Badge>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No users found. Create a user to get started.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-border/30 ${
                  user.is_banned ? 'bg-red-500/10' : 'bg-secondary/30'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {user.display_name || 'No name'}
                    </p>
                    {user.roles.includes('admin') && (
                      <Shield className="w-4 h-4 text-red-400" />
                                          )}
                    {user.is_banned && (
                      <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                        Deactivated
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.id}</p>
                </div>

                {/* Current roles */}
                <div className="flex flex-wrap gap-1">
                  {user.roles.length === 0 ? (
                    <Badge variant="outline" className="text-xs">No roles</Badge>
                  ) : (
                    user.roles.map((role) => (
                      <Badge 
                        key={role} 
                        variant="outline" 
                        className={`text-xs cursor-pointer ${ROLE_COLORS[role]}`}
                        onClick={() => handleRemoveRole(user.id, role)}
                        title="Click to remove"
                      >
                        {role} ×
                      </Badge>
                    ))
                  )}
                </div>

                {/* Add role selector */}
                <Select 
                  onValueChange={(role) => handleAddRole(user.id, role as AppRole)}
                  disabled={!!actionLoading}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Add role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(['admin', 'hr', 'media', 'event', 'driver', 'user'] as AppRole[])
                      .filter(role => !user.roles.includes(role))
                      .map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openResetPasswordDialog(user.id)}>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.is_banned ? (
                      <DropdownMenuItem 
                        onClick={() => handleReactivateUser(user.id)}
                        className="text-green-500"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Reactivate User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        onClick={() => handleDeactivateUser(user.id)}
                        className="text-destructive"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Deactivate User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
