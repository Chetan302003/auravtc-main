import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Discord interaction types
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
};

const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
};

// Hardcoded webhook URL for updating messages
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1459255664487563369/v6Iy1h1vIoZelPfjb-_qAkTPuG4snKbvPMcVcXUQCx0kcN_2DqfjpIYUYoE-83YOHQ82';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const body = await req.json();
    console.log('Discord interaction received:', JSON.stringify(body));

    // Handle Discord ping (verification)
    if (body.type === InteractionType.PING) {
      return new Response(
        JSON.stringify({ type: InteractionResponseType.PONG }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle button interactions
    if (body.type === InteractionType.MESSAGE_COMPONENT) {
      const customId = body.data?.custom_id || '';
      const [action, bookingId] = customId.split('_');

      if (!bookingId || (action !== 'accept' && action !== 'reject')) {
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Invalid interaction.',
              flags: 64, // Ephemeral
            },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Get the booking
      const { data: booking, error: fetchError } = await supabase
        .from('slot_bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (fetchError || !booking) {
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Booking not found.',
              flags: 64,
            },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (booking.status !== 'pending') {
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `⚠️ This booking has already been ${booking.status}.`,
              flags: 64,
            },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      const newStatus = action === 'accept' ? 'approved' : 'rejected';
      const discordUser = body.member?.user?.username || 'Discord User';

      // Update the booking status
      const { error: updateError } = await supabase
        .from('slot_bookings')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: discordUser,
        })
        .eq('id', bookingId);

      if (updateError) {
        console.error('Failed to update booking:', updateError);
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Failed to update booking status.',
              flags: 64,
            },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Send email notification if configured and contact email exists
      if (booking.contact_email) {
        try {
          await supabase.functions.invoke('send-booking-email', {
            body: {
              to: booking.contact_email,
              vtc_name: booking.vtc_name,
              slot_number: booking.slot_number,
              status: newStatus,
              contact_name: booking.contact_name,
            },
          });
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      }

      // Update the Discord message to reflect the new status
      const statusColor = newStatus === 'approved' ? 0x00FF00 : 0xFF0000;
      const statusEmoji = newStatus === 'approved' ? '✅' : '❌';
      const statusText = newStatus === 'approved' ? 'APPROVED' : 'REJECTED';

      // Return an updated message
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: `${statusEmoji} **Booking ${statusText}** by ${discordUser}`,
            embeds: [
              {
                title: `🚚 Slot #${booking.slot_number} - ${statusText}`,
                color: statusColor,
                fields: [
                  { name: '🏢 VTC Name', value: booking.vtc_name, inline: true },
                  { name: '👤 Contact', value: booking.contact_name || 'N/A', inline: true },
                  { name: '👥 Members', value: booking.member_count.toString(), inline: true },
                  { name: '🔗 Discord', value: `<@${booking.discord_id}>`, inline: true },
                  { name: '📋 Status', value: statusText, inline: true },
                  { name: '👮 Reviewed By', value: discordUser, inline: true },
                ],
                footer: { text: `Booking ID: ${bookingId}` },
                timestamp: new Date().toISOString(),
              },
            ],
            components: [], // Remove the buttons after action
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Unknown interaction type
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❓ Unknown interaction type.',
          flags: 64,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling Discord interaction:', error);
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ An error occurred processing this interaction.',
          flags: 64,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
});
