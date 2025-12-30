import React from 'react';

export default function TaskCard({ task, onUpdate, onClick }) {
  const statusColors = {
    not_started: 'bg-gray-100 text-gray-700 border-gray-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    done: 'bg-green-100 text-green-700 border-green-200',
    blocked: 'bg-red-100 text-red-700 border-red-200',
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };

  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    const newStatus = task.status === 'done' ? 'not_started' : 'done';
    onUpdate(task.id, {
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null,
    });
  };

  const handleStatusChange = (e) => {
    e.stopPropagation();
    onUpdate(task.id, {
      status: e.target.value,
      completed_at: e.target.value === 'done' ? new Date().toISOString() : null,
    });
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Project */}
          <div className="mb-2">
            <h3
              className={`font-semibold text-gray-900 group-hover:text-purple-600 transition-colors ${
                task.status === 'done' ? 'line-through opacity-60' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.projects && (
              <p className="text-sm text-gray-500 mt-1">📁 {task.projects.name}</p>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex items-center flex-wrap gap-3 text-sm">
            {/* Priority */}
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
              <span>{priorityIcons[task.priority]}</span>
              <span>{task.priority}</span>
            </span>

            {/* Due Date */}
            {task.due_date && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
                }`}
              >
                📅 {formatDate(task.due_date)}
                {isOverdue && ' (Overdue)'}
              </span>
            )}

            {/* Time Estimate */}
            {task.time_estimate && (
              <span className="text-gray-600">⏱️ {task.time_estimate}</span>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <select
          value={task.status}
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
          className={`px-3 py-1.5 text-sm font-semibold rounded-lg border cursor-pointer transition-colors ${
            statusColors[task.status]
          } hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          <option value="not_started">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
    </div>
  );
}
