import React, { useState, useEffect } from 'react';
import DashboardStats from './DashboardStats';
import RecentProjects from './RecentProjects';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import { supabaseHelpers } from '@lib/supabase';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalTasks: 0,
    myTasks: 0,
    blockers: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load projects
      const { data: projects, error: projectsError } = await supabaseHelpers.getProjects();
      if (!projectsError && projects) {
        setRecentProjects(projects.slice(0, 6));
        setStats((prev) => ({
          ...prev,
          activeProjects: projects.filter((p) => p.status === 'active').length,
        }));
      }

      // Load tasks
      const { data: tasks, error: tasksError } = await supabaseHelpers.getTasks();
      if (!tasksError && tasks) {
        setStats((prev) => ({
          ...prev,
          totalTasks: tasks.length,
          myTasks: tasks.filter((t) => t.status !== 'done').length,
        }));
      }

      // Load blockers
      const { data: blockers, error: blockersError } = await supabaseHelpers.getBlockers('active');
      if (!blockersError && blockers) {
        setStats((prev) => ({
          ...prev,
          blockers: blockers.length,
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'new-project':
        onNavigate('project-wizard');
        break;
      case 'new-task':
        onNavigate('my-tasks');
        break;
      case 'view-blockers':
        onNavigate('blockers');
        break;
      case 'view-reports':
        onNavigate('reports');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats */}
        <DashboardStats stats={stats} />

        {/* Quick Actions */}
        <QuickActions onAction={handleQuickAction} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <RecentProjects
              projects={recentProjects}
              onViewAll={() => onNavigate('projects')}
              onViewProject={(id) => onNavigate('project-detail', { projectId: id })}
            />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
}
