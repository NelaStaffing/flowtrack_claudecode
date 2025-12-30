import React, { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import { supabaseHelpers } from '@lib/supabase';

export default function TasksView({ onNavigate, currentUserId }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, my-tasks, todo, in-progress, done, blocked
  const [groupBy, setGroupBy] = useState('status'); // status, project, priority
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksResult, projectsResult] = await Promise.all([
        supabaseHelpers.getTasks(),
        supabaseHelpers.getProjects(),
      ]);

      if (!tasksResult.error && tasksResult.data) {
        setTasks(tasksResult.data);
      }
      if (!projectsResult.error && projectsResult.data) {
        setProjects(projectsResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
    setShowAddModal(false);
  };

  const handleTaskUpdated = async (taskId, updates) => {
    const { data, error } = await supabaseHelpers.updateTask(taskId, updates);
    if (!error && data) {
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, ...data[0] } : t)));
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (filter !== 'all' && filter !== 'my-tasks') {
      if (task.status !== filter.replace('-', '_')) {
        return false;
      }
    }

    // My tasks filter (would need current user ID)
    if (filter === 'my-tasks' && currentUserId) {
      if (task.assigned_to !== currentUserId) {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.projects?.name?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const groupedTasks = {};
  if (groupBy === 'status') {
    groupedTasks['Not Started'] = filteredTasks.filter((t) => t.status === 'not_started');
    groupedTasks['In Progress'] = filteredTasks.filter((t) => t.status === 'in_progress');
    groupedTasks['Done'] = filteredTasks.filter((t) => t.status === 'done');
    groupedTasks['Blocked'] = filteredTasks.filter((t) => t.status === 'blocked');
  } else if (groupBy === 'priority') {
    groupedTasks['High'] = filteredTasks.filter((t) => t.priority === 'high');
    groupedTasks['Medium'] = filteredTasks.filter((t) => t.priority === 'medium');
    groupedTasks['Low'] = filteredTasks.filter((t) => t.priority === 'low');
  } else if (groupBy === 'project') {
    // Group by project
    filteredTasks.forEach((task) => {
      const projectName = task.projects?.name || 'No Project';
      if (!groupedTasks[projectName]) {
        groupedTasks[projectName] = [];
      }
      groupedTasks[projectName].push(task);
    });
  }

  const stats = {
    all: tasks.length,
    'my-tasks': currentUserId ? tasks.filter((t) => t.assigned_to === currentUserId).length : 0,
    'not-started': tasks.filter((t) => t.status === 'not_started').length,
    'in-progress': tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading tasks...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-500 mt-1">{tasks.length} total tasks</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <span className="text-lg">+</span>
            <span>New Task</span>
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'my-tasks', label: 'My Tasks' },
              { key: 'not-started', label: 'To Do' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'done', label: 'Done' },
              { key: 'blocked', label: 'Blocked' },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === filterOption.key
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                }`}
              >
                {filterOption.label}
                <span className="ml-1.5 opacity-75">({stats[filterOption.key]})</span>
              </button>
            ))}
          </div>

          {/* Search and Group By */}
          <div className="flex gap-2 flex-1 lg:justify-end">
            <div className="relative flex-1 lg:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="status">Group by Status</option>
              <option value="priority">Group by Priority</option>
              <option value="project">Group by Project</option>
            </select>
          </div>
        </div>

        {/* Tasks */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{searchQuery ? '🔍' : '✓'}</div>
            <p className="text-gray-500 mb-2">
              {searchQuery ? 'No tasks found matching your search' : 'No tasks yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([group, groupTasks]) =>
              groupTasks.length > 0 ? (
                <div key={group}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {group}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({groupTasks.length})
                      </span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {groupTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={handleTaskUpdated}
                        onClick={() => onNavigate('task-detail', { taskId: task.id })}
                      />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Add Task Modal */}
        {showAddModal && (
          <AddTaskModal
            projects={projects}
            onClose={() => setShowAddModal(false)}
            onCreate={handleTaskCreated}
          />
        )}
      </div>
    </div>
  );
}
