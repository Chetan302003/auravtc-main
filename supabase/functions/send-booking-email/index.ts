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
  status: 'approved' | 'rejected';
  reviewer?: string;
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

    const { to_email, vtc_name, contact_name, slot_number, event_name, status, reviewer }: BookingEmailRequest = await req.json();

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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${isApproved ? '#22c55e' : '#ef4444'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">${isApproved ? '🎉 Booking Approved!' : '📋 Booking Update'}</h1>
            </div>
            <div class="content">
              <p>Hello ${contact_name || 'there'},</p>
              <p>
                ${isApproved 
                  ? `Great news! Your slot booking request for <strong>${vtc_name}</strong> has been approved. You're all set for the convoy!`
                  : `We regret to inform you that your slot booking request for <strong>${vtc_name}</strong> has been rejected.`
                }
              </p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">Event:</span>
                  <span class="value">${event_name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">VTC Name:</span>
                  <span class="value">${vtc_name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Slot Number:</span>
                  <span class="value">#${slot_number}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span class="value" style="color: ${isApproved ? '#22c55e' : '#ef4444'}; font-weight: bold;">
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
                ? `<p>Please ensure your members are ready and on time. See you at the convoy!</p>`
                : `<p>If you have any questions about this decision, please contact our management team via Discord.</p>`
              }
            </div>
            <div class="footer">
              <p>This is an automated message from Aura VTC Slot Booking System</p>
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
