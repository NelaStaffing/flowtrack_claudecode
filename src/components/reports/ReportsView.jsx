import React, { useState, useEffect, useMemo } from 'react';
import { supabase, supabaseHelpers } from '../../lib/supabase';

const ReportsView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [blockers, setBlockers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load all projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Load all tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      // Load all milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .order('created_at', { ascending: false });

      // Load blockers
      const { data: blockersData } = await supabase
        .from('blockers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setMilestones(milestonesData || []);
      setBlockers(blockersData || []);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const filteredTasks = selectedProject === 'all'
      ? tasks
      : tasks.filter(t => t.project_id === selectedProject);

    const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
    const totalTasks = filteredTasks.length;

    // Calculate on-time rate (tasks completed before due date)
    const tasksWithDueDate = filteredTasks.filter(t => t.due_date && t.status === 'done');
    const onTimeTasks = tasksWithDueDate.filter(t => {
      const completed = new Date(t.updated_at);
      const due = new Date(t.due_date);
      return completed <= due;
    }).length;
    const onTimeRate = tasksWithDueDate.length > 0
      ? Math.round((onTimeTasks / tasksWithDueDate.length) * 100)
      : 0;

    // Calculate hours logged
    const hoursLogged = filteredTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

    // Active blockers
    const activeBlockers = selectedProject === 'all'
      ? blockers.length
      : blockers.filter(b => b.project_id === selectedProject).length;

    // Team velocity (tasks completed per week)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentCompletedTasks = filteredTasks.filter(t =>
      t.status === 'done' && new Date(t.updated_at) >= fourWeeksAgo
    ).length;
    const velocity = (recentCompletedTasks / 4).toFixed(1);

    return {
      tasksCompleted: completedTasks,
      tasksCompletedChange: 12, // Mock percentage change
      hoursLogged: Math.round(hoursLogged),
      hoursLoggedChange: 8,
      onTimeRate,
      onTimeRateChange: 3,
      activeBlockers,
      activeBlockersChange: -2,
      teamVelocity: parseFloat(velocity),
      teamVelocityChange: 0.5,
    };
  }, [tasks, blockers, selectedProject]);

  // Calculate weekly task completion trend
  const weeklyTrend = useMemo(() => {
    const weeks = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const filteredTasks = selectedProject === 'all'
        ? tasks
        : tasks.filter(t => t.project_id === selectedProject);

      const created = filteredTasks.filter(t => {
        const createdDate = new Date(t.created_at);
        return createdDate >= weekStart && createdDate <= weekEnd;
      }).length;

      const completed = filteredTasks.filter(t => {
        const updatedDate = new Date(t.updated_at);
        return t.status === 'done' && updatedDate >= weekStart && updatedDate <= weekEnd;
      }).length;

      weeks.push({
        label: `Week ${4 - i}`,
        created,
        completed,
      });
    }

    return weeks;
  }, [tasks, selectedProject]);

  // Calculate time by category
  const timeByCategory = useMemo(() => {
    const filteredTasks = selectedProject === 'all'
      ? tasks
      : tasks.filter(t => t.project_id === selectedProject);

    const categories = {
      development: { label: 'Development', hours: 0, color: '#8B5CF6' },
      design: { label: 'Design', hours: 0, color: '#EC4899' },
      meetings: { label: 'Meetings', hours: 0, color: '#F59E0B' },
      research: { label: 'Research', hours: 0, color: '#3B82F6' },
      documentation: { label: 'Documentation', hours: 0, color: '#10B981' },
    };

    filteredTasks.forEach(task => {
      const tags = task.tags || [];
      const hours = task.estimated_hours || 0;

      if (tags.includes('development') || tags.includes('backend') || tags.includes('frontend')) {
        categories.development.hours += hours;
      } else if (tags.includes('design')) {
        categories.design.hours += hours;
      } else if (tags.includes('meetings')) {
        categories.meetings.hours += hours;
      } else if (tags.includes('research')) {
        categories.research.hours += hours;
      } else if (tags.includes('documentation')) {
        categories.documentation.hours += hours;
      } else {
        categories.development.hours += hours; // Default
      }
    });

    const total = Object.values(categories).reduce((sum, cat) => sum + cat.hours, 0);

    return Object.entries(categories).map(([key, data]) => ({
      ...data,
      percentage: total > 0 ? Math.round((data.hours / total) * 100) : 0,
    })).filter(cat => cat.hours > 0);
  }, [tasks, selectedProject]);

  // Project status cards
  const projectStats = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const completedTasks = projectTasks.filter(t => t.status === 'done').length;
      const totalTasks = projectTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const projectBlockers = blockers.filter(b => b.project_id === project.id).length;

      // Calculate remaining days
      const projectMilestones = milestones.filter(m => m.project_id === project.id);
      const dueDates = projectMilestones
        .map(m => m.due_date)
        .filter(d => d)
        .map(d => new Date(d));

      let daysRemaining = null;
      if (dueDates.length > 0) {
        const latestDate = new Date(Math.max(...dueDates));
        const today = new Date();
        daysRemaining = Math.ceil((latestDate - today) / (1000 * 60 * 60 * 24));
      }

      // Determine status
      let status = 'On Track';
      let statusColor = 'emerald';
      if (projectBlockers > 0 || progress < 30) {
        status = 'At Risk';
        statusColor = 'yellow';
      }
      if (project.health === 'at_risk') {
        status = 'At Risk';
        statusColor = 'yellow';
      }

      return {
        id: project.id,
        name: project.name,
        status,
        statusColor,
        progress,
        tasksCompleted: completedTasks,
        totalTasks,
        blockers: projectBlockers,
        daysRemaining,
      };
    });
  }, [projects, tasks, milestones, blockers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Track performance, identify trends, and make data-driven decisions</p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
          <span>📊</span>
          <span>Export Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'team', label: 'Team Performance', icon: '👥' },
            { id: 'health', label: 'Project Health', icon: '📈' },
            { id: 'time', label: 'Time Tracking', icon: '⏱' },
            { id: 'blockers', label: 'Blockers Analysis', icon: '⚠' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-5 gap-4">
            <MetricCard
              icon="✓"
              value={metrics.tasksCompleted}
              label="Tasks Completed"
              change={metrics.tasksCompletedChange}
              positive={true}
            />
            <MetricCard
              icon="⏰"
              value={`${metrics.hoursLogged}h`}
              label="Hours Logged"
              change={metrics.hoursLoggedChange}
              positive={true}
            />
            <MetricCard
              icon="🎯"
              value={`${metrics.onTimeRate}%`}
              label="On-Time Rate"
              change={metrics.onTimeRateChange}
              positive={true}
            />
            <MetricCard
              icon="⚠"
              value={metrics.activeBlockers}
              label="Active Blockers"
              change={metrics.activeBlockersChange}
              positive={false}
            />
            <MetricCard
              icon="🚀"
              value={metrics.teamVelocity}
              label="Team Velocity"
              change={metrics.teamVelocityChange}
              positive={true}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Task Completion Trend */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Completion Trend</h3>
              <TaskCompletionChart data={weeklyTrend} />
            </div>

            {/* Time by Category */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Time by Category</h3>
              <TimeByCategoryChart data={timeByCategory} />
            </div>
          </div>

          {/* Project Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
            <div className="grid grid-cols-3 gap-4">
              {projectStats.map(project => (
                <ProjectStatusCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs - Placeholder */}
      {activeTab !== 'overview' && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-500">This analytics view is under development</p>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, value, label, change, positive }) => {
  const changeColor = positive
    ? (change > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50')
    : (change < 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50');

  const displayChange = positive ? change : -change;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
          {icon}
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${changeColor}`}>
          {change > 0 ? '+' : ''}{displayChange}{typeof change === 'number' && change !== 0 ? '%' : ''}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

// Task Completion Chart Component
const TaskCompletionChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.created, d.completed)));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-64 gap-8">
        {data.map((week, idx) => {
          const createdHeight = maxValue > 0 ? (week.created / maxValue) * 100 : 0;
          const completedHeight = maxValue > 0 ? (week.completed / maxValue) * 100 : 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full flex gap-2 items-end h-48">
                <div className="flex-1 bg-purple-200 rounded-t" style={{ height: `${createdHeight}%` }}></div>
                <div className="flex-1 bg-purple-600 rounded-t" style={{ height: `${completedHeight}%` }}></div>
              </div>
              <div className="text-xs text-gray-600 mt-2">{week.label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-600 rounded"></div>
          <span className="text-sm text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-200 rounded"></div>
          <span className="text-sm text-gray-600">Created</span>
        </div>
      </div>
    </div>
  );
};

// Time by Category Chart Component (Donut Chart)
const TimeByCategoryChart = ({ data }) => {
  const total = data.reduce((sum, cat) => sum + cat.hours, 0);

  return (
    <div className="flex items-center gap-8">
      {/* Donut Chart */}
      <div className="flex-shrink-0">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.reduce((acc, category, idx) => {
              const percentage = (category.hours / total) * 100;
              const prevPercentage = data.slice(0, idx).reduce((sum, c) => sum + (c.hours / total) * 100, 0);
              const circumference = 2 * Math.PI * 40;
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((prevPercentage / 100) * circumference);

              acc.push(
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={category.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
              return acc;
            }, [])}
            {/* Inner circle for donut effect */}
            <circle cx="50" cy="50" r="30" fill="white" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-900">{total}h</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3">
        {data.map((category, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
              <span className="text-sm text-gray-700">{category.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">{category.hours}h</span>
              <span className="text-xs text-gray-500">({category.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Project Status Card Component
const ProjectStatusCard = ({ project }) => {
  const statusColors = {
    'On Track': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'At Risk': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Off Track': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const colors = statusColors[project.status] || statusColors['On Track'];

  return (
    <div className={`bg-white rounded-xl border-2 ${colors.border} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-gray-900">{project.name}</h4>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.bg} ${colors.text} flex items-center gap-1`}>
          ⚠ {project.status}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {project.tasksCompleted}/{project.totalTasks}
          </div>
          <div className="text-xs text-gray-600">Tasks</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{project.blockers}</div>
          <div className="text-xs text-gray-600">Blockers</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {project.daysRemaining !== null ? `${project.daysRemaining}d` : '-'}
          </div>
          <div className="text-xs text-gray-600">Remaining</div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
