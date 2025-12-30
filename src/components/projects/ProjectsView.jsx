import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import { supabaseHelpers } from '@lib/supabase';

export default function ProjectsView({ onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, on-hold, completed
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabaseHelpers.getProjects();
    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const filteredProjects = projects.filter((project) => {
    // Status filter
    if (filter !== 'all' && project.status !== filter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        project.name.toLowerCase().includes(query) ||
        project.client?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const stats = {
    all: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    'on-hold': projects.filter((p) => p.status === 'on-hold').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">{projects.length} total projects</p>
          </div>
          <button
            onClick={() => onNavigate('project-wizard')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <span className="text-lg">+</span>
            <span>New Project</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'on-hold', label: 'On Hold' },
              { key: 'completed', label: 'Completed' },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === filterOption.key
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                }`}
              >
                {filterOption.label}
                <span className="ml-2 opacity-75">({stats[filterOption.key]})</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 sm:max-w-xs">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">
              {searchQuery ? '🔍' : filter === 'completed' ? '✅' : '📁'}
            </div>
            <p className="text-gray-500 mb-2">
              {searchQuery
                ? 'No projects found matching your search'
                : filter === 'all'
                ? 'No projects yet'
                : `No ${filter} projects`}
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                onClick={() => onNavigate('project-wizard')}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => onNavigate('project-detail', { projectId: project.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
