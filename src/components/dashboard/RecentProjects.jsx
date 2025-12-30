import React from 'react';

function ProjectCard({ project, onClick }) {
  const healthColors = {
    'on-track': {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    'at-risk': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    'off-track': {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
    },
  };

  const health = healthColors[project.health] || healthColors['on-track'];

  return (
    <div
      onClick={() => onClick(project.id)}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
          {project.client && (
            <p className="text-sm text-gray-500">Client: {project.client}</p>
          )}
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${health.bg} ${health.text} border ${health.border}`}
        >
          {project.health?.replace('-', ' ') || 'on-track'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">{project.progress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${project.progress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Tech Stack */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tech_stack.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md"
            >
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md">
              +{project.tech_stack.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function RecentProjects({ projects, onViewAll, onViewProject }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View all →
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-gray-500 mb-2">No projects yet</p>
          <p className="text-sm text-gray-400">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={onViewProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
