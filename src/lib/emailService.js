// Email service for sending team invitations
// Uses Supabase Edge Function to send emails securely

import { supabase } from './supabase';

const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

/**
 * Send team invitation email via Supabase Edge Function
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
  try {
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        email,
        role,
        message,
        inviterName,
        token,
        appUrl: APP_URL,
      },
    });

    // If Edge Function is not deployed, use local fallback
    if (error && error.message && error.message.includes('Failed to send a request')) {
      console.log('📧 Edge Function not deployed - Using local mock mode');
      console.log('─────────────────────────────────────────────────────');
      console.log('Invitation Email (Mock Mode)');
      console.log('─────────────────────────────────────────────────────');
      console.log('To:', email);
      console.log('Role:', role);
      console.log('From:', inviterName);
      if (message) console.log('Message:', message);
      console.log('Accept URL:', `${APP_URL}/accept-invite/${token}`);
      console.log('─────────────────────────────────────────────────────');
      console.log('✅ Invitation created in database');
      console.log('ℹ️  To send real emails, deploy the Edge Function:');
      console.log('   npx supabase functions deploy send-invitation-email');
      console.log('─────────────────────────────────────────────────────');

      return {
        success: true,
        mock: true,
        acceptUrl: `${APP_URL}/accept-invite/${token}`
      };
    }

    if (error) {
      console.error('Error calling email function:', error);
      return { success: false, error: error.message };
    }

    if (data.mock) {
      console.log('Email function returned mock response (development mode)');
      console.log('Invitation details:', { email, role, token });
    } else {
      console.log('✅ Email sent successfully via Edge Function:', data.emailId);
    }

    return { success: true, ...data };
  } catch (error) {
    console.error('Error sending invitation email:', error);

    // Fallback to mock mode on any error
    console.log('📧 Falling back to mock mode');
    console.log('Invitation would be sent to:', email);
    console.log('Accept URL:', `${APP_URL}/accept-invite/${token}`);

    return {
      success: true,
      mock: true,
      acceptUrl: `${APP_URL}/accept-invite/${token}`
    };
  }
}

export default {
  sendInvitationEmail,
};
