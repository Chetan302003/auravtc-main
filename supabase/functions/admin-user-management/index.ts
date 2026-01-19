import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  action: 'create' | 'reset_password' | 'deactivate' | 'reactivate';
  email?: string;
  password?: string;
  display_name?: string;
  role?: string;
  user_id?: string;
  new_password?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify calling user is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callingUser) {
      throw new Error('Unauthorized');
    }

    // Check if calling user has admin or hr role
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id);

    const userRoles = roles?.map(r => r.role) || [];
    const canManageUsers = userRoles.includes('admin') || userRoles.includes('hr');
    
    if (!canManageUsers) {
      throw new Error('Insufficient permissions');
    }

    const body: CreateUserRequest = await req.json();
    const { action } = body;

    if (action === 'create') {
      const { email, password, display_name, role } = body;
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Create user using admin API (won't affect current session)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          display_name: display_name || email,
        },
      });

      if (createError) throw createError;

      // Assign role if provided
      if (newUser.user && role) {
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: newUser.user.id,
            role: role,
          });

        if (roleError) {
          console.error('Role assignment error:', roleError);
        }
      }

      return new Response(
        JSON.stringify({ success: true, user: { id: newUser.user?.id, email: newUser.user?.email } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reset_password') {
      const { user_id, new_password } = body;
      
      if (!user_id || !new_password) {
        throw new Error('User ID and new password are required');
      }

      if (new_password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { password: new_password }
      );

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, message: 'Password reset successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'deactivate') {
      const { user_id } = body;
      
      if (!user_id) {
        throw new Error('User ID is required');
      }

      // Deactivate by banning the user
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { ban_duration: '876000h' } // ~100 years = effectively permanent
      );

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, message: 'User deactivated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reactivate') {
      const { user_id } = body;
      
      if (!user_id) {
        throw new Error('User ID is required');
      }

      // Reactivate by removing ban
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { ban_duration: 'none' }
      );

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, message: 'User reactivated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin user management error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
