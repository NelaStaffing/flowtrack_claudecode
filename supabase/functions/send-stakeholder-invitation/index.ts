import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'FlowTrack <onboarding@resend.dev>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, token, inviterName, message, appUrl } = await req.json()

    // If no API key is configured, return mock mode
    if (!RESEND_API_KEY) {
      console.log('No RESEND_API_KEY found, running in mock mode')
      return new Response(
        JSON.stringify({ success: true, mock: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const formUrl = `${appUrl}/stakeholder-form/${token}`

    // Generate email HTML
    const emailHTML = generateStakeholderInvitationHTML({
      inviterName,
      message,
      formUrl,
    })

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: `${inviterName} invited you to share your stakeholder information`,
        html: emailHTML,
      }),
    })

    const data = await resendResponse.json()

    if (!resendResponse.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending stakeholder invitation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function generateStakeholderInvitationHTML({ inviterName, message, formUrl }: {
  inviterName: string
  message: string | null
  formUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stakeholder Information Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                📋 FlowTrack
              </h1>
              <p style="margin: 10px 0 0 0; color: #E0E7FF; font-size: 16px;">
                Stakeholder Information Request
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                Hello! 👋
              </h2>

              <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to share your stakeholder information for better project collaboration.
              </p>

              ${message ? `
                <div style="background-color: #DBEAFE; border-left: 4px solid #3B82F6; padding: 16px; margin: 0 0 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #1E40AF; font-size: 14px; font-style: italic;">
                    "${message}"
                  </p>
                </div>
              ` : ''}

              <p style="margin: 0 0 30px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                Please take a few minutes to fill out a brief form with your contact information, availability, and communication preferences. This helps us:
              </p>

              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4B5563; font-size: 16px; line-height: 1.8;">
                <li>Plan projects more effectively around your schedule</li>
                <li>Communicate with you in your preferred way</li>
                <li>Respect your availability and response times</li>
                <li>Provide better AI-powered project insights</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${formUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      📝 Fill Out Form
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #6B7280; font-size: 14px; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${formUrl}" style="color: #8B5CF6; text-decoration: none; word-break: break-all;">
                  ${formUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- Information Box -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">
                  <strong>⏰ This link expires in 7 days.</strong><br>
                  The form takes about 5 minutes to complete and will help us serve you better.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 14px;">
                Sent by FlowTrack - AI-Powered Project Management
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                Your information is kept secure and will only be used for project collaboration purposes.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
