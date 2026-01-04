import React from 'react';

const TaskDescriptionStep = ({ taskData, updateTaskData }) => {
  const quickTemplates = [
    'Set up automation for...',
    'Build form with...',
    'Integrate API to...',
    'Test and validate...',
  ];

  const handleTemplateClick = (template) => {
    updateTaskData({ title: template });
  };

  return (
    <div className="space-y-6">
      {/* Header Icon */}
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          What needs to be done?
        </h3>
        <p className="text-sm text-gray-500">
          Describe your task and AI will help configure it
        </p>
      </div>

      {/* Task Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={taskData.title}
          onChange={(e) => updateTaskData({ title: e.target.value })}
          className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
          placeholder="e.g., Implement user authentication"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-gray-400">— helps AI suggest better</span>
        </label>
        <textarea
          value={taskData.description}
          onChange={(e) => updateTaskData({ description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          rows="4"
          placeholder="Add details: requirements, dependencies, context..."
        />
      </div>

      {/* Quick Templates */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💡</span>
          <label className="text-sm font-medium text-gray-700">
            QUICK TEMPLATES
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => handleTemplateClick(template)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors"
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 text-sm mb-1">
            AI will analyze your task
          </h4>
          <p className="text-sm text-blue-700">
            In the next step, we'll suggest the best assignee, estimate effort,
            and recommend a priority based on your description.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskDescriptionStep;
