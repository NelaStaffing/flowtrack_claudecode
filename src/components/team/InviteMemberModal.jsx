import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';
import { sendInvitationEmail } from '../../lib/emailService';

const InviteMemberModal = ({ onClose, onInviteSent }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    role: 'developer',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    {
      value: 'admin',
      label: 'Admin',
      icon: '👑',
      description: 'Full system access',
      color: 'purple',
    },
    {
      value: 'developer',
      label: 'Developer',
      icon: '💻',
      description: 'Can manage projects & tasks',
      color: 'blue',
    },
    {
      value: 'viewer',
      label: 'Viewer',
      icon: '👁',
      description: 'Read-only access',
      color: 'gray',
    },
    {
      value: 'contractor',
      label: 'Contractor',
      icon: '🤝',
      description: 'Limited project access',
      color: 'emerald',
    },
  ];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const generateInvitationToken = () => {
    // Generate a secure random token
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

    setSubmitting(true);
    setErrors({});

    // Generate invitation token
    const token = generateInvitationToken();

    const invitation = {
      email: formData.email.toLowerCase().trim(),
      role: formData.role,
      message: formData.message.trim() || null,
      invited_by: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const { data, error } = await supabaseHelpers.createInvitation(invitation);

    if (error) {
      console.error('Error sending invitation:', error);
      if (error.code === '23505') {
        setErrors({ email: 'An invitation has already been sent to this email' });
      } else {
        alert('Failed to send invitation. Please try again.');
      }
      setSubmitting(false);
      return;
    }

    // Send invitation email
    try {
      const emailResult = await sendInvitationEmail({
        email: invitation.email,
        role: invitation.role,
        message: invitation.message,
        inviterName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'A team member',
        token: invitation.token,
      });

      if (emailResult.success) {
        if (emailResult.mock) {
          console.log('✅ Invitation created successfully (mock mode - check console for details)');
        } else {
          console.log('✅ Invitation email sent successfully');
        }
      } else {
        console.warn('Email sending failed, but invitation was created:', emailResult.error);
        // Still proceed - the invitation exists in the database
      }
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Continue anyway - the invitation was created
    }

    setSubmitting(false);
    onInviteSent();
  };

  const getColorClasses = (color, selected) => {
    const colors = {
      purple: selected
        ? 'border-purple-600 bg-purple-50 text-purple-900'
        : 'border-gray-200 hover:border-purple-300',
      blue: selected
        ? 'border-blue-600 bg-blue-50 text-blue-900'
        : 'border-gray-200 hover:border-blue-300',
      gray: selected
        ? 'border-gray-600 bg-gray-50 text-gray-900'
        : 'border-gray-200 hover:border-gray-300',
      emerald: selected
        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
        : 'border-gray-200 hover:border-emerald-300',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[700px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
            <p className="text-sm text-gray-500 mt-1">
              Send an invitation to join your workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
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
                placeholder="colleague@company.com"
                disabled={submitting}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    disabled={submitting}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${getColorClasses(
                      role.color,
                      formData.role === role.value
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{role.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{role.label}</div>
                        <div className="text-xs text-gray-600">
                          {role.description}
                        </div>
                      </div>
                      {formData.role === role.value && (
                        <div className="text-lg">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Add a personal note to the invitation email..."
                disabled={submitting}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <div className="text-xl">ℹ️</div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Invitation Details
                </h4>
                <p className="text-sm text-blue-700">
                  The invitation will be sent via email and will expire in 7 days.
                  The recipient can accept the invitation by clicking the link in
                  the email.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>Send Invitation</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
