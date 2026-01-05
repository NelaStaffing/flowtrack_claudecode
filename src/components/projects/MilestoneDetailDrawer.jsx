import React, { useState } from 'react';
import { supabaseHelpers } from '../../lib/supabase';

const MilestoneDetailDrawer = ({ milestone, tasks = [], onClose, onUpdate, onTaskUpdated, onTaskClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: milestone.name || '',
    description: milestone.description || '',
    due_date: milestone.due_date ? milestone.due_date.split('T')[0] : '',
    status: milestone.status || 'upcoming',
    progress: milestone.confidence || 0,  // UI uses 'progress' but DB column is 'confidence'
  });
  const [saving, setSaving] = useState(false);

  // Filter tasks linked to this milestone
  const linkedTasks = tasks.filter(task => task.milestone_id === milestone.id);
  const completedLinkedTasks = linkedTasks.filter(task => task.status === 'done').length;

  const statuses = [
    { value: 'upcoming', label: 'Upcoming', icon: '📋', color: 'gray' },
    { value: 'active', label: 'In Progress', icon: '🚀', color: 'purple' },
    { value: 'completed', label: 'Completed', icon: '✓', color: 'emerald' },
  ];

  const handleSave = async () => {
    setSaving(true);

    const updates = {
      name: formData.name,
      description: formData.description || null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      status: formData.status,
      confidence: parseInt(formData.progress) || 0,  // Map UI 'progress' to DB 'confidence'
    };

    const { error } = await supabaseHelpers.updateMilestone(milestone.id, updates);

    if (error) {
      console.error('Error updating milestone:', error);
      alert('Failed to update milestone');
      setSaving(false);
      return;
    }

    setSaving(false);
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(updates);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleTaskToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'to_do' : 'done';
    if (onTaskUpdated) {
      await onTaskUpdated(taskId, { status: newStatus });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
      active: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
      upcoming: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
    };
    return colors[status] || colors.upcoming;
  };

  const statusColor = getStatusColor(milestone.status);
  const progress = isEditing ? formData.progress : (milestone.confidence || 0);  // Use 'confidence' from DB

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-[700px] bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold text-gray-900 w-full border-b-2 border-purple-300 focus:outline-none focus:border-purple-500 pb-1"
                  placeholder="Milestone name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{milestone.name}</h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl ml-4"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
              {statuses.find(s => s.value === milestone.status)?.icon} {milestone.status}
            </span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-600">
              📅 {formatDate(milestone.due_date)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Progress</h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-bold text-gray-900">{progress}%</span>
                {isEditing && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="w-32"
                  />
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Description</h3>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="4"
                placeholder="Add a description..."
              />
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-700">
                  {milestone.description || 'No description provided'}
                </p>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Details</h3>
            <div className="space-y-4">
              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-2">Status</label>
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setFormData({ ...formData, status: status.value })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.status === status.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{status.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{status.label}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{statuses.find(s => s.value === milestone.status)?.icon}</span>
                    <span className="font-medium text-gray-900 capitalize">{milestone.status}</span>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-600 mb-2">Due Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <span className="text-xl">📅</span>
                    <span className="font-medium">{formatDate(milestone.due_date)}</span>
                  </div>
                )}
              </div>

              {/* Owner */}
              {milestone.owner && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Owner</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {milestone.owner.full_name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{milestone.owner.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{milestone.owner.email}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Associated Tasks</h3>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {linkedTasks.length} Tasks
                  </p>
                  <p className="text-sm text-gray-600">
                    {completedLinkedTasks} of {linkedTasks.length} completed
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>

              {/* Task List */}
              {linkedTasks.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {linkedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleTaskToggle(task.id, task.status);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer focus:ring-2 focus:ring-emerald-500"
                      />
                      <span
                        onClick={() => onTaskClick && onTaskClick(task.id)}
                        className={`flex-1 text-sm cursor-pointer ${
                          task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.status !== 'done' && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize">
                          {task.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center mt-4 py-2">
                  No tasks linked to this milestone yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: milestone.name || '',
                      description: milestone.description || '',
                      due_date: milestone.due_date ? milestone.due_date.split('T')[0] : '',
                      status: milestone.status || 'upcoming',
                      progress: milestone.confidence || 0,  // Reset to DB value
                    });
                  }}
                  disabled={saving}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
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
                    <>Save Changes</>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Edit Milestone
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneDetailDrawer;
