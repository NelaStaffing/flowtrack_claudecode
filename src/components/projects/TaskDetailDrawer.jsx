import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../lib/supabase';

const TaskDetailDrawer = ({ task, onClose, onUpdate, onTaskUpdated, milestones = [], subtasks = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'to_do',
    priority: task.priority || 'medium',
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    estimated_hours: task.estimated_hours || '',
    milestone_id: task.milestone_id || '',
    tags: task.tags || [],
  });
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Update formData when task prop changes
  useEffect(() => {
    if (!isEditing) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'to_do',
        priority: task.priority || 'medium',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        estimated_hours: task.estimated_hours || '',
        milestone_id: task.milestone_id || '',
        tags: task.tags || [],
      });
    }
  }, [task, isEditing]);

  const statuses = [
    { value: 'to_do', label: 'To Do', icon: '○', color: 'gray' },
    { value: 'in_progress', label: 'In Progress', icon: '◐', color: 'purple' },
    { value: 'done', label: 'Done', icon: '✓', color: 'emerald' },
    { value: 'blocked', label: 'Blocked', icon: '⚠', color: 'red' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', icon: '⬇', color: 'blue' },
    { value: 'medium', label: 'Medium', icon: '─', color: 'yellow' },
    { value: 'high', label: 'High', icon: '⬆', color: 'red' },
  ];

  const handleSave = async () => {
    setSaving(true);

    const updates = {
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      milestone_id: formData.milestone_id || null,
      tags: formData.tags,
    };

    const { error } = await supabaseHelpers.updateTask(task.id, updates);

    if (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
      setSaving(false);
      return;
    }

    setSaving(false);
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(updates);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleSubtaskToggle = async (subtaskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'to_do' : 'done';
    if (onTaskUpdated) {
      await onTaskUpdated(subtaskId, { status: newStatus });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      done: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
      to_do: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
      blocked: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    };
    return colors[status] || colors.to_do;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
      low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    };
    return colors[priority] || colors.medium;
  };

  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);
  const linkedMilestone = milestones.find(m => m.id === task.milestone_id);

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
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-2xl font-bold text-gray-900 w-full border-b-2 border-purple-300 focus:outline-none focus:border-purple-500 pb-1"
                  placeholder="Task title"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl ml-4"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
              {statuses.find(s => s.value === task.status)?.icon} {statuses.find(s => s.value === task.status)?.label}
            </span>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${priorityColor.bg} ${priorityColor.text}`}>
              {priorities.find(p => p.value === task.priority)?.icon} {priorities.find(p => p.value === task.priority)?.label} Priority
            </span>
            {task.due_date && (
              <>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">
                  📅 {formatDate(task.due_date)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                <p className="text-gray-700 whitespace-pre-wrap">
                  {task.description || 'No description provided'}
                </p>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Details</h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status</span>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.icon} {status.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
                    {statuses.find(s => s.value === task.status)?.label}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Priority</span>
                {isEditing ? (
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.icon} {priority.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${priorityColor.bg} ${priorityColor.text}`}>
                    {priorities.find(p => p.value === task.priority)?.label}
                  </span>
                )}
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Due Date</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <span className="text-sm text-gray-900">{formatDate(task.due_date)}</span>
                )}
              </div>

              {/* Estimated Hours */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Estimated Hours</span>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.5"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm w-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                ) : (
                  <span className="text-sm text-gray-900">
                    {task.estimated_hours ? `${task.estimated_hours} hours` : 'Not set'}
                  </span>
                )}
              </div>

              {/* Milestone */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Milestone</span>
                {isEditing ? (
                  <select
                    value={formData.milestone_id}
                    onChange={(e) => setFormData({ ...formData, milestone_id: e.target.value })}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">No Milestone</option>
                    {milestones.map(milestone => (
                      <option key={milestone.id} value={milestone.id}>
                        {milestone.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-900">
                    {linkedMilestone ? linkedMilestone.name : 'No milestone'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Tags</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex flex-wrap gap-2 mb-3">
                {(isEditing ? formData.tags : (task.tags || [])).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
                {!isEditing && (!task.tags || task.tags.length === 0) && (
                  <span className="text-sm text-gray-500">No tags</span>
                )}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Add tag..."
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Subtasks Section */}
          {subtasks && subtasks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Subtasks ({subtasks.filter(s => s.status === 'done').length}/{subtasks.length})
              </h3>
              <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                {subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={subtask.status === 'done'}
                      onChange={() => handleSubtaskToggle(subtask.id, subtask.status)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${subtask.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {task.created_at && `Created ${new Date(task.created_at).toLocaleDateString()}`}
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      setFormData({
                        title: task.title || '',
                        description: task.description || '',
                        status: task.status || 'to_do',
                        priority: task.priority || 'medium',
                        due_date: task.due_date ? task.due_date.split('T')[0] : '',
                        estimated_hours: task.estimated_hours || '',
                        milestone_id: task.milestone_id || '',
                        tags: task.tags || [],
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Edit Task
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailDrawer;
