import React from 'react';

const TaskIntegrationsStep = ({ taskData, updateTaskData }) => {
  const toggleIntegration = (key) => {
    updateTaskData({
      integrations: {
        ...taskData.integrations,
        [key]: !taskData.integrations[key],
      },
    });
  };

  const integrations = [
    {
      key: 'github',
      name: 'GitHub',
      description: 'Create branch & link PRs',
      icon: '🔗',
      iconBg: 'bg-gray-800',
    },
    {
      key: 'makecom',
      name: 'Make.com',
      description: 'Link automation scenario',
      icon: '🔄',
      iconBg: 'bg-purple-600',
    },
  ];

  const notifications = [
    {
      key: 'emailAssignee',
      name: 'Email assignee',
      description: 'Send task details via email',
      icon: '📧',
      iconBg: 'bg-blue-500',
    },
    {
      key: 'postToSlack',
      name: 'Post to Slack',
      description: '#acme-crm-project',
      icon: '💬',
      iconBg: 'bg-purple-500',
    },
    {
      key: 'addToCalendar',
      name: 'Add to calendar',
      description: 'Block time on Google Calendar',
      icon: '📅',
      iconBg: 'bg-red-500',
    },
    {
      key: 'dueDateReminder',
      name: 'Due date reminder',
      description: 'Remind 1 day before',
      icon: '⏰',
      iconBg: 'bg-orange-500',
    },
  ];

  const getAssigneeName = () => {
    // This would ideally come from the team members data
    return taskData.assigned_to ? 'Morgan Kim' : 'Unassigned';
  };

  const getPriorityLabel = () => {
    const labels = {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };
    return labels[taskData.priority] || 'Medium';
  };

  const getDueDateLabel = () => {
    if (!taskData.due_date) return 'No due date';
    const date = new Date(taskData.due_date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getEstimateLabel = () => {
    return taskData.estimated_hours ? `${taskData.estimated_hours}h` : 'Not set';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <span className="text-3xl">🔗</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Connect & Notify
        </h3>
        <p className="text-sm text-gray-500">
          Link integrations and configure notifications
        </p>
      </div>

      {/* Integrations */}
      <div className="space-y-3">
        {integrations.map((integration) => (
          <label
            key={integration.key}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={taskData.integrations[integration.key]}
              onChange={() => toggleIntegration(integration.key)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <div className={`w-10 h-10 ${integration.iconBg} rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
              {integration.icon}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{integration.name}</div>
              <div className="text-sm text-gray-500">{integration.description}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Notifications Header */}
      <div className="flex items-center gap-2 pt-4">
        <span className="text-lg">🔔</span>
        <h4 className="font-semibold text-gray-900">Notifications</h4>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <label
            key={notification.key}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={taskData.integrations[notification.key]}
              onChange={() => toggleIntegration(notification.key)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <div className={`w-10 h-10 ${notification.iconBg} rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
              {notification.icon}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{notification.name}</div>
              <div className="text-sm text-gray-500">{notification.description}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Task Summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-3 text-sm">
          TASK SUMMARY
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Assignee</span>
            <span className="font-medium text-gray-900">{getAssigneeName()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Due</span>
            <span className="font-medium text-gray-900">{getDueDateLabel()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Priority</span>
            <span className="font-medium text-gray-900">{getPriorityLabel()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Estimate</span>
            <span className="font-medium text-gray-900">{getEstimateLabel()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskIntegrationsStep;
