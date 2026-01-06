import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import StakeholderDetailDrawer from './StakeholderDetailDrawer';
import AddStakeholderModal from './AddStakeholderModal';
import InviteStakeholderModal from './InviteStakeholderModal';

export default function StakeholdersPage() {
  const { user } = useAuth();
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'responsive' | 'decision-makers' | 'limited'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadStakeholders();
  }, []);

  const loadStakeholders = async () => {
    setLoading(true);
    const { data, error } = await supabaseHelpers.getStakeholders();
    if (!error && data) {
      setStakeholders(data);
    }
    setLoading(false);
  };

  const handleStakeholderCreated = (newStakeholder) => {
    setStakeholders([newStakeholder, ...stakeholders]);
    setShowAddModal(false);
    setSelectedStakeholder(newStakeholder);
  };

  const handleStakeholderUpdated = (updatedStakeholder) => {
    setStakeholders(stakeholders.map((s) => (s.id === updatedStakeholder.id ? updatedStakeholder : s)));
    setSelectedStakeholder(updatedStakeholder);
  };

  const handleStakeholderDeleted = (stakeholderId) => {
    setStakeholders(stakeholders.filter((s) => s.id !== stakeholderId));
    setSelectedStakeholder(null);
  };

  // Filter stakeholders
  const filteredStakeholders = stakeholders.filter((stakeholder) => {
    const matchesType =
      filterType === 'all' ||
      (filterType === 'responsive' && stakeholder.response_time === 'fast') ||
      (filterType === 'decision-makers' && stakeholder.decision_authority === 'high') ||
      (filterType === 'limited' && ['limited', 'very-limited'].includes(stakeholder.availability));

    const matchesSearch =
      !searchQuery ||
      stakeholder.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stakeholder.clients?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stakeholder.job_title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: stakeholders.length,
    fastResponders: stakeholders.filter((s) => s.response_time === 'fast').length,
    decisionMakers: stakeholders.filter((s) => s.decision_authority === 'high').length,
    avgResponseTime:
      stakeholders.length > 0
        ? (
            stakeholders.reduce((sum, s) => sum + (s.avg_response_hours || 0), 0) / stakeholders.length
          ).toFixed(1)
        : 0,
  };

  // Get stakeholders with limited availability for AI insights
  const limitedStakeholders = stakeholders.filter(
    (s) => ['limited', 'very-limited'].includes(s.availability) || s.response_time === 'slow'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stakeholders</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track communication preferences and availability to improve project planning
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-white border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium flex items-center gap-2"
            >
              <span>📧</span>
              Invite Stakeholder
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
            >
              <span>+</span>
              Add Stakeholder
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-600">Total Stakeholders</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.fastResponders}</div>
                <div className="text-xs text-gray-600">Fast Responders</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl">
                👑
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.decisionMakers}</div>
                <div className="text-xs text-gray-600">Decision Makers</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center text-2xl">
                ⏱️
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}h</div>
                <div className="text-xs text-gray-600">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Planning Insight Banner */}
      {limitedStakeholders.length > 0 && (
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Planning Insight</h4>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{limitedStakeholders.length} stakeholder{limitedStakeholders.length > 1 ? 's' : ''}</span>{' '}
                    {limitedStakeholders.length > 1 ? 'have' : 'has'} limited availability and slow response times.
                    Consider adding{' '}
                    <span className="font-semibold">3-5 extra days</span> to timelines for projects involving{' '}
                    <span className="font-semibold text-purple-700">
                      {limitedStakeholders.map((s) => s.full_name).join(' or ')}
                    </span>{' '}
                    for approvals.
                  </p>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap">
                View Details →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="px-6 pb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search stakeholders or clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('responsive')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                    filterType === 'responsive'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>⚡</span> Responsive
                </button>
                <button
                  onClick={() => setFilterType('decision-makers')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                    filterType === 'decision-makers'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>👑</span> Decision Makers
                </button>
                <button
                  onClick={() => setFilterType('limited')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                    filterType === 'limited'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>⚠️</span> Limited Avail.
                </button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        {filteredStakeholders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">👔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No stakeholders found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first stakeholder'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Add Stakeholder
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <StakeholdersGrid stakeholders={filteredStakeholders} onSelect={setSelectedStakeholder} />
        ) : (
          <StakeholdersList stakeholders={filteredStakeholders} onSelect={setSelectedStakeholder} />
        )}
      </div>

      {/* Stakeholder Detail Drawer */}
      {selectedStakeholder && (
        <StakeholderDetailDrawer
          stakeholder={selectedStakeholder}
          onClose={() => setSelectedStakeholder(null)}
          onUpdate={handleStakeholderUpdated}
          onDelete={handleStakeholderDeleted}
        />
      )}

      {/* Add Stakeholder Modal */}
      {showAddModal && (
        <AddStakeholderModal
          onClose={() => setShowAddModal(false)}
          onStakeholderCreated={handleStakeholderCreated}
        />
      )}

      {/* Invite Stakeholder Modal */}
      {showInviteModal && (
        <InviteStakeholderModal
          onClose={() => setShowInviteModal(false)}
          onInvitationSent={() => {
            setShowInviteModal(false);
            // Optionally show a success message
          }}
        />
      )}
    </div>
  );
}

// Grid View Component
function StakeholdersGrid({ stakeholders, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {stakeholders.map((stakeholder) => (
        <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} onClick={() => onSelect(stakeholder)} />
      ))}
    </div>
  );
}

// Stakeholder Card Component
function StakeholderCard({ stakeholder, onClick }) {
  const getResponseBadge = (responseTime) => {
    switch (responseTime) {
      case 'fast':
        return { label: 'Fast (<2h)', color: 'bg-emerald-100 text-emerald-700', icon: '⚡' };
      case 'moderate':
        return { label: 'Moderate', color: 'bg-amber-100 text-amber-700', icon: '🕐' };
      case 'slow':
        return { label: 'Slow (>24h)', color: 'bg-red-100 text-red-700', icon: '🐢' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: '?' };
    }
  };

  const getAvailabilityBadge = (availability) => {
    switch (availability) {
      case 'high':
        return { label: 'High', color: 'bg-emerald-100 text-emerald-700', icon: '🟢' };
      case 'moderate':
        return { label: 'Moderate', color: 'bg-blue-100 text-blue-700', icon: '🔵' };
      case 'limited':
        return { label: 'Limited', color: 'bg-amber-100 text-amber-700', icon: '🟡' };
      case 'very-limited':
        return { label: 'Very Limited', color: 'bg-red-100 text-red-700', icon: '🔴' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: '⚪' };
    }
  };

  const getAuthorityBadge = (authority) => {
    switch (authority) {
      case 'high':
        return { label: 'High', color: 'bg-purple-100 text-purple-700', icon: '👑' };
      case 'medium':
        return { label: 'Medium', color: 'bg-blue-100 text-blue-700', icon: '🔷' };
      case 'low':
        return { label: 'Low', color: 'bg-gray-100 text-gray-600', icon: '🔹' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: '?' };
    }
  };

  const getContactIcon = (method) => {
    switch (method) {
      case 'slack':
        return '💬';
      case 'email':
        return '📧';
      case 'phone':
        return '📞';
      case 'video':
        return '📹';
      default:
        return '💬';
    }
  };

  const responseBadge = getResponseBadge(stakeholder.response_time);
  const availabilityBadge = getAvailabilityBadge(stakeholder.availability);
  const authorityBadge = getAuthorityBadge(stakeholder.decision_authority);

  // Get initials
  const initials = stakeholder.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Parse working style tags
  const workingStyleTags = [];
  if (stakeholder.working_style) {
    const style = stakeholder.working_style;
    if (style.quickDecisions) workingStyleTags.push('Quick decisions');
    if (style.prefersAsync) workingStyleTags.push('Prefers async');
    if (style.needsContext) workingStyleTags.push('Needs context');
    if (style.detailOriented) workingStyleTags.push('Detail oriented');
  }

  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow text-left w-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: stakeholder.avatar_color }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{stakeholder.full_name}</h3>
            <p className="text-xs text-gray-500">{stakeholder.job_title}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium ${availabilityBadge.color}`}>
            {availabilityBadge.icon} {availabilityBadge.label.split(' ')[0]}
          </span>
        </div>

        {/* Company */}
        {stakeholder.clients && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{stakeholder.clients.logo}</span>
            <span>{stakeholder.clients.name}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Response Time</div>
            <div className={`text-xs px-2 py-1 rounded font-medium inline-flex items-center gap-1 ${responseBadge.color}`}>
              <span>{responseBadge.icon}</span>
              <span>{responseBadge.label}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Decision Authority</div>
            <div className={`text-xs px-2 py-1 rounded font-medium inline-flex items-center gap-1 ${authorityBadge.color}`}>
              <span>{authorityBadge.icon}</span>
              <span>{authorityBadge.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-500 mb-1">Best way to reach</div>
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <span>{getContactIcon(stakeholder.preferred_contact)}</span>
              <span className="capitalize">{stakeholder.preferred_contact}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Best time</div>
            <div className="font-medium text-gray-900">{stakeholder.best_time_to_reach || 'Flexible'}</div>
          </div>
        </div>
      </div>

      {/* Working Style Tags */}
      {workingStyleTags.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {workingStyleTags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{stakeholder.total_interactions || 0} interactions</span>
          <span>Last: {stakeholder.last_interaction_at ? getRelativeTime(stakeholder.last_interaction_at) : 'Never'}</span>
        </div>
      </div>
    </button>
  );
}

// List View Component
function StakeholdersList({ stakeholders, onSelect }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stakeholder
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Response
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Availability
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Authority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stakeholders.map((stakeholder) => {
            const initials = stakeholder.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase();

            return (
              <tr
                key={stakeholder.id}
                onClick={() => onSelect(stakeholder)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                      style={{ backgroundColor: stakeholder.avatar_color }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{stakeholder.full_name}</div>
                      <div className="text-sm text-gray-500">{stakeholder.job_title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {stakeholder.clients && (
                    <div className="flex items-center gap-2">
                      <span>{stakeholder.clients.logo}</span>
                      <span className="text-sm text-gray-900">{stakeholder.clients.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      stakeholder.response_time === 'fast'
                        ? 'bg-emerald-100 text-emerald-700'
                        : stakeholder.response_time === 'moderate'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stakeholder.response_time}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      stakeholder.availability === 'high'
                        ? 'bg-emerald-100 text-emerald-700'
                        : stakeholder.availability === 'moderate'
                        ? 'bg-blue-100 text-blue-700'
                        : stakeholder.availability === 'limited'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stakeholder.availability}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      stakeholder.decision_authority === 'high'
                        ? 'bg-purple-100 text-purple-700'
                        : stakeholder.decision_authority === 'medium'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {stakeholder.decision_authority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      {stakeholder.preferred_contact === 'slack'
                        ? '💬'
                        : stakeholder.preferred_contact === 'email'
                        ? '📧'
                        : stakeholder.preferred_contact === 'phone'
                        ? '📞'
                        : '📹'}
                    </span>
                    <span className="capitalize">{stakeholder.preferred_contact}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">→</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Helper function
function getRelativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMs = now - date;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
}
