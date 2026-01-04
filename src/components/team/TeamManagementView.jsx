import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';
import InviteMemberModal from './InviteMemberModal';
import EditMemberModal from './EditMemberModal';

const TeamManagementView = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [teamMembers, setTeamMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [membersResult, invitesResult] = await Promise.all([
      supabaseHelpers.getTeamMembers(),
      supabaseHelpers.getInvitations(),
    ]);

    if (membersResult.data) setTeamMembers(membersResult.data);
    if (invitesResult.data) setInvitations(invitesResult.data);
    setLoading(false);
  };

  const handleInviteSent = async () => {
    await loadData();
    setShowInviteModal(false);
  };

  const handleMemberUpdated = async () => {
    await loadData();
    setShowEditModal(false);
    setSelectedMember(null);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleRevokeInvite = async (id) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return;

    const { error } = await supabaseHelpers.revokeInvitation(id);
    if (!error) {
      await loadData();
    }
  };

  const handleResendInvite = async (id) => {
    const { error } = await supabaseHelpers.resendInvitation(id);
    if (!error) {
      alert('Invitation resent successfully!');
      await loadData();
    }
  };

  // Filter members
  const filteredMembers = teamMembers.filter((member) => {
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesSearch = !searchQuery ||
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter((m) => m.status === 'active').length,
    blocked: teamMembers.filter((m) => m.status === 'blocked').length,
    away: teamMembers.filter((m) => m.status === 'away').length,
    pendingInvites: invitations.length,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your team members, roles, and permissions
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            + Invite Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          <StatCard value={stats.total} label="Team Members" />
          <StatCard value={stats.active} label="Active Now" color="emerald" />
          <StatCard value={stats.blocked} label="Blocked" color="red" />
          <StatCard value={stats.away} label="Away" color="amber" />
          <StatCard value={stats.pendingInvites} label="Pending Invites" color="blue" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-4 border-b border-gray-200">
          <TabButton
            active={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
            icon="👥"
            label="Team Members"
            count={teamMembers.length}
          />
          <TabButton
            active={activeTab === 'roles'}
            onClick={() => setActiveTab('roles')}
            icon="🔐"
            label="Roles & Permissions"
          />
          <TabButton
            active={activeTab === 'invites'}
            onClick={() => setActiveTab('invites')}
            icon="📧"
            label="Pending Invites"
            count={invitations.length}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === 'members' && (
          <TeamMembersTab
            members={filteredMembers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onEditMember={handleEditMember}
            loading={loading}
          />
        )}
        {activeTab === 'roles' && <RolesTab members={teamMembers} />}
        {activeTab === 'invites' && (
          <InvitesTab
            invitations={invitations}
            onRevoke={handleRevokeInvite}
            onResend={handleResendInvite}
            loading={loading}
          />
        )}
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInviteSent={handleInviteSent}
        />
      )}

      {showEditModal && selectedMember && (
        <EditMemberModal
          member={selectedMember}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          onMemberUpdated={handleMemberUpdated}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ value, label, color = 'purple' }) => {
  const colors = {
    purple: 'bg-purple-100',
    emerald: 'bg-emerald-100',
    red: 'bg-red-100',
    amber: 'bg-amber-100',
    blue: 'bg-blue-100',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${
      active
        ? 'border-purple-600 text-purple-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    <span className="mr-2">{icon}</span>
    {label}
    {count !== undefined && <span className="ml-2">({count})</span>}
  </button>
);

// Team Members Tab Component
const TeamMembersTab = ({
  members,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onEditMember,
  loading,
}) => {
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      developer: 'bg-blue-100 text-blue-700',
      viewer: 'bg-gray-100 text-gray-600',
      contractor: 'bg-amber-100 text-amber-700',
    };
    return colors[role] || colors.viewer;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
      away: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Away' },
      blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' },
    };
    return badges[status] || badges.active;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'away', 'blocked'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${
                statusFilter === filter
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => {
                const statusBadge = getStatusBadge(member.status);
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: member.avatar_color }}
                        >
                          {getInitials(member.full_name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.full_name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{member.email?.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleBadgeColor(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {member.skills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {member.skills?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onEditMember(member)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Roles Tab Component
const RolesTab = ({ members }) => {
  const roles = [
    {
      id: 'admin',
      icon: '👑',
      name: 'Admin',
      description: 'Full access to all features including team management and billing',
      permissions: [
        'Manage team members',
        'Access billing & settings',
        'Create and delete projects',
        'Manage all tasks',
        'View all reports',
      ],
    },
    {
      id: 'developer',
      icon: '💻',
      name: 'Developer',
      description: 'Can manage projects, tasks, and day-to-day work',
      permissions: [
        'Create projects',
        'Manage tasks',
        'Upload files',
        'View reports',
        'Manage blockers',
      ],
    },
    {
      id: 'viewer',
      icon: '👁',
      name: 'Viewer',
      description: 'Read-only access to view projects and progress',
      permissions: [
        'View projects',
        'View tasks',
        'Add comments',
        'View documents',
      ],
    },
    {
      id: 'contractor',
      icon: '📋',
      name: 'Contractor',
      description: 'Limited access to only assigned projects and tasks',
      permissions: [
        'View assigned projects',
        'Update assigned tasks',
        'Add comments',
        'Upload files to tasks',
      ],
    },
  ];

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Roles define what team members can do within the workspace.
      </p>
      <div className="grid grid-cols-4 gap-4">
        {roles.map((role) => {
          const count = members.filter((m) => m.role === role.id).length;
          return (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-4xl mb-3 text-center">{role.icon}</div>
              <h3 className="font-semibold text-gray-900 text-center mb-2">{role.name}</h3>
              <p className="text-sm text-gray-600 text-center mb-4">{role.description}</p>
              <div className="space-y-2 mb-4">
                {role.permissions.map((perm, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-gray-700">{perm}</span>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-3">
                {count} member{count !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Invites Tab Component
const InvitesTab = ({ invitations, onRevoke, onResend, loading }) => {
  const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffDays = Math.floor((now - then) / 86400000);

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      developer: 'bg-blue-100 text-blue-700',
      viewer: 'bg-gray-100 text-gray-600',
      contractor: 'bg-amber-100 text-amber-700',
    };
    return colors[role] || colors.viewer;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📧</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending invitations</h3>
        <p className="text-gray-500">Invite team members using the button above</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invited By</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invitations.map((invite) => (
            <tr key={invite.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📧</span>
                  <span className="text-gray-900">{invite.email}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleBadgeColor(invite.role)}`}>
                  {invite.role}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{invite.inviter?.full_name || 'Unknown'}</td>
              <td className="px-6 py-4 text-gray-600 text-sm">{getRelativeTime(invite.created_at)}</td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onResend(invite.id)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium mr-4"
                >
                  Resend
                </button>
                <button
                  onClick={() => onRevoke(invite.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamManagementView;
