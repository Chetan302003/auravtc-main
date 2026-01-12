import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VTC_ID = 75200;

interface TruckersmpMember {
  user_id: number;
  username: string;
  steam_id: string;
  role_id: number;
  role: string;
  joinDate: string;
}

interface TruckersmpPlayer {
  id: number;
  name: string;
  avatar: string;
  banned: boolean;
  vtc?: {
    id: number;
    name: string;
    tag: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting VTC member sync...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch VTC members from TruckersMP API
    const membersResponse = await fetch(`https://api.truckersmp.com/v2/vtc/${VTC_ID}/members`);
    if (!membersResponse.ok) {
      throw new Error(`Failed to fetch VTC members: ${membersResponse.status}`);
    }

    const membersData = await membersResponse.json();
    const members: TruckersmpMember[] = membersData.response?.members || [];
    
    console.log(`Found ${members.length} members in VTC`);

    let synced = 0;
    let errors = 0;

    // Process each member
    for (const member of members) {
      try {
        // Fetch player details for avatar and online status
        let avatarUrl = null;
        let isOnline = false;
        let serverName: string | null = null;
        
        try {
          const playerResponse = await fetch(`https://api.truckersmp.com/v2/player/${member.user_id}`);
          if (playerResponse.ok) {
            const playerData = await playerResponse.json();
            avatarUrl = playerData.response?.avatar;
            isOnline = !!playerData.response?.online;
            serverName = playerData.response?.online_details?.server_name || null;
          }
        } catch (e) {
          console.log(`Could not fetch player details for ${member.username}`);
        }

        // Use the actual role from TruckersMP, map to our enum
        const roleMap: Record<string, string> = {
          'founder': 'Founder',
          'manager': 'Manager',
          'management': 'Management',
          'human resources': 'Human Resources',
          'hr': 'HR',
          'member': 'Member',
          'driver': 'Driver',
          'trainee': 'Trainee',
          'trial': 'Trial',
        };
        
        const roleLower = member.role.toLowerCase();
        const vtcRole = roleMap[roleLower] || 'Driver';

        const now = new Date().toISOString();

        // Upsert member with online status
        const { error } = await supabase
          .from('members')
          .upsert({
            tmp_id: member.user_id,
            username: member.username,
            avatar_url: avatarUrl,
            vtc_role: vtcRole,
            join_date: member.joinDate,
            is_active: true,
            last_seen_online: isOnline ? now : undefined,
            last_seen_server: serverName,
            updated_at: now
          }, {
            onConflict: 'tmp_id'
          });

        if (error) {
          console.error(`Error upserting member ${member.username}:`, error);
          errors++;
        } else {
          synced++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (memberError) {
        console.error(`Error processing member ${member.username}:`, memberError);
        errors++;
      }
    }

    // Mark members no longer in VTC as inactive
    const currentTmpIds = members.map(m => m.user_id);
    if (currentTmpIds.length > 0) {
      await supabase
        .from('members')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .not('tmp_id', 'in', `(${currentTmpIds.join(',')})`);
    }

    console.log(`Sync complete: ${synced} synced, ${errors} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced, 
        errors,
        total: members.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
