
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching TruckersMP VTC members...');
    
    const response = await fetch('https://api.truckersmp.com/v2/vtc/75200/members', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AuraVTC-Website/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`TruckersMP API error: ${response.status}`);
    }

    const data = await response.json();
    const members = data.response?.members || [];
    console.log('Members data received, count:', members.length);

    // Fetch avatar for each member from user profile
    const membersWithAvatars = await Promise.all(
      members.map(async (member: { user_id: number; username: string; role: string; role_id: number; joinDate: string; is_owner: boolean }) => {
        try {
          const userResponse = await fetch(`https://api.truckersmp.com/v2/player/${member.user_id}`, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'AuraVTC-Website/1.0'
            }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            return {
              ...member,
              avatar: userData.response?.avatar || null
            };
          }
        } catch (e) {
          console.error(`Failed to fetch avatar for user ${member.user_id}:`, e);
        }
        return { ...member, avatar: null };
      })
    );

    return new Response(JSON.stringify({ 
      members: membersWithAvatars,
      members_count: data.response?.members_count || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching members:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, members: [], members_count: 0 }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
