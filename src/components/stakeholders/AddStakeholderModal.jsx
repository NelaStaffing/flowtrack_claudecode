import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const CONTACT_METHODS = [
  { id: 'slack', label: 'Slack', icon: '💬' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'phone', label: 'Phone', icon: '📞' },
  { id: 'video', label: 'Video', icon: '📹' },
];

const COMMUNICATION_STYLES = [
  { id: 'direct', label: 'Direct', description: 'Gets to the point quickly', icon: '🎯' },
  { id: 'detailed', label: 'Detailed', description: 'Needs full context', icon: '📋' },
  { id: 'visual', label: 'Visual', description: 'Prefers diagrams/mockups', icon: '📊' },
  { id: 'formal', label: 'Formal', description: 'Professional tone required', icon: '📝' },
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function AddStakeholderModal({ onClose, onStakeholderCreated }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    full_name: '',
    job_title: '',
    client_id: '',
    email: '',
    phone: '',
    timezone: 'EST (UTC-5)',

    // Step 2: Communication Preferences
    preferred_contact: 'email',
    communication_style: 'direct',
    response_time: 'moderate',
    avg_response_hours: 24,
    best_time_to_reach: '',

    // Step 3: Availability & Scheduling
    availability: 'moderate',
    busy_days: [],
    preferred_meeting_days: [],
    meeting_preference: '30min',
    availability_notes: '',

    // Step 4: Decision Making & Notes
    decision_authority: 'medium',
    working_style: {
      quickDecisions: false,
      prefersAsync: false,
      needsContext: false,
      detailOriented: false,
    },
    notes: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data } = await supabaseHelpers.getClients();
    if (data) setClients(data.filter((c) => c.status === 'active'));
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleWorkingStyle = (key) => {
    handleChange('working_style', {
      ...formData.working_style,
      [key]: !formData.working_style[key],
    });
  };

  const toggleDay = (day, type) => {
    const currentDays = formData[type];
    if (currentDays.includes(day)) {
      handleChange(
        type,
        currentDays.filter((d) => d !== day)
      );
    } else {
      handleChange(type, [...currentDays, day]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.full_name.trim() !== '' && formData.client_id !== '';
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    const stakeholderData = {
      full_name: formData.full_name,
      job_title: formData.job_title || null,
      client_id: formData.client_id,
      email: formData.email || null,
      phone: formData.phone || null,
      timezone: formData.timezone,
      avatar_color: generateColor(),

      preferred_contact: formData.preferred_contact,
      communication_style: formData.communication_style,
      response_time: formData.response_time,
      avg_response_hours: formData.avg_response_hours,
      best_time_to_reach: formData.best_time_to_reach || null,

      availability: formData.availability,
      busy_days: formData.busy_days,
      preferred_meeting_days: formData.preferred_meeting_days,
      meeting_preference: formData.meeting_preference,
      availability_notes: formData.availability_notes || null,

      decision_authority: formData.decision_authority,
      working_style: formData.working_style,
      notes: formData.notes || null,

      created_by: user.id,
    };

    const { data, error } = await supabaseHelpers.createStakeholder(stakeholderData);

    if (error) {
      alert('Failed to create stakeholder. Please try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
    onStakeholderCreated(data[0]);
  };

  const generateColor = () => {
    const colors = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getProgressWidth = () => {
    return `${(currentStep / 4) * 100}%`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-xl overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: getProgressWidth() }}
            ></div>
          </div>

          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-2xl">
                  👔
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentStep === 1 && 'Basic Information'}
                    {currentStep === 2 && 'Communication Preferences'}
                    {currentStep === 3 && 'Availability & Scheduling'}
                    {currentStep === 4 && 'Decision Making & Notes'}
                  </h2>
                  <p className="text-sm text-gray-600">Step {currentStep} of 4</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[500px]">
            {currentStep === 1 && <Step1BasicInfo formData={formData} onChange={handleChange} clients={clients} />}
            {currentStep === 2 && <Step2Communication formData={formData} onChange={handleChange} />}
            {currentStep === 3 && <Step3Availability formData={formData} onChange={handleChange} toggleDay={toggleDay} />}
            {currentStep === 4 && <Step4DecisionNotes formData={formData} onChange={handleChange} toggleWorkingStyle={toggleWorkingStyle} />}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-xl">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 hover:bg-white rounded-lg border border-gray-300"
                >
                  ← Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Step Indicators */}
              <div className="flex gap-2 mr-4">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${
                      step === currentStep
                        ? 'bg-purple-600'
                        : step < currentStep
                        ? 'bg-purple-300'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-white rounded-lg border border-gray-300"
              >
                Cancel
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !canProceed()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    '✓ Create Stakeholder'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1BasicInfo({ formData, onChange, clients }) {
  return (
    <div className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-4xl">
          👤
        </div>
      </div>

      {/* Name & Title */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => onChange('full_name', e.target.value)}
            placeholder="John Smith"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
          <input
            type="text"
            value={formData.job_title}
            onChange={(e) => onChange('job_title', e.target.value)}
            placeholder="CTO"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Client */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Client <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.client_id}
          onChange={(e) => onChange('client_id', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="">Select a client...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.logo} {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <select
          value={formData.timezone}
          onChange={(e) => onChange('timezone', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="EST (UTC-5)">EST (UTC-5)</option>
          <option value="CST (UTC-6)">CST (UTC-6)</option>
          <option value="MST (UTC-7)">MST (UTC-7)</option>
          <option value="PST (UTC-8)">PST (UTC-8)</option>
          <option value="GMT (UTC+0)">GMT (UTC+0)</option>
        </select>
      </div>
    </div>
  );
}

function Step2Communication({ formData, onChange }) {
  return (
    <div className="space-y-6">
      {/* Preferred Contact Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Contact Method</label>
        <div className="grid grid-cols-4 gap-3">
          {CONTACT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => onChange('preferred_contact', method.id)}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.preferred_contact === method.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{method.icon}</div>
              <div className="text-sm font-medium text-gray-900">{method.label}</div>
              {formData.preferred_contact === method.id && (
                <div className="text-xs text-purple-600 mt-1">✓ Selected</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Communication Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Communication Style</label>
        <div className="grid grid-cols-2 gap-3">
          {COMMUNICATION_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onChange('communication_style', style.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.communication_style === style.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{style.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{style.label}</div>
                  <div className="text-xs text-gray-600">{style.description}</div>
                  {formData.communication_style === style.id && (
                    <div className="text-xs text-purple-600 mt-1">✓ Selected</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Typical Response Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Typical Response Time</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              onChange('response_time', 'fast');
              onChange('avg_response_hours', 1.5);
            }}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              formData.response_time === 'fast'
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">⚡</div>
            <div className="font-semibold text-gray-900">Fast</div>
            <div className="text-xs text-gray-600">&lt;2h</div>
          </button>
          <button
            onClick={() => {
              onChange('response_time', 'moderate');
              onChange('avg_response_hours', 12);
            }}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              formData.response_time === 'moderate'
                ? 'border-amber-600 bg-amber-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">🕐</div>
            <div className="font-semibold text-gray-900">Moderate</div>
            <div className="text-xs text-gray-600">2-24h</div>
          </button>
          <button
            onClick={() => {
              onChange('response_time', 'slow');
              onChange('avg_response_hours', 36);
            }}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              formData.response_time === 'slow'
                ? 'border-red-600 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">🐢</div>
            <div className="font-semibold text-gray-900">Slow</div>
            <div className="text-xs text-gray-600">&gt;24h</div>
          </button>
        </div>
      </div>

      {/* Best Time to Reach */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Best Time to Reach</label>
        <input
          type="text"
          value={formData.best_time_to_reach}
          onChange={(e) => onChange('best_time_to_reach', e.target.value)}
          placeholder="10am - 4pm PST"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>
    </div>
  );
}

function Step3Availability({ formData, onChange, toggleDay }) {
  return (
    <div className="space-y-6">
      {/* Overall Availability */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Overall Availability</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: 'high', label: 'High', icon: '🟢', color: 'emerald' },
            { id: 'moderate', label: 'Moderate', icon: '🔵', color: 'blue' },
            { id: 'limited', label: 'Limited', icon: '🟡', color: 'amber' },
            { id: 'very-limited', label: 'Very Limited', icon: '🔴', color: 'red' },
          ].map((avail) => (
            <button
              key={avail.id}
              onClick={() => onChange('availability', avail.id)}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.availability === avail.id
                  ? `border-${avail.color}-600 bg-${avail.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{avail.icon}</div>
              <div className="text-sm font-medium text-gray-900">{avail.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Days to Avoid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Days to Avoid</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day, 'busy_days')}
              className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                formData.busy_days.includes(day)
                  ? 'border-red-600 bg-red-100 text-red-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Meeting Days */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Meeting Days</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day, 'preferred_meeting_days')}
              className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                formData.preferred_meeting_days.includes(day)
                  ? 'border-green-600 bg-green-100 text-green-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Meeting Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Meeting Duration</label>
        <div className="flex gap-2">
          {['15min', '30min', '45min', '1hour'].map((duration) => (
            <button
              key={duration}
              onClick={() => onChange('meeting_preference', duration)}
              className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                formData.meeting_preference === duration
                  ? 'border-purple-600 bg-purple-100 text-purple-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Availability Notes</label>
        <textarea
          value={formData.availability_notes}
          onChange={(e) => onChange('availability_notes', e.target.value)}
          placeholder="e.g., Very responsive on Slack. Avoid Mondays (all-day meetings)"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        ></textarea>
      </div>
    </div>
  );
}

function Step4DecisionNotes({ formData, onChange, toggleWorkingStyle }) {
  return (
    <div className="space-y-6">
      {/* Decision Authority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Decision Authority</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'high', label: 'High', icon: '👑', color: 'purple' },
            { id: 'medium', label: 'Medium', icon: '🔷', color: 'blue' },
            { id: 'low', label: 'Low / Influencer', icon: '🔹', color: 'gray' },
          ].map((authority) => (
            <button
              key={authority.id}
              onClick={() => onChange('decision_authority', authority.id)}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.decision_authority === authority.id
                  ? `border-${authority.color}-600 bg-${authority.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{authority.icon}</div>
              <div className="text-sm font-medium text-gray-900">{authority.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Working Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Working Style</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'quickDecisions', label: 'Makes quick decisions', icon: '⚡' },
            { key: 'prefersAsync', label: 'Prefers async communication', icon: '💬' },
            { key: 'needsContext', label: 'Needs detailed context', icon: '📋' },
            { key: 'detailOriented', label: 'Detail oriented', icon: '🔍' },
          ].map((style) => (
            <button
              key={style.key}
              onClick={() => toggleWorkingStyle(style.key)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.working_style[style.key]
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{style.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{style.label}</div>
                  {formData.working_style[style.key] && (
                    <div className="text-xs text-purple-600 mt-1">✓ Selected</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* General Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">General Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Add any important notes about how to work with this stakeholder..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        ></textarea>
      </div>
    </div>
  );
}
