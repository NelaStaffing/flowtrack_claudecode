import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '../../lib/supabase';

const TaskSetupStep = ({ taskData, updateTaskData, projectId }) => {
  const [milestones, setMilestones] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    const [milestonesResult, membersResult] = await Promise.all([
      supabaseHelpers.getMilestones(projectId),
      supabaseHelpers.getTeamMembers(),
    ]);

    if (milestonesResult.data) setMilestones(milestonesResult.data);
    if (membersResult.data) setTeamMembers(membersResult.data);
    setLoading(false);
  };

  const priorities = [
    { value: 'high', label: 'High', color: 'red', icon: '🔴', confidence: 75 },
    { value: 'medium', label: 'Medium', color: 'yellow', icon: '🟡', confidence: 75 },
    { value: 'low', label: 'Low', color: 'green', icon: '🟢', confidence: 80 },
  ];

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      updateTaskData({
        subtasks: [...taskData.subtasks, { title: newSubtask.trim() }],
      });
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index) => {
    updateTaskData({
      subtasks: taskData.subtasks.filter((_, i) => i !== index),
    });
  };

  const handleAddTag = (tag) => {
    if (!taskData.tags.includes(tag)) {
      updateTaskData({ tags: [...taskData.tags, tag] });
    }
  };

  const handleRemoveTag = (tag) => {
    updateTaskData({ tags: taskData.tags.filter((t) => t !== tag) });
  };

  const suggestedTags = ['testing', 'qa', 'urgent', 'review'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Complete Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">✨</span>
          <h4 className="font-semibold text-purple-900">AI Analysis Complete</h4>
        </div>
        <div className="flex items-center gap-4 text-sm text-purple-700">
          <div className="flex items-center gap-1">
            <span>📊</span>
            <span>Velocity: 4.2 tasks/week</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>Morgan Kim avg: 3.5h</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>Deadline: Feb 5</span>
          </div>
        </div>
      </div>

      {/* Milestone & Assignee */}
      <div className="grid grid-cols-2 gap-4">
        {/* Milestone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <span>Milestone</span>
            <span className="text-xs text-purple-600 font-semibold">⭐ 85%</span>
          </label>
          <select
            value={taskData.milestone_id || ''}
            onChange={(e) => updateTaskData({ milestone_id: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">No milestone</option>
            {milestones.map((milestone) => (
              <option key={milestone.id} value={milestone.id}>
                {milestone.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <span>Assignee</span>
            <span className="text-xs text-purple-600 font-semibold">⭐ 90%</span>
          </label>
          <select
            value={taskData.assigned_to || ''}
            onChange={(e) => updateTaskData({ assigned_to: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name || member.email?.email || 'Unknown'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <span>Priority</span>
          <span className="text-xs text-purple-600 font-semibold">⭐ 75%</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {priorities.map((priority) => (
            <button
              key={priority.value}
              onClick={() => updateTaskData({ priority: priority.value })}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                taskData.priority === priority.value
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{priority.icon}</span>
                <span className="font-semibold text-gray-900">{priority.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Due Date & Estimate */}
      <div className="grid grid-cols-2 gap-4">
        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <span>Due Date</span>
            <span className="text-xs text-purple-600 font-semibold">⭐ 70%</span>
          </label>
          <input
            type="date"
            value={taskData.due_date || ''}
            onChange={(e) => updateTaskData({ due_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">Aligned with milestone</p>
        </div>

        {/* Estimate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <span>Estimate</span>
            <span className="text-xs text-purple-600 font-semibold">⭐ 80%</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={taskData.estimated_hours || ''}
              onChange={(e) => updateTaskData({ estimated_hours: parseFloat(e.target.value) || null })}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="4"
              min="0"
              step="0.5"
            />
            <span className="flex items-center text-gray-600">hours</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <span>Tags</span>
          <span className="text-xs text-purple-600 font-semibold">⭐ 83%</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {taskData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-purple-900"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleAddTag(tag)}
              disabled={taskData.tags.includes(tag)}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-purple-100 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Subtasks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtasks
        </label>
        <div className="space-y-2 mb-2">
          {taskData.subtasks.map((subtask, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-400">☐</span>
              <span className="flex-1 text-sm text-gray-700">{subtask.title}</span>
              <button
                onClick={() => handleRemoveSubtask(index)}
                className="text-gray-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="Add subtask..."
          />
          <button
            onClick={handleAddSubtask}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskSetupStep;
