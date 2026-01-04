import React, { useState } from 'react';
import { supabaseHelpers } from '../../lib/supabase';

const EditMemberModal = ({ member, onClose, onMemberUpdated }) => {
  const [formData, setFormData] = useState({
    full_name: member.full_name || '',
    job_title: member.job_title || '',
    role: member.role || 'developer',
    status: member.status || 'active',
    status_reason: member.status_reason || '',
    status_until: member.status_until ? member.status_until.split('T')[0] : '',
    skills: member.skills || [],
    timezone: member.timezone || 'UTC',
  });
  const [newSkill, setNewSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { value: 'admin', label: 'Admin', icon: '👑', color: 'purple' },
    { value: 'developer', label: 'Developer', icon: '💻', color: 'blue' },
    { value: 'viewer', label: 'Viewer', icon: '👁', color: 'gray' },
    { value: 'contractor', label: 'Contractor', icon: '🤝', color: 'emerald' },
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'emerald' },
    { value: 'away', label: 'Away', color: 'amber' },
    { value: 'blocked', label: 'Blocked', color: 'red' },
  ];

  const commonTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const updates = {
      full_name: formData.full_name.trim() || null,
      job_title: formData.job_title.trim() || null,
      role: formData.role,
      status: formData.status,
      status_reason:
        formData.status !== 'active' ? formData.status_reason.trim() || null : null,
      status_until:
        formData.status !== 'active' && formData.status_until
          ? new Date(formData.status_until).toISOString()
          : null,
      skills: formData.skills,
      timezone: formData.timezone,
    };

    const { error } = await supabaseHelpers.updateUserProfile(member.id, updates);

    if (error) {
      console.error('Error updating member:', error);
      alert('Failed to update team member');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onMemberUpdated();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700',
      away: 'bg-amber-100 text-amber-700',
      blocked: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.active;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[700px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Team Member</h2>
            <p className="text-sm text-gray-500 mt-1">
              Update member details and permissions
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
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
                disabled={submitting}
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={formData.job_title}
                onChange={(e) =>
                  setFormData({ ...formData, job_title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Senior Developer"
                disabled={submitting}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Role
              </label>
              <div className="grid grid-cols-4 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    disabled={submitting}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.role === role.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{role.icon}</div>
                    <div className="text-xs font-medium">{role.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status
              </label>
              <div className="grid grid-cols-3 gap-3">
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: status.value })}
                    disabled={submitting}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.status === status.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span
                      className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(
                        status.value
                      )}`}
                    >
                      {status.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Reason & Until (for Away/Blocked) */}
            {formData.status !== 'active' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={formData.status_reason}
                    onChange={(e) =>
                      setFormData({ ...formData, status_reason: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={
                      formData.status === 'away' ? 'On vacation' : 'Performance issues'
                    }
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.status_until}
                    onChange={(e) =>
                      setFormData({ ...formData, status_until: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={submitting}
                  />
                </div>
              </>
            )}

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add a skill..."
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.length === 0 ? (
                  <p className="text-sm text-gray-500">No skills added yet</p>
                ) : (
                  formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={submitting}
                        className="hover:text-purple-900"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={submitting}
              >
                {commonTimezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
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
                Saving...
              </>
            ) : (
              <>Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMemberModal;
