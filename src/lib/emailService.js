// Email service for sending team invitations
// Using Resend API for email delivery

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'FlowTrack <onboarding@resend.dev>';
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

/**
 * Send team invitation email
 * @param {Object} invitation - Invitation details
 * @param {string} invitation.email - Recipient email
 * @param {string} invitation.role - Team role
 * @param {string} invitation.message - Personal message (optional)
 * @param {string} invitation.inviterName - Name of person sending invite
 * @param {string} invitation.token - Invitation token for acceptance link
 */
export async function sendInvitationEmail({
  email,
  role,
  message,
  inviterName,
  token,
}) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    // In development, just log the invitation
    console.log('Invitation Email (not sent - no API key):', {
      to: email,
      role,
      message,
      acceptUrl: `${APP_URL}/accept-invite/${token}`,
    });
    return { success: true, mock: true };
  }

  const acceptUrl = `${APP_URL}/accept-invite/${token}`;

  const emailHTML = generateInvitationEmailHTML({
    role,
    message,
    inviterName,
    acceptUrl,
  });

  try {
    const response = await fetch('https://api.resend.com/emails', {
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
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email send error:', error);
      throw new Error('Failed to send email');
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate HTML for invitation email
 */
function generateInvitationEmailHTML({
  role,
  message,
  inviterName,
  acceptUrl,
}) {
  const roleEmojis = {
    admin: '👑',
    developer: '💻',
    viewer: '👁',
    contractor: '🤝',
  };

  const roleDescriptions = {
    admin: 'Administrator',
    developer: 'Developer',
    viewer: 'Viewer',
    contractor: 'Contractor',
  };

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
  `.trim();
}

export default {
  sendInvitationEmail,
};
