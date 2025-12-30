import React from 'react';

export default function ProjectCard({ project, onClick }) {
  const healthColors = {
    'on-track': {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      dot: 'bg-green-500',
    },
    'at-risk': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      dot: 'bg-yellow-500',
    },
    'off-track': {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500',
    },
  };

  const statusColors = {
    planning: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    'on-hold': 'bg-yellow-100 text-yellow-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const health = healthColors[project.health] || healthColors['on-track'];
  const statusColor = statusColors[project.status] || statusColors.active;

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-purple-600 transition-colors">
            {project.name}
          </h3>
          {project.client && (
            <p className="text-sm text-gray-500 truncate">📧 {project.client}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <div className={`w-2 h-2 rounded-full ${health.dot}`}></div>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${health.bg} ${health.text} border ${health.border}`}
          >
            {project.health?.replace('-', ' ') || 'on-track'}
          </span>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">{project.progress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-purple-600 to-purple-500 h-2.5 rounded-full transition-all"
            style={{ width: `${project.progress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Dates */}
      {(project.start_date || project.end_date) && (
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          {project.start_date && (
            <span>📅 Start: {formatDate(project.start_date)}</span>
          )}
          {project.end_date && (
            <span>🏁 Due: {formatDate(project.end_date)}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 flex-1 mr-2">
          {project.tech_stack && project.tech_stack.length > 0 ? (
            <>
              {project.tech_stack.slice(0, 2).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-md font-medium"
                >
                  {tech}
                </span>
              ))}
              {project.tech_stack.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md">
                  +{project.tech_stack.length - 2}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">No tech stack</span>
          )}
        </div>

        {/* Status Badge */}
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
          {project.status}
        </span>
      </div>
    </div>
  );
}
