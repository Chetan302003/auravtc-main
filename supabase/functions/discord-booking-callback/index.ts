import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL');

    const body = await req.json();
    const { booking_id, action, reviewer, event_name } = body;

    if (!booking_id || !action) {
      throw new Error('Missing booking_id or action');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const newStatus = action === 'accept' ? 'approved' : 'rejected';
    
    const { data: booking, error: updateError } = await supabase
      .from('slot_bookings')
      .update({
        status: newStatus,
        reviewed_by: reviewer || 'Discord Staff',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', booking_id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`Booking ${booking_id} ${newStatus} by ${reviewer || 'Discord Staff'}`);

    // Fetch slot data for the image
    const { data: slotData } = await supabase
      .from('event_slots')
      .select('slot_image_url')
      .eq('event_id', booking.event_id)
      .eq('slot_number', booking.slot_number)
      .maybeSingle();

    // Fetch event details from TruckersMP API if event_id is numeric
    let eventDetails: any = {};
    try {
      const eventResponse = await fetch(`https://api.truckersmp.com/v2/events/${booking.event_id}`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        if (eventData.response) {
          const event = eventData.response;
          eventDetails = {
            event_name: event.name,
            event_date: event.start_at ? new Date(event.start_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
            event_time: event.start_at ? new Date(event.start_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) : undefined,
            event_server: event.server?.name,
            event_banner: event.banner,
            meetup_location: event.meetup?.location,
            destination: event.arrive?.city || event.destination?.location,
            departure_city: event.departure?.city || event.departure?.location,
            arrival_city: event.arrive?.city || event.arrive?.location,
          };
        }
      }
    } catch (eventFetchError) {
      console.error('Failed to fetch event details:', eventFetchError);
    }

    // Send email notification if contact_email exists
    if (booking.contact_email) {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-booking-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            to_email: booking.contact_email,
            vtc_name: booking.vtc_name,
            contact_name: booking.contact_name || 'VTC Representative',
            slot_number: booking.slot_number,
            event_name: eventDetails.event_name || event_name || `Event ${booking.event_id}`,
            event_date: eventDetails.event_date,
            event_time: eventDetails.event_time,
            event_server: eventDetails.event_server,
            event_banner: eventDetails.event_banner,
            meetup_location: eventDetails.meetup_location,
            destination: eventDetails.destination,
            departure_city: eventDetails.departure_city,
            arrival_city: eventDetails.arrival_city,
            slot_image_url: slotData?.slot_image_url,
            member_count: booking.member_count,
            status: newStatus,
            reviewer: reviewer || 'Discord Staff',
          }),
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    // Update Discord message
    if (WEBHOOK_URL && booking.discord_message_id) {
      const webhookId = WEBHOOK_URL.split('/webhooks/')[1]?.split('/')[0];
      const webhookToken = WEBHOOK_URL.split('/').pop();

      if (webhookId && webhookToken) {
        try {
          await fetch(`https://discord.com/api/webhooks/${webhookId}/${webhookToken}/messages/${booking.discord_message_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: `🚚 Slot #${booking.slot_number} Booking ${action === 'accept' ? 'APPROVED ✅' : 'REJECTED ❌'}`,
                color: action === 'accept' ? 0x00FF00 : 0xFF0000,
                fields: [
                  { name: '🏢 VTC Name', value: booking.vtc_name, inline: true },
                  { name: '👤 Contact', value: booking.contact_name || 'N/A', inline: true },
                  { name: '👥 Members', value: booking.member_count.toString(), inline: true },
                  { name: '📋 Status', value: action === 'accept' ? '✅ APPROVED' : '❌ REJECTED', inline: true },
                  { name: '👮 Reviewed By', value: reviewer || 'Discord Staff', inline: true },
                ],
                footer: { text: `Booking ID: ${booking_id}` },
                timestamp: new Date().toISOString(),
              }],
              components: [],
            }),
          });
        } catch (discordError) {
          console.error('Failed to update Discord:', discordError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: newStatus, booking }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
