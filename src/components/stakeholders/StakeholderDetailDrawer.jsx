import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../lib/supabase';

export default function StakeholderDetailDrawer({ stakeholder, onClose, onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      loadInteractions();
    }
  }, [activeTab, stakeholder.id]);

  const loadInteractions = async () => {
    const { data } = await supabaseHelpers.getStakeholderInteractions(stakeholder.id);
    if (data) setInteractions(data);
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this stakeholder?')) return;
    const { error } = await supabaseHelpers.deleteStakeholder(stakeholder.id);
    if (!error) {
      onDelete(stakeholder.id);
    }
  };

  const tabs = [
    { id: 'overview', label: '📋 Overview' },
    { id: 'communication', label: '💬 Communication' },
    { id: 'availability', label: '📅 Availability' },
    { id: 'history', label: '📊 History' },
  ];

  // Get initials
  const initials = stakeholder.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const getResponseBadge = (responseTime) => {
    const badges = {
      fast: { label: '⚡ Fast (<2h)', color: 'bg-emerald-100 text-emerald-700' },
      moderate: { label: '🕐 Moderate', color: 'bg-amber-100 text-amber-700' },
      slow: { label: '🐢 Slow (>24h)', color: 'bg-red-100 text-red-700' },
    };
    return badges[responseTime] || badges.moderate;
  };

  const getAvailabilityBadge = (availability) => {
    const badges = {
      high: { label: '🟢 High Availability', color: 'bg-emerald-100 text-emerald-700' },
      moderate: { label: '🔵 Moderate', color: 'bg-blue-100 text-blue-700' },
      limited: { label: '🟡 Limited', color: 'bg-amber-100 text-amber-700' },
      'very-limited': { label: '🔴 Very Limited', color: 'bg-red-100 text-red-700' },
    };
    return badges[availability] || badges.moderate;
  };

  const responseBadge = getResponseBadge(stakeholder.response_time);
  const availabilityBadge = getAvailabilityBadge(stakeholder.availability);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="absolute right-0 top-0 h-full w-[700px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: stakeholder.avatar_color }}
              >
                {initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{stakeholder.full_name}</h2>
                <p className="text-gray-600">
                  {stakeholder.job_title} at {stakeholder.clients?.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${responseBadge.color}`}>
                    {responseBadge.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${availabilityBadge.color}`}>
                    {availabilityBadge.label}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab stakeholder={stakeholder} />}
          {activeTab === 'communication' && <CommunicationTab stakeholder={stakeholder} />}
          {activeTab === 'availability' && <AvailabilityTab stakeholder={stakeholder} />}
          {activeTab === 'history' && <HistoryTab stakeholder={stakeholder} interactions={interactions} />}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            🗑 Remove Stakeholder
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Export Profile
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ stakeholder }) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
          <div className="text-xl mb-1">📧</div>
          <div className="text-xs font-medium text-gray-700">Email</div>
        </button>
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
          <div className="text-xl mb-1">📞</div>
          <div className="text-xs font-medium text-gray-700">Call</div>
        </button>
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
          <div className="text-xl mb-1">💬</div>
          <div className="text-xs font-medium text-gray-700">Slack</div>
        </button>
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
          <div className="text-xl mb-1">📅</div>
          <div className="text-xs font-medium text-gray-700">Schedule</div>
        </button>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="text-gray-900">{stakeholder.email}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Phone</div>
            <div className="text-gray-900">{stakeholder.phone}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Timezone</div>
            <div className="text-gray-900">{stakeholder.timezone}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Client</div>
            <div className="flex items-center gap-2">
              <span>{stakeholder.clients?.logo}</span>
              <span className="text-gray-900">{stakeholder.clients?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      {stakeholder.important_notes && stakeholder.important_notes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Important Notes for Planning</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {stakeholder.important_notes.map((note, idx) => (
                  <li key={idx}>- {note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Decision Authority */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Decision Authority</h3>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Authority Level</div>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                stakeholder.decision_authority === 'high'
                  ? 'bg-purple-100 text-purple-700'
                  : stakeholder.decision_authority === 'medium'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {stakeholder.decision_authority === 'high' && '👑 '}
              {stakeholder.decision_authority === 'medium' && '🔷 '}
              {stakeholder.decision_authority === 'low' && '🔹 '}
              {stakeholder.decision_authority?.charAt(0).toUpperCase() +
                stakeholder.decision_authority?.slice(1)}
            </span>
          </div>
          {stakeholder.approval_areas && stakeholder.approval_areas.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Can Approve</div>
              <div className="flex flex-wrap gap-2">
                {stakeholder.approval_areas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Working Style */}
      {stakeholder.working_style && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Working Style</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Quick Decisions</div>
              <div className="font-semibold text-gray-900">
                {stakeholder.working_style.quickDecisions ? '⚡ Yes' : '❌ No'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Async Communication</div>
              <div className="font-semibold text-gray-900">
                {stakeholder.working_style.prefersAsync ? '✓ Preferred' : '❌ No preference'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Context Required</div>
              <div className="font-semibold text-gray-900">
                {stakeholder.working_style.needsContext ? '🎯 Yes, detailed' : '📝 Brief is fine'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Detail Oriented</div>
              <div className="font-semibold text-gray-900">
                {stakeholder.working_style.detailOriented ? '🔍 Very' : '❌ Not particularly'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommunicationTab({ stakeholder }) {
  const contactMethods = [
    { id: 'slack', label: 'Slack', icon: '💬' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'phone', label: 'Phone', icon: '📞' },
    { id: 'video', label: 'Video', icon: '📹' },
  ];

  const communicationStyles = [
    { id: 'direct', label: 'Direct', description: 'Gets to the point quickly', icon: '🎯' },
    { id: 'detailed', label: 'Detailed', description: 'Needs full context', icon: '📋' },
    { id: 'visual', label: 'Visual', description: 'Prefers diagrams/mockups', icon: '📊' },
    { id: 'formal', label: 'Formal', description: 'Professional tone required', icon: '📝' },
  ];

  return (
    <div className="space-y-6">
      {/* Preferred Contact Method */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Preferred Contact Method</h3>
        <div className="grid grid-cols-2 gap-3">
          {contactMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                stakeholder.preferred_contact === method.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-2xl mb-1">{method.icon}</div>
              <div className="font-semibold text-gray-900">{method.label}</div>
              {stakeholder.preferred_contact === method.id && (
                <div className="text-xs text-purple-600 mt-1">✓ Preferred</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Communication Style */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Communication Style</h3>
        <div className="grid grid-cols-2 gap-3">
          {communicationStyles.map((style) => (
            <div
              key={style.id}
              className={`p-4 border-2 rounded-lg ${
                stakeholder.communication_style === style.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{style.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{style.label}</div>
                  <div className="text-xs text-gray-600">{style.description}</div>
                  {stakeholder.communication_style === style.id && (
                    <div className="text-xs text-purple-600 mt-1">✓ Selected</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Time */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Response Time</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Typical response time</span>
            <span className="text-lg font-bold text-gray-900">{stakeholder.avg_response_hours}h</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full ${
                stakeholder.response_time === 'fast'
                  ? 'bg-emerald-500'
                  : stakeholder.response_time === 'moderate'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((stakeholder.avg_response_hours / 48) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0h</span>
            <span>24h</span>
            <span>48h+</span>
          </div>
          <div className="mt-3">
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                stakeholder.response_time === 'fast'
                  ? 'bg-emerald-100 text-emerald-700'
                  : stakeholder.response_time === 'moderate'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {stakeholder.response_time === 'fast' && '⚡ Fast (<2h)'}
              {stakeholder.response_time === 'moderate' && '🕐 Moderate (2-24h)'}
              {stakeholder.response_time === 'slow' && '🐢 Slow (>24h)'}
            </span>
          </div>
        </div>
      </div>

      {/* Best Time to Reach */}
      {stakeholder.best_time_to_reach && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-xl">⏰</span>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Best Time to Reach</h4>
              <p className="text-gray-700">{stakeholder.best_time_to_reach}</p>
              <p className="text-sm text-gray-600 mt-1">{stakeholder.timezone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AvailabilityTab({ stakeholder }) {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getBufferRecommendation = (availability, responseTime) => {
    if (availability === 'very-limited' || responseTime === 'slow') return '5-7';
    if (availability === 'limited') return '3-5';
    if (availability === 'moderate') return '1-2';
    return '0-1';
  };

  const bufferDays = getBufferRecommendation(stakeholder.availability, stakeholder.response_time);

  return (
    <div className="space-y-6">
      {/* Availability Overview */}
      <div
        className={`rounded-lg p-4 ${
          stakeholder.availability === 'high'
            ? 'bg-emerald-50 border border-emerald-200'
            : stakeholder.availability === 'moderate'
            ? 'bg-blue-50 border border-blue-200'
            : stakeholder.availability === 'limited'
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-red-50 border border-red-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">
            {stakeholder.availability === 'high' && '🟢'}
            {stakeholder.availability === 'moderate' && '🔵'}
            {stakeholder.availability === 'limited' && '🟡'}
            {stakeholder.availability === 'very-limited' && '🔴'}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {stakeholder.availability === 'high' && 'High Availability'}
              {stakeholder.availability === 'moderate' && 'Moderate Availability'}
              {stakeholder.availability === 'limited' && 'Limited Availability'}
              {stakeholder.availability === 'very-limited' && 'Very Limited Availability'}
            </h3>
            <p className="text-sm text-gray-700">{stakeholder.availability_notes}</p>
          </div>
        </div>
      </div>

      {/* Weekly Availability */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Weekly Availability</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const isBusy = stakeholder.busy_days?.includes(day);
            const isPreferred = stakeholder.preferred_meeting_days?.includes(day);
            return (
              <div
                key={day}
                className={`p-3 rounded-lg text-center ${
                  isPreferred
                    ? 'bg-emerald-100 border-2 border-emerald-500'
                    : isBusy
                    ? 'bg-red-100 border-2 border-red-500'
                    : 'bg-gray-100 border-2 border-gray-300'
                }`}
              >
                <div className="text-xs font-medium text-gray-900 mb-1">{shortDays[idx]}</div>
                <div className="text-lg">
                  {isPreferred ? '🟢' : isBusy ? '🔴' : '⚪'}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span>🟢</span>
            <span>Preferred</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚪</span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔴</span>
            <span>Busy/Avoid</span>
          </div>
        </div>
      </div>

      {/* Meeting Preferences */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Preferred Duration</h4>
          <div className="text-2xl font-bold text-purple-600">{stakeholder.meeting_preference}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Best Days</h4>
          <div className="text-sm text-gray-700">
            {stakeholder.preferred_meeting_days?.join(', ') || 'Flexible'}
          </div>
        </div>
      </div>

      {/* Planning Recommendation */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-purple-600 text-xl">📊</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Planning Recommendation</h4>
            <p className="text-sm text-gray-700">
              Based on this stakeholder's{' '}
              <span className="font-semibold">{stakeholder.availability} availability</span> and{' '}
              <span className="font-semibold">{stakeholder.avg_response_hours}h average response time</span>,
              add <span className="font-semibold text-purple-700">{bufferDays} days</span> buffer to any
              timeline that requires their input or approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ stakeholder, interactions }) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stakeholder.total_interactions || 0}</div>
          <div className="text-xs text-gray-600">Total Interactions</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stakeholder.meetings_held || 0}</div>
          <div className="text-xs text-gray-600">Meetings Held</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {stakeholder.avg_meeting_rating || 0}
            <span className="text-sm">⭐</span>
          </div>
          <div className="text-xs text-gray-600">Avg Rating</div>
        </div>
      </div>

      {/* Recent Interactions */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Recent Interactions</h3>
        {interactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No interactions recorded yet</div>
        ) : (
          <div className="space-y-3">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">
                    {interaction.interaction_type === 'meeting' && '📹'}
                    {interaction.interaction_type === 'email' && '📧'}
                    {interaction.interaction_type === 'slack' && '💬'}
                    {interaction.interaction_type === 'phone' && '📞'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{interaction.title}</h4>
                        <p className="text-sm text-gray-600">{interaction.description}</p>
                      </div>
                      {interaction.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < interaction.rating ? 'text-amber-500' : 'text-gray-300'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{new Date(interaction.interaction_date).toLocaleDateString()}</span>
                      {interaction.duration_minutes && <span>{interaction.duration_minutes}min</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-600 hover:text-purple-600 font-medium">
          + Log New Interaction
        </button>
      </div>
    </div>
  );
}
