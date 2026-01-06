import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    avatar_color: '#7C3AED',
    timezone: 'UTC',
    skills: [],
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    const { data, error } = await supabaseHelpers.getTeamMember(user.id);

    if (!error && data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        job_title: data.job_title || '',
        avatar_color: data.avatar_color || '#7C3AED',
        timezone: data.timezone || 'UTC',
        skills: data.skills || [],
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const updates = {
      full_name: formData.full_name,
      job_title: formData.job_title,
      avatar_color: formData.avatar_color,
      timezone: formData.timezone,
      skills: formData.skills,
    };

    const { error } = await supabaseHelpers.updateUserProfile(user.id, updates);

    if (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } else {
      await loadProfile();
      setIsEditing(false);
    }

    setSaving(false);
  };

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
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const getInitials = () => {
    if (formData.full_name) {
      return formData.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500"></div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-start justify-between -mt-16 mb-6">
              <div className="relative">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-lg"
                  style={{ background: formData.avatar_color }}
                >
                  {getInitials()}
                </div>
                {isEditing && (
                  <input
                    type="color"
                    value={formData.avatar_color}
                    onChange={(e) => setFormData({ ...formData, avatar_color: e.target.value })}
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full cursor-pointer border-2 border-white"
                    title="Change avatar color"
                  />
                )}
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        full_name: profile?.full_name || '',
                        job_title: profile?.job_title || '',
                        avatar_color: profile?.avatar_color || '#7C3AED',
                        timezone: profile?.timezone || 'UTC',
                        skills: profile?.skills || [],
                      });
                    }}
                    disabled={saving}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Senior Developer"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {formData.full_name || 'No name set'}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {formData.job_title || 'No job title set'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>👤</span>
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {profile?.role || 'developer'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {profile?.status || 'active'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(profile?.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚙️</span>
              Preferences
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 mb-2">Timezone</label>
                {isEditing ? (
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Dubai">Dubai</option>
                    <option value="Australia/Sydney">Sydney</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{formData.timezone}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Active</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(profile?.last_active_at) || 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎯</span>
            Skills & Expertise
          </h3>

          {isEditing && (
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add a skill (e.g., React, Node.js)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {formData.skills && formData.skills.length > 0 ? (
              formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-purple-500 hover:text-purple-700"
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">No skills added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
