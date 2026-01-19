import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  to_email: string;
  vtc_name: string;
  contact_name: string;
  slot_number: number;
  event_name: string;
  event_date?: string;
  event_time?: string;
  event_server?: string;
  departure_city?: string;
  arrival_city?: string;
  status: 'approved' | 'rejected';
  reviewer?: string;
  slot_image_url?: string;
  event_banner?: string;
  meetup_location?: string;
  destination?: string;
  member_count?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email");
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped - API key not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { 
      to_email, 
      vtc_name, 
      contact_name, 
      slot_number, 
      event_name, 
      event_date,
      event_time,
      event_server,
      departure_city,
      arrival_city,
      status, 
      reviewer,
      slot_image_url,
      event_banner,
      meetup_location,
      destination,
      member_count
    }: BookingEmailRequest = await req.json();

    if (!to_email) {
      return new Response(
        JSON.stringify({ success: true, message: "No email provided, skipping" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const isApproved = status === 'approved';
    const subject = isApproved 
      ? `✅ Your slot booking for ${event_name} has been approved!`
      : `❌ Your slot booking for ${event_name} has been rejected`;

    // Determine which image to show for the slot
    const displayImage = slot_image_url || event_banner;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f0f0f0; }
            .container { max-width: 650px; margin: 0 auto; padding: 20px; }
            .header { background: ${isApproved ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 30px 25px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .details { background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e2e8f0; }
            .section-title { font-size: 13px; font-weight: bold; color: #64748b; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #64748b; }
            .value { color: #0f172a; font-weight: 500; }
            .event-banner { width: 100%; max-height: 200px; object-fit: cover; border-radius: 10px; margin: 15px 0; }
            .event-box { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 25px; border-radius: 12px; margin: 20px 0; }
            .event-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
            .event-detail { font-size: 14px; opacity: 0.95; margin: 8px 0; display: flex; align-items: center; gap: 8px; }
            .slot-section { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center; }
            .slot-number { font-size: 48px; font-weight: bold; color: ${isApproved ? '#4ade80' : '#f87171'}; margin: 10px 0; }
            .slot-image { width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-top: 15px; border: 2px solid rgba(255,255,255,0.2); }
            .footer { text-align: center; padding: 25px; color: #64748b; font-size: 12px; }
            .status-badge { display: inline-block; background: ${isApproved ? '#22c55e' : '#ef4444'}; color: white; padding: 10px 25px; border-radius: 25px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
            .info-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; }
            .info-label { font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-value { font-size: 16px; font-weight: 600; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">${isApproved ? '🎉 Booking Approved!' : '📋 Booking Update'}</h1>
              <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 16px;">${isApproved ? 'Your convoy slot has been confirmed!' : 'Your booking request has been reviewed'}</p>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Hello <strong>${contact_name || 'there'}</strong>,</p>
              <p style="font-size: 15px; color: #475569;">
                ${isApproved 
                  ? `Great news! Your slot booking request for <strong>${vtc_name}</strong> has been approved. You're all set for the convoy!`
                  : `We regret to inform you that your slot booking request for <strong>${vtc_name}</strong> has been rejected.`
                }
              </p>

              <!-- Slot Section with Image -->
              <div class="slot-section">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8;">Your Assigned Slot</div>
                <div class="slot-number">#${slot_number}</div>
                <span class="status-badge">${isApproved ? '✓ CONFIRMED' : '✗ REJECTED'}</span>
                ${displayImage ? `<img src="${displayImage}" alt="Slot Preview" class="slot-image" />` : ''}
              </div>

              <!-- Event Details Box -->
              ${event_name ? `
              <div class="event-box">
                ${event_banner ? `<img src="${event_banner}" alt="Event Banner" class="event-banner" style="margin-top: 0; margin-bottom: 15px;" />` : ''}
                <div class="event-title">📅 ${event_name}</div>
                <div class="info-grid">
                  ${event_date ? `<div class="info-card"><div class="info-label">Date</div><div class="info-value">🗓️ ${event_date}</div></div>` : ''}
                  ${event_time ? `<div class="info-card"><div class="info-label">Time</div><div class="info-value">⏰ ${event_time}</div></div>` : ''}
                  ${event_server ? `<div class="info-card"><div class="info-label">Server</div><div class="info-value">🖥️ ${event_server}</div></div>` : ''}
                  ${member_count ? `<div class="info-card"><div class="info-label">Your Members</div><div class="info-value">👥 ${member_count}</div></div>` : ''}
                </div>
                ${meetup_location ? `<div class="event-detail">📍 <strong>Meetup:</strong> ${meetup_location}</div>` : ''}
                ${destination || (departure_city && arrival_city) ? `<div class="event-detail">🚚 <strong>Route:</strong> ${departure_city || meetup_location || 'Start'} → ${destination || arrival_city}</div>` : ''}
              </div>
              ` : ''}
              
              <div class="details">
                <div class="section-title">Booking Summary</div>
                <div class="detail-row">
                  <span class="label">VTC Name:</span>
                  <span class="value">${vtc_name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Slot Number:</span>
                  <span class="value" style="font-weight: bold; color: ${isApproved ? '#22c55e' : '#ef4444'};">#${slot_number}</span>
                </div>
                ${member_count ? `
                <div class="detail-row">
                  <span class="label">Member Count:</span>
                  <span class="value">${member_count} members</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span class="value" style="font-weight: bold; color: ${isApproved ? '#22c55e' : '#ef4444'};">
                    ${isApproved ? '✅ APPROVED' : '❌ REJECTED'}
                  </span>
                </div>
                ${reviewer ? `
                <div class="detail-row">
                  <span class="label">Reviewed By:</span>
                  <span class="value">${reviewer}</span>
                </div>
                ` : ''}
              </div>

              ${isApproved 
                ? `
                <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 1px solid #86efac; padding: 20px; border-radius: 10px; margin-top: 25px;">
                  <p style="margin: 0; color: #166534; font-size: 15px;">
                    <strong>📌 What's Next?</strong><br><br>
                    ✓ Ensure all ${member_count || 'your'} members are briefed and ready<br>
                    ✓ Join the server <strong>${event_server || '(check event details)'}</strong> before departure<br>
                    ✓ Be at the meetup location ${meetup_location ? `<strong>${meetup_location}</strong>` : ''} on time<br>
                    ✓ Follow convoy rules and enjoy the drive!
                  </p>
                </div>
                `
                : `
                <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; padding: 20px; border-radius: 10px; margin-top: 25px;">
                  <p style="margin: 0; color: #991b1b; font-size: 15px;">
                    <strong>Questions?</strong><br><br>
                    If you have any questions about this decision, please contact our management team via Discord. We'll be happy to assist you.
                  </p>
                </div>
                `
              }
            </div>
            <div class="footer">
              <p style="margin: 0 0 10px 0;">This is an automated message from Aura VTC Slot Booking System</p>
              <p style="color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} Aura VTC. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Aura VTC <onboarding@resend.dev>",
        to: [to_email],
        subject,
        html: htmlContent,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailData }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
