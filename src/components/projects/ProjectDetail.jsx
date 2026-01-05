import React, { useState, useEffect } from 'react';
import { supabase, supabaseHelpers } from '@lib/supabase';
import ProjectTasksTab from './ProjectTasksTab';
import MilestonesTab from './MilestonesTab';

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm rounded-lg transition-all ${
        active
          ? 'bg-purple-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function ProjectDetail({ projectId, onBack, onNavigate }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      // Load project
      const { data: projectData, error: projectError } =
        await supabaseHelpers.getProject(projectId);
      if (!projectError && projectData) {
        setProject(projectData);
      }

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabaseHelpers.getTasks(projectId);
      if (!tasksError && tasksData) {
        setTasks(tasksData);
      }

      // Load milestones
      const { data: milestonesData, error: milestonesError } =
        await supabaseHelpers.getMilestones(projectId);
      if (!milestonesError && milestonesData) {
        setMilestones(milestonesData);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectHealth = async (health) => {
    const { error } = await supabaseHelpers.updateProject(projectId, { health });
    if (!error) {
      setProject({ ...project, health });
    }
  };

  const updateProjectStatus = async (status) => {
    const { error } = await supabaseHelpers.updateProject(projectId, { status });
    if (!error) {
      setProject({ ...project, status });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-500 mb-4">Project not found</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const healthColors = {
    'on-track': 'bg-green-100 text-green-700 border-green-200',
    'at-risk': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'off-track': 'bg-red-100 text-red-700 border-red-200',
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'done').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Projects
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              {project.client && (
                <p className="text-gray-600">
                  📧 <span className="font-medium">{project.client}</span>
                </p>
              )}
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={project.health}
                onChange={(e) => updateProjectHealth(e.target.value)}
                className={`px-4 py-2 rounded-lg font-medium border ${
                  healthColors[project.health]
                } cursor-pointer`}
              >
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="off-track">Off Track</option>
              </select>
              <select
                value={project.status}
                onChange={(e) => updateProjectStatus(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium cursor-pointer"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-2xl font-bold text-purple-600">{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-600 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700 font-medium mb-1">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900">{taskStats.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-green-700 font-medium mb-1">Completed</p>
            <p className="text-3xl font-bold text-gray-900">{taskStats.completed}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-purple-700 font-medium mb-1">In Progress</p>
            <p className="text-3xl font-bold text-gray-900">{taskStats.in_progress}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <p className="text-sm text-red-700 font-medium mb-1">Blocked</p>
            <p className="text-3xl font-bold text-gray-900">{taskStats.blocked}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')}>
            Tasks ({taskStats.total})
          </TabButton>
          <TabButton active={activeTab === 'milestones'} onClick={() => setActiveTab('milestones')}>
            Milestones ({milestones.length})
          </TabButton>
          <TabButton active={activeTab === 'team'} onClick={() => setActiveTab('team')}>
            Team
          </TabButton>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Project Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {project.start_date && (
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(project.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {project.end_date && (
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(project.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {project.tech_stack && project.tech_stack.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <ProjectTasksTab
              tasks={tasks}
              projectId={projectId}
              onTaskCreated={(newTask) => {
                setTasks([newTask, ...tasks]);
              }}
              onTaskUpdated={async (taskId, updates) => {
                await supabaseHelpers.updateTask(taskId, updates);
                await loadProjectData();
              }}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesTab
              milestones={milestones}
              projectId={projectId}
              onMilestoneCreated={(newMilestone) => {
                setMilestones([...milestones, newMilestone]);
              }}
              onMilestoneUpdated={async (milestoneId, updates) => {
                await supabaseHelpers.updateMilestone(milestoneId, updates);
                await loadProjectData();
              }}
            />
          )}

          {activeTab === 'team' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 mb-2">Team management coming soon</p>
              <p className="text-sm text-gray-400">
                You'll be able to add and manage team members here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
