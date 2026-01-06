import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const StakeholderFormPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    company: '',
    email: '',
    phone: '',
    response_time: 'moderate',
    availability: 'moderate',
    decision_authority: 'medium',
    priorities: '',
    preferred_contact: 'email',
  });

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('stakeholder_form_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (error) {
        console.error('Error loading invitation:', error);
        setError('Invitation not found');
        setLoading(false);
        return;
      }

      // Check if already submitted
      if (data.submitted_at) {
        setError('This invitation has already been used');
        setLoading(false);
        return;
      }

      // Check if expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        setError('This invitation has expired');
        setLoading(false);
        return;
      }

      setInvitation(data);
      setFormData({ ...formData, email: data.email });
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load invitation');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // First, get the client_id if company matches an existing client
      let clientId = null;
      if (formData.company) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .ilike('name', formData.company)
          .single();

        if (existingClient) {
          clientId = existingClient.id;
        } else {
          // Create new client if doesn't exist
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert([{
              name: formData.company,
              logo: formData.company.charAt(0).toUpperCase(),
              industry: 'General',
              status: 'active',
            }])
            .select()
            .single();

          if (!clientError && newClient) {
            clientId = newClient.id;
          }
        }
      }

      // Create stakeholder
      const { data: stakeholder, error: stakeholderError } = await supabase
        .from('stakeholders')
        .insert([{
          full_name: formData.full_name,
          job_title: formData.job_title,
          email: formData.email,
          phone: formData.phone || null,
          client_id: clientId,
          response_time: formData.response_time,
          availability: formData.availability,
          decision_authority: formData.decision_authority,
          priorities: formData.priorities || null,
          preferred_contact: formData.preferred_contact,
          avatar_color: getRandomColor(),
        }])
        .select()
        .single();

      if (stakeholderError) {
        console.error('Error creating stakeholder:', stakeholderError);
        alert('Failed to create stakeholder profile. Please try again.');
        setSubmitting(false);
        return;
      }

      // Update invitation as submitted
      const { error: updateError } = await supabase
        .from('stakeholder_form_invitations')
        .update({
          submitted_at: new Date().toISOString(),
          stakeholder_id: stakeholder.id,
        })
        .eq('token', token);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
      }

      // Show success and redirect
      setSubmitting(false);
      alert('Thank you! Your stakeholder profile has been created successfully.');

      // Redirect to a thank you page or home
      window.location.href = '/';
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to submit form. Please try again.');
      setSubmitting(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
      '#6366F1', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stakeholder Information Form</h1>
          <p className="text-gray-600">
            Please fill out your information below. This helps us understand your role, availability,
            and communication preferences to better plan our projects.
          </p>
          {invitation?.message && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Personal message:</strong> {invitation.message}
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💼 Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Project Manager, CEO, Director"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏢 Company/Organization <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Acme Inc."
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📧 Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                placeholder="john@company.com"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">This email is pre-filled from your invitation</p>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📱 Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Response Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⏱️ Preferred Response Time <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">How quickly do you typically respond to project-related inquiries?</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, response_time: 'fast' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.response_time === 'fast'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="font-semibold text-sm">Fast</div>
                  <div className="text-xs text-gray-600">&lt; 2 hours</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, response_time: 'moderate' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.response_time === 'moderate'
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🕐</div>
                  <div className="font-semibold text-sm">Moderate</div>
                  <div className="text-xs text-gray-600">2-24 hours</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, response_time: 'slow' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.response_time === 'slow'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🐢</div>
                  <div className="font-semibold text-sm">Slow</div>
                  <div className="text-xs text-gray-600">&gt; 24 hours</div>
                </button>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 General Availability <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">How often are you available for project discussions?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, availability: 'high' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.availability === 'high'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🟢</div>
                  <div className="font-semibold text-sm">High Availability</div>
                  <div className="text-xs text-gray-600">Very flexible schedule</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, availability: 'moderate' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.availability === 'moderate'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🔵</div>
                  <div className="font-semibold text-sm">Moderate</div>
                  <div className="text-xs text-gray-600">Some flexibility</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, availability: 'limited' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.availability === 'limited'
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🟡</div>
                  <div className="font-semibold text-sm">Limited</div>
                  <div className="text-xs text-gray-600">Busy schedule</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, availability: 'very-limited' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.availability === 'very-limited'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🔴</div>
                  <div className="font-semibold text-sm">Very Limited</div>
                  <div className="text-xs text-gray-600">Rarely available</div>
                </button>
              </div>
            </div>

            {/* Decision Authority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⚡ Decision-Making Authority <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">What level of decision-making authority do you have?</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, decision_authority: 'high' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.decision_authority === 'high'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">👑</div>
                  <div className="font-semibold text-sm">High</div>
                  <div className="text-xs text-gray-600">Final decision maker</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, decision_authority: 'medium' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.decision_authority === 'medium'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🔷</div>
                  <div className="font-semibold text-sm">Medium</div>
                  <div className="text-xs text-gray-600">Can recommend</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, decision_authority: 'low' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.decision_authority === 'low'
                      ? 'border-gray-600 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🔹</div>
                  <div className="font-semibold text-sm">Low</div>
                  <div className="text-xs text-gray-600">Provide input only</div>
                </button>
              </div>
            </div>

            {/* Priorities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Primary Concerns/Priorities <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.priorities}
                onChange={(e) => setFormData({ ...formData, priorities: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="4"
                placeholder="e.g., Timeline adherence, budget control, quality standards, stakeholder communication..."
              />
            </div>

            {/* Communication Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💬 Preferred Communication Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, preferred_contact: 'email' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.preferred_contact === 'email'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">📧</div>
                  <div className="font-semibold text-sm">Email</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, preferred_contact: 'phone' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.preferred_contact === 'phone'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">📞</div>
                  <div className="font-semibold text-sm">Phone</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, preferred_contact: 'slack' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.preferred_contact === 'slack'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">💬</div>
                  <div className="font-semibold text-sm">Slack/Chat</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, preferred_contact: 'video' })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.preferred_contact === 'video'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">📹</div>
                  <div className="font-semibold text-sm">Video Call</div>
                </button>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600">
                <strong>Privacy Notice:</strong> Your information will be used solely for project planning
                and communication purposes. We will not share your data with third parties without your consent.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Submit Information
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by FlowTrack - Project Management & AI Insights</p>
        </div>
      </div>
    </div>
  );
};

export default StakeholderFormPage;
