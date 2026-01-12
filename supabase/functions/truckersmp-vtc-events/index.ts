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
    console.log('Fetching TruckersMP VTC attending events...');
    
    // Use the VTC events/attending API endpoint (events the VTC is attending)
    const response = await fetch('https://api.truckersmp.com/v2/vtc/75200/events', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AuraVTC-Website/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`TruckersMP API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw VTC attending events data:', JSON.stringify(data).substring(0, 500));

    // Filter for upcoming events only (start_at in the future) and take first 6
    const now = new Date();
    const upcomingEvents = (data.response || [])
      .filter((event: any) => {
        const eventDate = new Date(event.start_at);
        return eventDate > now;
      })
      .sort((a: any, b: any) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
      .slice(0, 6);

    console.log(`Found ${upcomingEvents.length} upcoming attending events`);

    return new Response(JSON.stringify({ events: upcomingEvents }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching VTC events:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, events: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
