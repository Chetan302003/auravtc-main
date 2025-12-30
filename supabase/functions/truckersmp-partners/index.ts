import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const VTC_ID = 75200
    const response = await fetch(`https://api.truckersmp.com/v2/vtc/${VTC_ID}/partners`, {
      headers: {
        'User-Agent': 'AuraVTC-Website/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`TruckersMP API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Return the response array directly for easier handling
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching partners:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage, response: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
