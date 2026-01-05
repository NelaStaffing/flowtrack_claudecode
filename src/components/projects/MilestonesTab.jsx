import React, { useState } from 'react';
import MilestoneDetailDrawer from './MilestoneDetailDrawer';

const MilestonesTab = ({ milestones, tasks = [], projectId, onMilestoneCreated, onMilestoneUpdated }) => {
  const [viewMode, setViewMode] = useState('cards'); // cards, list, timeline
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Calculate stats
  const stats = {
    total: milestones.length,
    completed: milestones.filter((m) => m.status === 'completed').length,
    in_progress: milestones.filter((m) => m.status === 'active').length,
    upcoming: milestones.filter((m) => m.status === 'planning').length,
  };

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
    setShowDetailDrawer(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      active: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
      planning: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    };
    return colors[status] || colors.planning;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Sort milestones by due date for timeline view
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  return (
    <div>
      {/* Header with Stats and View Switcher */}
      <div className="mb-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Total</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-emerald-900">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">In Progress</p>
                <p className="text-3xl font-bold text-purple-900">{stats.in_progress}</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher and Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">▦</span>
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">☰</span>
              List
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">━</span>
              Timeline
            </button>
          </div>

          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
            <span>+</span>
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {milestones.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No milestones yet</h3>
          <p className="text-gray-500 mb-6">Create your first milestone to track project progress</p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            + Add Milestone
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'cards' && (
            <CardsView
              milestones={milestones}
              onMilestoneClick={handleMilestoneClick}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              getInitials={getInitials}
            />
          )}

          {viewMode === 'list' && (
            <ListView
              milestones={milestones}
              onMilestoneClick={handleMilestoneClick}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              getInitials={getInitials}
            />
          )}

          {viewMode === 'timeline' && (
            <TimelineView
              milestones={sortedMilestones}
              onMilestoneClick={handleMilestoneClick}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              getInitials={getInitials}
            />
          )}
        </>
      )}

      {/* Milestone Detail Drawer */}
      {showDetailDrawer && selectedMilestone && (
        <MilestoneDetailDrawer
          milestone={selectedMilestone}
          tasks={tasks}
          onClose={() => {
            setShowDetailDrawer(false);
            setSelectedMilestone(null);
          }}
          onUpdate={(updated) => {
            if (onMilestoneUpdated) {
              onMilestoneUpdated(selectedMilestone.id, updated);
            }
            setShowDetailDrawer(false);
          }}
        />
      )}
    </div>
  );
};

// Cards View Component
const CardsView = ({ milestones, onMilestoneClick, getStatusColor, formatDate, getInitials }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {milestones.map((milestone) => {
      const statusColor = getStatusColor(milestone.status);
      const progress = milestone.progress || 0;

      return (
        <div
          key={milestone.id}
          onClick={() => onMilestoneClick(milestone)}
          className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{milestone.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                  {milestone.status}
                </span>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${statusColor.dot}`}></div>
          </div>

          {/* Description */}
          {milestone.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{milestone.description}</p>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-xs font-bold text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span>📅</span>
              <span>{formatDate(milestone.due_date)}</span>
            </div>
            {milestone.owner && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                  {getInitials(milestone.owner?.full_name || 'Unknown')}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// List View Component
const ListView = ({ milestones, onMilestoneClick, getStatusColor, formatDate, getInitials }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Milestone</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {milestones.map((milestone) => {
          const statusColor = getStatusColor(milestone.status);
          const progress = milestone.progress || 0;

          return (
            <tr
              key={milestone.id}
              onClick={() => onMilestoneClick(milestone)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">{milestone.name}</div>
                  {milestone.description && (
                    <div className="text-sm text-gray-500 line-clamp-1">{milestone.description}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{formatDate(milestone.due_date)}</td>
              <td className="px-6 py-4">
                {milestone.owner ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                      {getInitials(milestone.owner?.full_name || 'Unknown')}
                    </div>
                    <span className="text-sm text-gray-900">{milestone.owner?.full_name || 'Unknown'}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{progress}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                  {milestone.status}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// Timeline View Component
const TimelineView = ({ milestones, onMilestoneClick, getStatusColor, formatDate, getInitials }) => (
  <div className="relative">
    {/* Timeline Line */}
    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-purple-300 to-purple-200"></div>

    {/* Timeline Items */}
    <div className="space-y-8">
      {milestones.map((milestone, index) => {
        const statusColor = getStatusColor(milestone.status);
        const progress = milestone.progress || 0;

        return (
          <div key={milestone.id} className="relative pl-20">
            {/* Timeline Dot */}
            <div className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white shadow-lg ${statusColor.dot}`}></div>

            {/* Content Card */}
            <div
              onClick={() => onMilestoneClick(milestone)}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{milestone.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                      {milestone.status}
                    </span>
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Due Date */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Due Date</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <span>📅</span>
                    {formatDate(milestone.due_date)}
                  </p>
                </div>

                {/* Owner */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Owner</p>
                  {milestone.owner ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                        {getInitials(milestone.owner?.full_name || 'Unknown')}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {milestone.owner?.full_name || 'Unknown'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default MilestonesTab;
