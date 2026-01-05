import React, { useState, useMemo } from 'react';
import MilestoneDetailDrawer from './MilestoneDetailDrawer';

const TimelineTab = ({ milestones = [], tasks = [], projectId, onMilestoneUpdated, onTaskUpdated, onTaskClick }) => {
  const [viewMode, setViewMode] = useState('week'); // week or month
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Calculate timeline bounds and grid
  const timelineData = useMemo(() => {
    if (milestones.length === 0) return { columns: [], milestones: [], today: null };

    // Find earliest start and latest end date
    const dates = milestones
      .filter(m => m.due_date)
      .map(m => new Date(m.due_date));

    if (dates.length === 0) return { columns: [], milestones: [], today: null };

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 14);

    // Generate columns based on view mode
    const columns = [];
    let currentDate = new Date(minDate);

    if (viewMode === 'week') {
      // Find the Monday of the week containing minDate
      while (currentDate.getDay() !== 1) {
        currentDate.setDate(currentDate.getDate() - 1);
      }

      let weekNum = 1;
      while (currentDate <= maxDate) {
        columns.push({
          date: new Date(currentDate),
          label: `Week ${weekNum}`,
          dateLabel: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
        currentDate.setDate(currentDate.getDate() + 7);
        weekNum++;
      }
    } else {
      // Month view
      currentDate.setDate(1); // First of month
      while (currentDate <= maxDate) {
        columns.push({
          date: new Date(currentDate),
          label: currentDate.toLocaleDateString('en-US', { month: 'long' }),
          dateLabel: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Position milestones on grid
    const positionedMilestones = milestones.map(milestone => {
      if (!milestone.due_date) {
        return {
          ...milestone,
          startCol: 0,
          span: 1,
          hidden: true
        };
      }

      const dueDate = new Date(milestone.due_date);

      // Estimate start date (2 weeks before due date)
      const startDate = new Date(dueDate);
      startDate.setDate(startDate.getDate() - 14);

      // Find which column the milestone starts and ends in
      let startCol = -1;
      let endCol = -1;

      columns.forEach((col, idx) => {
        const nextCol = columns[idx + 1];
        const colEnd = nextCol ? nextCol.date : new Date(maxDate);

        if (startDate >= col.date && startDate < colEnd && startCol === -1) {
          startCol = idx;
        }
        if (dueDate >= col.date && dueDate < colEnd && endCol === -1) {
          endCol = idx;
        }
      });

      // Fallback if dates are outside range
      if (startCol === -1) startCol = 0;
      if (endCol === -1) endCol = columns.length - 1;

      const span = Math.max(1, endCol - startCol + 1);

      // Get linked tasks
      const linkedTasks = tasks.filter(t => t.milestone_id === milestone.id);
      const completedTasks = linkedTasks.filter(t => t.status === 'done').length;
      const progress = linkedTasks.length > 0
        ? Math.round((completedTasks / linkedTasks.length) * 100)
        : milestone.confidence || 0;

      return {
        ...milestone,
        startCol,
        span,
        progress,
        linkedTasks,
        startDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        endDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    }).filter(m => !m.hidden);

    // Calculate today marker position
    const today = new Date();
    let todayCol = -1;
    columns.forEach((col, idx) => {
      const nextCol = columns[idx + 1];
      const colEnd = nextCol ? nextCol.date : new Date(maxDate);
      if (today >= col.date && today < colEnd) {
        todayCol = idx;
      }
    });

    return { columns, milestones: positionedMilestones, todayCol };
  }, [milestones, tasks, viewMode]);

  const getStatusColor = (status) => {
    const colors = {
      completed: {
        bg: 'bg-emerald-100',
        fill: 'bg-emerald-500',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500'
      },
      active: {
        bg: 'bg-purple-100',
        fill: 'bg-purple-500',
        text: 'text-purple-700',
        dot: 'bg-purple-500'
      },
      upcoming: {
        bg: 'bg-gray-100',
        fill: 'bg-gray-400',
        text: 'text-gray-600',
        dot: 'bg-gray-400'
      },
    };
    return colors[status] || colors.upcoming;
  };

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
    setShowDetailDrawer(true);
  };

  if (timelineData.columns.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No timeline yet</h3>
        <p className="text-gray-500">
          Add milestones with due dates to visualize your project timeline
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Project Timeline</h2>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Status Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
                <span className="text-gray-600">Upcoming</span>
              </div>
            </div>

            {/* Export Button */}
            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <span>⬇️</span>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex">
          {/* Fixed Milestone Column */}
          <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 flex items-center px-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Milestone
              </h3>
            </div>

            {/* Milestone Names */}
            {timelineData.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="h-20 border-b border-gray-200 flex items-center px-4"
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {milestone.name}
                </p>
              </div>
            ))}
          </div>

          {/* Scrollable Timeline Grid */}
          <div className="flex-1 overflow-x-auto">
            <div style={{ minWidth: `${timelineData.columns.length * 120}px` }}>
              {/* Header Row */}
              <div className="h-16 border-b border-gray-200">
                <div className="grid h-8 border-b border-gray-100" style={{ gridTemplateColumns: `repeat(${timelineData.columns.length}, 1fr)` }}>
                  {timelineData.columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="border-r border-gray-100 px-2 flex items-center justify-center text-xs font-medium text-gray-500"
                    >
                      {col.dateLabel}
                    </div>
                  ))}
                </div>
                <div className="grid h-8 bg-gray-50" style={{ gridTemplateColumns: `repeat(${timelineData.columns.length}, 1fr)` }}>
                  {timelineData.columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="border-r border-gray-100 px-2 flex items-center justify-center text-xs font-semibold text-gray-400"
                    >
                      {col.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Rows */}
              <div className="relative">
                {/* Today Marker */}
                {timelineData.todayCol !== -1 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                    style={{
                      left: `${(timelineData.todayCol / timelineData.columns.length) * 100}%`
                    }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                      Today
                    </div>
                  </div>
                )}

                {/* Grid and Milestone Bars */}
                {timelineData.milestones.map((milestone) => {
                  const statusColor = getStatusColor(milestone.status);

                  return (
                    <div
                      key={milestone.id}
                      className="h-20 border-b border-gray-200 relative"
                    >
                      {/* Grid Background */}
                      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${timelineData.columns.length}, 1fr)` }}>
                        {timelineData.columns.map((_, idx) => (
                          <div key={idx} className="border-r border-gray-100" />
                        ))}
                      </div>

                      {/* Milestone Bar */}
                      <div
                        className="absolute inset-y-0 px-2 py-4"
                        style={{
                          left: `${(milestone.startCol / timelineData.columns.length) * 100}%`,
                          width: `${(milestone.span / timelineData.columns.length) * 100}%`
                        }}
                      >
                        <div
                          onClick={() => handleMilestoneClick(milestone)}
                          className={`h-full ${statusColor.bg} rounded-lg border-2 border-${statusColor.dot.replace('bg-', 'border-')} cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden`}
                        >
                          {/* Progress Fill */}
                          <div
                            className={`absolute inset-0 ${statusColor.fill} opacity-20 transition-all`}
                            style={{ width: `${milestone.progress}%` }}
                          />

                          {/* Content */}
                          <div className="relative h-full px-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`w-2 h-2 ${statusColor.dot} rounded-full flex-shrink-0`} />
                              <span className={`text-sm font-medium ${statusColor.text} truncate`}>
                                {milestone.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {milestone.progress > 0 && (
                                <span className={`text-xs font-semibold ${statusColor.text}`}>
                                  {milestone.progress}%
                                </span>
                              )}
                              {milestone.status === 'completed' && (
                                <span className="text-emerald-600">✓</span>
                              )}
                            </div>
                          </div>

                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 w-64">
                            <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                              <p className="font-semibold mb-1">{milestone.name}</p>
                              <p className="text-gray-300 mb-2">
                                {milestone.startDate} → {milestone.endDate}
                              </p>
                              <div className="space-y-1">
                                <p>Progress: {milestone.progress}%</p>
                                {milestone.linkedTasks && (
                                  <p>Tasks: {milestone.linkedTasks.filter(t => t.status === 'done').length}/{milestone.linkedTasks.length} complete</p>
                                )}
                              </div>
                              <p className="text-gray-400 mt-2 text-xs">Click to view details</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

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
            setSelectedMilestone({ ...selectedMilestone, ...updated });
            if (onMilestoneUpdated) {
              onMilestoneUpdated(selectedMilestone.id, updated);
            }
          }}
          onTaskUpdated={onTaskUpdated}
          onTaskClick={onTaskClick}
        />
      )}
    </div>
  );
};

export default TimelineTab;
