import React from 'react';

function ActionButton({ icon, label, description, onClick, color }) {
  const colorClasses = {
    purple: 'bg-purple-600 hover:bg-purple-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
  };

  return (
    <button
      onClick={onClick}
      className={`${
        colorClasses[color] || colorClasses.purple
      } text-white rounded-xl p-4 text-left transition-all hover:shadow-lg transform hover:-translate-y-0.5`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{label}</p>
          <p className="text-sm opacity-90 mt-1">{description}</p>
        </div>
        <span className="text-xl opacity-75">→</span>
      </div>
    </button>
  );
}

export default function QuickActions({ onAction }) {
  const actions = [
    {
      id: 'new-project',
      icon: '📁',
      label: 'New Project',
      description: 'Start a new project with our wizard',
      color: 'purple',
    },
    {
      id: 'new-task',
      icon: '✓',
      label: 'Create Task',
      description: 'Add a task to your projects',
      color: 'blue',
    },
    {
      id: 'view-blockers',
      icon: '⚠',
      label: 'View Blockers',
      description: 'See what needs attention',
      color: 'orange',
    },
    {
      id: 'view-reports',
      icon: '📊',
      label: 'Generate Report',
      description: 'Get insights on your projects',
      color: 'green',
    },
  ];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            {...action}
            onClick={() => onAction(action.id)}
          />
        ))}
      </div>
    </div>
  );
}
