// Supabase Edge Function to send invitation emails
// This runs server-side, keeping the API key secure

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
    const { email, role, message, inviterName, token, appUrl } = await req.json()

    // Validate required fields
    if (!email || !role || !token || !appUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If no API key, return mock success (for development)
    if (!RESEND_API_KEY) {
      console.log('No RESEND_API_KEY - Mock mode')
      console.log('Invitation would be sent to:', email)
      return new Response(
        JSON.stringify({ success: true, mock: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate email HTML
    const acceptUrl = `${appUrl}/accept-invite/${token}`
    const emailHTML = generateInvitationEmailHTML({ role, message, inviterName, acceptUrl })

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: `${inviterName} invited you to join FlowTrack`,
        html: emailHTML,
      }),
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.json()
      console.error('Resend API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await resendResponse.json()
    console.log('Email sent successfully:', data.id)

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateInvitationEmailHTML({ role, message, inviterName, acceptUrl }) {
  const roleEmojis = {
    admin: '👑',
    developer: '💻',
    viewer: '👁',
    contractor: '🤝',
  }

  const roleDescriptions = {
    admin: 'Administrator',
    developer: 'Developer',
    viewer: 'Viewer',
    contractor: 'Contractor',
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlowTrack Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6, #6D28D9); padding: 40px 40px 30px 40px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
                <span style="font-size: 32px;">⚡</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">FlowTrack</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                You're invited to join FlowTrack!
              </h2>

              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to collaborate on FlowTrack, a powerful project management platform.
              </p>

              <!-- Role Badge -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px; border-left: 4px solid #8B5CF6;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 32px; margin-right: 12px;">${roleEmojis[role] || '👤'}</span>
                  <div>
                    <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 4px;">YOUR ROLE</div>
                    <div style="color: #111827; font-size: 18px; font-weight: 600;">${roleDescriptions[role] || role}</div>
                  </div>
                </div>
              </div>

              ${message ? `
                <div style="margin: 30px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <div style="color: #1e40af; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Personal Message:</div>
                  <div style="color: #1e3a8a; font-size: 15px; line-height: 1.6;">${message}</div>
                </div>
              ` : ''}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${acceptUrl}" style="display: inline-block; background-color: #8B5CF6; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">
                  Accept Invitation
                </a>
              </div>

              <!-- Features List -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600;">What you can do with FlowTrack:</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 12px 0; color: #4b5563; font-size: 15px;">
                      <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                      Manage projects and tasks collaboratively
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #4b5563; font-size: 15px;">
                      <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                      Track milestones and deadlines
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #4b5563; font-size: 15px;">
                      <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                      Share documents and files
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #4b5563; font-size: 15px;">
                      <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                      Generate insightful reports and analytics
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Expiration Notice -->
              <div style="margin-top: 30px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>⏰ This invitation expires in 7 days.</strong> Click the button above to get started.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px 0;">
                <a href="${acceptUrl}" style="color: #8B5CF6; text-decoration: none; font-size: 13px; word-break: break-all;">${acceptUrl}</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Didn't expect this email? You can safely ignore it.
              </p>
              <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} FlowTrack. All rights reserved.
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
