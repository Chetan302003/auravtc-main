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
    console.log('Fetching TruckersMP VTC info...');
    
    const response = await fetch('https://api.truckersmp.com/v2/vtc/75200', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AuraVTC-Website/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`TruckersMP API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('VTC data received:', data.response?.name);

    return new Response(JSON.stringify({ vtc: data.response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching VTC info:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, vtc: null }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
