import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';
import ReportBlockerModal from './ReportBlockerModal';
import BlockerDetailDrawer from './BlockerDetailDrawer';

const BlockersView = () => {
  const { user } = useAuth();
  const [blockers, setBlockers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedBlocker, setSelectedBlocker] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showResolved, setShowResolved] = useState(false);
  const [sortBy, setSortBy] = useState('age');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [showResolved]);

  const loadData = async () => {
    setLoading(true);
    const status = showResolved ? null : 'active';

    const [blockersResult, projectsResult] = await Promise.all([
      supabaseHelpers.getBlockers(status),
      supabaseHelpers.getProjects(),
    ]);

    if (blockersResult.data) setBlockers(blockersResult.data);
    if (projectsResult.data) setProjects(projectsResult.data);
    setLoading(false);
  };

  const handleBlockerCreated = async () => {
    await loadData();
    setShowReportModal(false);
  };

  const handleBlockerUpdated = async () => {
    await loadData();
  };

  const handleOpenBlocker = (blocker) => {
    setSelectedBlocker(blocker);
    setShowDrawer(true);
  };

  // Filter blockers
  const getFilteredBlockers = () => {
    let filtered = blockers;

    // Filter by severity
    if (filterSeverity !== 'all') {
      if (filterSeverity === 'mine') {
        filtered = filtered.filter((b) => b.owner_id === user?.id);
      } else {
        filtered = filtered.filter((b) => b.severity === filterSeverity);
      }
    }

    // Sort
    if (sortBy === 'age') {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    } else if (sortBy === 'severity') {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      filtered = [...filtered].sort(
        (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
      );
    }

    return filtered;
  };

  const filteredBlockers = getFilteredBlockers();

  // Calculate stats
  const activeBlockers = blockers.filter((b) => b.status === 'active');
  const highSeverity = activeBlockers.filter((b) => b.severity === 'high').length;

  const avgAge = activeBlockers.length > 0
    ? Math.round(
        activeBlockers.reduce((sum, b) => {
          const age = (new Date() - new Date(b.created_at)) / (1000 * 60 * 60 * 24);
          return sum + age;
        }, 0) / activeBlockers.length
      )
    : 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const resolvedThisWeek = blockers.filter(
    (b) => b.status === 'resolved' && new Date(b.updated_at) >= oneWeekAgo
  ).length;

  // Aging blockers (older than 5 days)
  const agingBlockers = activeBlockers.filter((b) => {
    const age = (new Date() - new Date(b.created_at)) / (1000 * 60 * 60 * 24);
    return age > 5;
  });

  // Projects affected
  const projectsAffected = projects.map((project) => ({
    ...project,
    activeBlockers: activeBlockers.filter((b) => b.project_id === project.id).length,
  })).filter((p) => p.activeBlockers > 0);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blockers</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track and resolve issues blocking your projects
            </p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            + Report Blocker
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon="⚠"
            iconBg="bg-red-100"
            value={activeBlockers.length}
            label="Active Blockers"
          />
          <StatCard
            icon="🔴"
            iconBg="bg-red-100"
            value={highSeverity}
            label="High Severity"
          />
          <StatCard
            icon="🕐"
            iconBg="bg-amber-100"
            value={`${avgAge}d`}
            label="Avg. Age"
          />
          <StatCard
            icon="✓"
            iconBg="bg-emerald-100"
            value={resolvedThisWeek}
            label="Resolved This Week"
          />
        </div>
      </div>

      {/* Aging Blockers Alert */}
      {agingBlockers.length > 0 && (
        <div className="px-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚨</div>
              <div>
                <h4 className="font-semibold text-red-900">
                  Aging blockers need attention
                </h4>
                <p className="text-sm text-red-700">
                  {agingBlockers.length} blocker(s) older than 5 days
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Review Now
            </button>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <FilterTab
              active={filterSeverity === 'all'}
              onClick={() => setFilterSeverity('all')}
              label="All"
            />
            <FilterTab
              active={filterSeverity === 'high'}
              onClick={() => setFilterSeverity('high')}
              label="High"
              color="red"
            />
            <FilterTab
              active={filterSeverity === 'medium'}
              onClick={() => setFilterSeverity('medium')}
              label="Medium"
              color="amber"
            />
            <FilterTab
              active={filterSeverity === 'low'}
              onClick={() => setFilterSeverity('low')}
              label="Low"
              color="emerald"
            />
            <FilterTab
              active={filterSeverity === 'mine'}
              onClick={() => setFilterSeverity('mine')}
              label="Mine"
              icon="👤"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="rounded text-purple-600"
              />
              Show resolved
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="age">Sort by Age</option>
              <option value="severity">Sort by Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Blockers List */}
          <div className="col-span-8 overflow-y-auto space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading blockers...</p>
                </div>
              </div>
            ) : filteredBlockers.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No blockers found
                  </h3>
                  <p className="text-gray-500">
                    {showResolved
                      ? 'No blockers match your filters'
                      : 'All clear! No active blockers.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredBlockers.map((blocker) => (
                <BlockerCard
                  key={blocker.id}
                  blocker={blocker}
                  onClick={() => handleOpenBlocker(blocker)}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-4">
            <ProjectsAffectedPanel projects={projectsAffected} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReportModal && (
        <ReportBlockerModal
          onClose={() => setShowReportModal(false)}
          onBlockerCreated={handleBlockerCreated}
          projects={projects}
        />
      )}

      {showDrawer && selectedBlocker && (
        <BlockerDetailDrawer
          blocker={selectedBlocker}
          onClose={() => {
            setShowDrawer(false);
            setSelectedBlocker(null);
          }}
          onUpdate={handleBlockerUpdated}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, iconBg, value, label }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center text-xl`}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-600">{label}</div>
      </div>
    </div>
  </div>
);

// Filter Tab Component
const FilterTab = ({ active, onClick, label, color, icon }) => {
  const colors = {
    red: 'text-red-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
        active
          ? 'bg-purple-100 text-purple-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon && <span>{icon}</span>}
      {color && !active && <span className={`${colors[color]}`}>●</span>}
      {label}
    </button>
  );
};

// Blocker Card Component
const BlockerCard = ({ blocker, onClick }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-amber-500',
      low: 'bg-emerald-500',
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getAge = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return `${diffDays} days old`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer relative"
    >
      {/* Severity Indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${getSeverityColor(
          blocker.severity
        )}`}
      />

      <div className="pl-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {blocker.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className={`${getSeverityColor(blocker.severity)} w-2 h-2 rounded-full`} />
              <span>{blocker.projects?.name}</span>
              <span>•</span>
              <span>{blocker.source || 'Unknown'}</span>
              <span>•</span>
              <span>{getAge(blocker.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {blocker.owner_id && (
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
                AC
              </div>
            )}
          </div>
        </div>

        {/* Impact */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-sm text-gray-600">
            <span className="font-medium">Impact:</span> {blocker.impact || blocker.description || 'No impact specified'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Projects Affected Panel
const ProjectsAffectedPanel = ({ projects }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <h3 className="font-semibold text-gray-900 mb-3">Projects Affected by Blockers</h3>
    <div className="space-y-3">
      {projects.length === 0 ? (
        <p className="text-sm text-gray-500">No projects with active blockers</p>
      ) : (
        projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
          >
            <div
              className={`w-1 h-12 rounded ${
                project.activeBlockers >= 2
                  ? 'bg-red-500'
                  : project.activeBlockers === 1
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{project.name}</div>
              <div className="text-sm text-red-600">
                {project.activeBlockers} active blocker
                {project.activeBlockers !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default BlockersView;
