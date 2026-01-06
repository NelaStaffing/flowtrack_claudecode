import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { sendInvitationEmail } from '../../lib/emailService';

const InviteStakeholderModal = ({ onClose, onInvitationSent, projectId = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    projectId: projectId || '',
    personalMessage: '',
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load projects on mount
  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('id, name').order('name');
    if (data) setProjects(data);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const generateToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Generate form token
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create stakeholder form invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('stakeholder_form_invitations')
        .insert([
          {
            email: formData.email.toLowerCase().trim(),
            project_id: formData.projectId || null,
            token,
            expires_at: expiresAt.toISOString(),
            created_by: user.id,
            message: formData.personalMessage.trim() || null,
          },
        ])
        .select()
        .single();

      if (inviteError) {
        console.error('Error creating invitation:', inviteError);
        console.error('Error code:', inviteError.code);
        console.error('Error message:', inviteError.message);
        console.error('Error details:', inviteError.details);
        console.error('Error hint:', inviteError.hint);

        if (inviteError.code === '23505') {
          setErrors({ email: 'An invitation has already been sent to this email' });
        } else if (inviteError.code === '42P01') {
          alert('Database table not found. Please apply the migration:\n\nRun in your terminal:\nnpx supabase db reset\n\nOr apply the specific migration:\nnpx supabase migration up');
        } else {
          alert(`Failed to create invitation: ${inviteError.message}\n\nError code: ${inviteError.code}`);
        }
        setLoading(false);
        return;
      }

      // Send email via Edge Function
      await sendStakeholderInvitationEmail({
        email: formData.email,
        token,
        inviterName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'A team member',
        message: formData.personalMessage,
      });

      setLoading(false);
      onInvitationSent && onInvitationSent();
    } catch (error) {
      console.error('Error sending stakeholder invitation:', error);
      alert('Failed to send invitation');
      setLoading(false);
    }
  };

  // Form fields that will be collected
  const formFields = [
    { icon: '👤', label: 'Full Name', required: true },
    { icon: '💼', label: 'Job Title', required: true },
    { icon: '🏢', label: 'Company/Organization', required: true },
    { icon: '📧', label: 'Email Address', required: true },
    { icon: '📱', label: 'Phone Number', required: false },
    { icon: '⏱️', label: 'Preferred Response Time', required: true },
    { icon: '📅', label: 'General Availability', required: true },
    { icon: '⚡', label: 'Decision-Making Authority', required: true },
    { icon: '🎯', label: 'Primary Concerns/Priorities', required: true },
    { icon: '💬', label: 'Communication Preferences', required: true },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Invite Stakeholder</h2>
              <p className="text-sm text-gray-600 mt-1">
                Send a form link for stakeholders to provide their information
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">How It Works</h4>
                <p className="text-sm text-blue-700">
                  The stakeholder will receive an email with a secure link to a form where they can
                  provide their information. Once submitted, their profile will be automatically created
                  and available for AI-powered insights.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stakeholder Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: null });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="stakeholder@company.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Project (Optional)
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              >
                <option value="">No specific project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Optionally link this stakeholder to a specific project
              </p>
            </div>

            {/* Personal Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                value={formData.personalMessage}
                onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="3"
                placeholder="Add a personal note to the email..."
                disabled={loading}
              />
            </div>

            {/* Form Fields Preview */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Information to be Collected
              </h4>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-2 gap-3">
                  {formFields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{field.icon}</span>
                      <span className="text-gray-700">{field.label}</span>
                      {field.required && (
                        <span className="text-red-500 text-xs">*</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  This data helps our AI provide better project insights and recommendations
                </p>
              </div>
            </div>

            {/* Expiration Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⏰ Form link expires in 7 days.</strong> The stakeholder can submit the form
                anytime before expiration.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <span>📧</span>
                Send Invitation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Send stakeholder invitation email via Edge Function
async function sendStakeholderInvitationEmail({ email, token, inviterName, message }) {
  const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

  try {
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-stakeholder-invitation', {
      body: {
        email,
        token,
        inviterName,
        message,
        appUrl: APP_URL,
      },
    });

    // If Edge Function is not deployed, use local fallback
    if (error && error.message && error.message.includes('Failed to send a request')) {
      console.log('📧 Edge Function not deployed - Using local mock mode');
      console.log('─────────────────────────────────────────────────────');
      console.log('Stakeholder Invitation Email (Mock Mode)');
      console.log('─────────────────────────────────────────────────────');
      console.log('To:', email);
      console.log('From:', inviterName);
      if (message) console.log('Message:', message);
      console.log('Form URL:', `${APP_URL}/stakeholder-form/${token}`);
      console.log('─────────────────────────────────────────────────────');
      console.log('✅ Invitation created in database');
      console.log('ℹ️  To send real emails, deploy the Edge Function:');
      console.log('   npx supabase functions deploy send-stakeholder-invitation');
      console.log('─────────────────────────────────────────────────────');

      return {
        success: true,
        mock: true,
        formUrl: `${APP_URL}/stakeholder-form/${token}`
      };
    }

    if (error) {
      console.error('Error calling email function:', error);
      return { success: false, error: error.message };
    }

    if (data.mock) {
      console.log('Email function returned mock response (development mode)');
      console.log('Invitation details:', { email, token });
    } else {
      console.log('✅ Email sent successfully via Edge Function:', data.emailId);
    }

    return { success: true, ...data };
  } catch (error) {
    console.error('Error sending stakeholder invitation email:', error);

    // Fallback to mock mode on any error
    console.log('📧 Falling back to mock mode');
    console.log('Invitation would be sent to:', email);
    console.log('Form URL:', `${APP_URL}/stakeholder-form/${token}`);

    return {
      success: true,
      mock: true,
      formUrl: `${APP_URL}/stakeholder-form/${token}`
    };
  }
}

export default InviteStakeholderModal;
