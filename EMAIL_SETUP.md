# Email Setup Guide for FlowTrack

This guide explains how to set up email functionality for sending team member invitations in FlowTrack.

## Overview

FlowTrack uses [Resend](https://resend.com) for sending transactional emails. Resend is a modern email API designed for developers, offering:

- Easy integration
- High deliverability
- Simple pricing
- Beautiful email templates
- Real-time delivery tracking

## Setup Steps

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "FlowTrack Development")
5. Select permissions (Full Access recommended)
6. Copy the API key (it starts with `re_`)

**Important**: Save this key securely - you won't be able to see it again!

### 3. Configure Your Domain (Optional but Recommended)

For production use, you should verify your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain
5. Wait for verification (usually a few minutes)

**For development**: You can use the default `onboarding@resend.dev` which has limits but works for testing.

### 4. Add Environment Variables

Add the following to your `.env` file:

```env
# Email Configuration
VITE_RESEND_API_KEY=re_your_actual_api_key_here
VITE_FROM_EMAIL=FlowTrack <onboarding@yourdomain.com>
VITE_APP_URL=http://localhost:5173
```

**Notes**:
- Replace `re_your_actual_api_key_here` with your actual Resend API key
- If you haven't verified a domain, use `FlowTrack <onboarding@resend.dev>`
- For production, set `VITE_APP_URL` to your actual domain

### 5. Restart Your Development Server

```bash
npm run dev
```

## Testing Email Functionality

### 1. Send a Test Invitation

1. Navigate to **Team Management** in FlowTrack
2. Click **Invite Member**
3. Fill in the form:
   - Email: Use a real email you have access to
   - Role: Select any role
   - Message: Add an optional personal message
4. Click **Send Invitation**

### 2. Check the Email

1. Check the inbox of the email address you used
2. You should receive an email with:
   - FlowTrack branding
   - Invitation details
   - Accept invitation button
   - Expiration notice (7 days)

### 3. Check Logs

Open your browser console and look for:
- `Invitation email sent successfully` - Email was sent
- `Email sending failed, but invitation was created` - API error

## Email Template Features

The invitation email includes:

- **Professional Design**: Branded with FlowTrack colors and logo
- **Role Badge**: Shows the role the recipient is being invited as
- **Personal Message**: Optional custom message from the inviter
- **Call-to-Action Button**: Clear "Accept Invitation" button
- **Feature List**: Highlights what users can do with FlowTrack
- **Expiration Notice**: Warns that invitation expires in 7 days
- **Fallback Link**: Plain text link if the button doesn't work
- **Mobile Responsive**: Looks great on all devices

## Troubleshooting

### Email Not Sending

**Check API Key**:
```bash
# In browser console
console.log(import.meta.env.VITE_RESEND_API_KEY)
```
- Should show your API key starting with `re_`
- If undefined, check your `.env` file and restart dev server

**Check Domain**:
- If using custom domain, ensure DNS records are verified
- For testing, use `onboarding@resend.dev`

**Check Console Logs**:
```javascript
// Look for error messages in browser console
// They will show the specific error from Resend API
```

### Common Errors

**401 Unauthorized**:
- Invalid API key
- API key not set in environment variables
- Solution: Double-check your `.env` file

**422 Unprocessable Entity**:
- Invalid `from` email address
- Domain not verified
- Solution: Use `onboarding@resend.dev` or verify your domain

**Rate Limit Exceeded**:
- Free tier limits reached
- Solution: Upgrade your Resend plan or wait for limit reset

### Development Mode

If `VITE_RESEND_API_KEY` is not set, the email service will:
- Log invitation details to console instead of sending
- Still create the invitation in the database
- Mark it as `mock: true` in the response

This allows you to develop without email configuration.

## Resend Pricing

**Free Tier**:
- 100 emails/day
- 3,000 emails/month
- Perfect for development and small teams

**Paid Plans**:
- Start at $20/month for 50,000 emails
- No monthly commitment
- Pay as you grow

## Security Best Practices

1. **Never commit `.env` file**: It contains sensitive API keys
2. **Use environment variables**: Never hardcode API keys in code
3. **Rotate API keys**: Periodically regenerate your API keys
4. **Limit key permissions**: Use the minimum permissions needed
5. **Monitor usage**: Check Resend dashboard for unusual activity

## Invitation Flow

1. **Admin invites member**:
   - Fills out invitation form
   - Invitation created in database with unique token
   - Email sent via Resend API

2. **Member receives email**:
   - Opens email in their inbox
   - Clicks "Accept Invitation" button
   - Redirected to acceptance page with token

3. **Member accepts invitation**:
   - Creates FlowTrack account
   - Account linked to invitation token
   - Granted appropriate role and permissions

4. **Invitation expires**:
   - After 7 days, token becomes invalid
   - Admin can resend invitation (extends expiration)
   - New email sent with same token

## Support

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: support@resend.com
- **FlowTrack Issues**: [GitHub Issues](https://github.com/your-repo/flowtrack/issues)

## Advanced Configuration

### Custom Email Templates

To customize the email template, edit:
```
src/lib/emailService.js
```

Look for the `generateInvitationEmailHTML` function.

### Additional Email Types

You can extend the email service to send:
- Task assignment notifications
- Project updates
- Deadline reminders
- Weekly summaries

Add new functions to `emailService.js` following the same pattern as `sendInvitationEmail`.

### Production Deployment

For production (Vercel, Netlify, etc.):

1. Add environment variables in deployment settings
2. Use your verified domain for `VITE_FROM_EMAIL`
3. Set `VITE_APP_URL` to your production domain
4. Monitor email deliverability in Resend dashboard
5. Consider upgrading to a paid plan for higher limits

## Next Steps

Once email is working:

1. Test invitation acceptance flow
2. Customize email template with your branding
3. Add more email types (notifications, reminders)
4. Set up email tracking and analytics
5. Configure SPF/DKIM for better deliverability

---

**Questions?** Check the Resend documentation or open an issue on GitHub.
