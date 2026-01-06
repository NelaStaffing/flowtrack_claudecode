# Email Setup Guide for FlowTrack

This guide explains how to set up email functionality for sending team member invitations in FlowTrack.

## Overview

FlowTrack uses **Supabase Edge Functions** with [Resend](https://resend.com) for sending transactional emails securely. This architecture ensures:

- ✅ API keys never exposed to the client
- ✅ CORS issues completely avoided
- ✅ Server-side email sending
- ✅ Better security and reliability
- ✅ Easy to scale and monitor

Resend provides:
- Easy integration
- High deliverability
- Simple pricing
- Real-time delivery tracking

## Architecture

```
Client (Browser) → Supabase Edge Function → Resend API → Email Sent
```

The email is sent server-side through a Supabase Edge Function, keeping your API key secure.

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

### 4. Deploy the Edge Function

The Edge Function is already created at `supabase/functions/send-invitation-email/`.

Deploy it to your Supabase project:

```bash
# Login to Supabase CLI (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Deploy the function
npx supabase functions deploy send-invitation-email
```

**Find your project-ref**:
- Go to Supabase dashboard
- Settings → General → Reference ID

### 5. Set Supabase Secrets

Add your Resend API key as a Supabase secret (server-side, never exposed to client):

```bash
# Set RESEND_API_KEY secret
npx supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here

# Set FROM_EMAIL secret (optional, defaults to onboarding@resend.dev)
npx supabase secrets set FROM_EMAIL="FlowTrack <onboarding@yourdomain.com>"
```

**Important**: These are server-side secrets, not client environment variables. They're never exposed to the browser.

### 6. Configure Client Environment

Add only the app URL to your `.env` file:

```env
VITE_APP_URL=http://localhost:5173
```

For production, set this to your actual domain (e.g., `https://flowtrack.yourcompany.com`).

### 7. Restart Your Development Server

```bash
npm run dev
```

## Quick Start (Skip Edge Function for Testing)

If you want to test the invitation flow without setting up email:

1. The Edge Function will work in "mock mode" if no `RESEND_API_KEY` is set
2. Invitation will be created in database
3. Console will log invitation details
4. You can manually construct the accept URL: `http://localhost:5173/accept-invite/{token}`

This is perfect for development and testing the invitation flow.

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

**Check Edge Function Deployment**:
```bash
# Verify function is deployed
npx supabase functions list
```
- Should show `send-invitation-email` as deployed
- If not, deploy it: `npx supabase functions deploy send-invitation-email`

**Check Supabase Secrets**:
```bash
# List secrets (won't show values, just keys)
npx supabase secrets list
```
- Should show `RESEND_API_KEY` and optionally `FROM_EMAIL`
- If missing, set them: `npx supabase secrets set RESEND_API_KEY=re_xxx`

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
