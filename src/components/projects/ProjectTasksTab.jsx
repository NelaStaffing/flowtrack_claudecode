import React, { useState } from 'react';
import CreateTaskWizard from '../tasks/CreateTaskWizard';

const ProjectTasksTab = ({ tasks, projectId, onTaskCreated, onTaskUpdated }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTaskWizard, setShowTaskWizard] = useState(false);

  // Calculate counts for filter tabs
  const taskCounts = {
    all: tasks.length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    to_do: tasks.filter((t) => t.status === 'to_do').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  // Filter tasks based on selected status
  const filteredTasks =
    statusFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.status === statusFilter);

  const getStatusBadge = (status) => {
    const badges = {
      done: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Done' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Progress' },
      to_do: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'To Do' },
      blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' },
    };
    return badges[status] || badges.to_do;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
      low: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Low' },
    };
    return badges[priority] || badges.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleTaskToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'to_do' : 'done';
    if (onTaskUpdated) {
      await onTaskUpdated(taskId, { status: newStatus });
    }
  };

  return (
    <div>
      {/* Filter Tabs and Actions */}
      <div className="flex items-center justify-between mb-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'to_do', label: 'To Do' },
            { key: 'done', label: 'Done' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}{' '}
              <span
                className={`ml-1 ${
                  statusFilter === filter.key ? 'text-purple-200' : 'text-gray-500'
                }`}
              >
                {taskCounts[filter.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => setShowTaskWizard(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Add Task</span>
        </button>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? 'Get started by creating your first task'
              : `No ${statusFilter.replace('_', ' ')} tasks`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TASK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ASSIGNEE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DUE DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PRIORITY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map((task) => {
                const statusBadge = getStatusBadge(task.status);
                const priorityBadge = getPriorityBadge(task.priority);
                const isDone = task.status === 'done';

                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    {/* Task Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleTaskToggle(task.id, task.status)}
                          className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          {/* Task Title */}
                          <div
                            className={`font-medium ${
                              isDone
                                ? 'text-gray-400 line-through'
                                : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </div>
                          {/* Task Metadata */}
                          {(task.description || task.tags?.length > 0) && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              {task.description && (
                                <span className="text-gray-500">
                                  {task.description.substring(0, 50)}
                                  {task.description.length > 50 ? '...' : ''}
                                </span>
                              )}
                              {task.tags?.length > 0 && (
                                <div className="flex gap-1">
                                  {task.tags.slice(0, 2).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <span className="text-gray-400">
                                      +{task.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Assignee Column */}
                    <td className="px-6 py-4">
                      {task.assigned_to ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {getInitials(task.assignee?.full_name || 'Unknown')}
                          </div>
                          <span className="text-sm text-gray-900">
                            {task.assignee?.full_name || 'Unknown'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>

                    {/* Due Date Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        {task.due_date && <span>✓</span>}
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                    </td>

                    {/* Priority Column */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}
                      >
                        {priorityBadge.label}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Wizard */}
      {showTaskWizard && (
        <CreateTaskWizard
          projectId={projectId}
          onClose={() => setShowTaskWizard(false)}
          onCreate={(task) => {
            setShowTaskWizard(false);
            if (onTaskCreated) {
              onTaskCreated(task);
            }
          }}
        />
      )}
    </div>
  );
};

export default ProjectTasksTab;
