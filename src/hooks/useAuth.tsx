import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getPermissions, RolePermissions } from '@/config/permissions';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  role: string | null;
  permissions: RolePermissions;
  checkPermission: (permission: keyof RolePermissions) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions>(getPermissions(null));

  // Backward compatibility for existing code using isAdmin
  const isAdmin = checkPermission('view_dashboard');

  function checkPermission(permission: keyof RolePermissions): boolean {
    return permissions[permission];
  }

  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const userRole = data?.role || null;
      console.log('Fetched user role:', userRole);
      setRole(userRole);
      setPermissions(getPermissions(userRole));
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
      setPermissions(getPermissions(null));
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setLoading(true); // Ensure loading is true while fetching role
          fetchUserRole(session.user.id).then(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setRole(null);
          setPermissions(getPermissions(null));
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: displayName }
      }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    if (user) {
      setUser(null);
      setSession(null);
      setRole(null);
      setPermissions(getPermissions(null));
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAdmin,
      role,
      permissions,
      checkPermission,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
