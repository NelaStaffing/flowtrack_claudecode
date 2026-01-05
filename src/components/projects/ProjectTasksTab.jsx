import React, { useState, useEffect } from 'react';
import CreateTaskWizard from '../tasks/CreateTaskWizard';
import { supabaseHelpers } from '../../lib/supabase';

const ProjectTasksTab = ({ tasks, projectId, onTaskCreated, onTaskUpdated, milestones }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showTaskWizard, setShowTaskWizard] = useState(false);
  const [groupBy, setGroupBy] = useState('milestone'); // none, milestone, status, priority
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  // Calculate counts for filter tabs
  const taskCounts = {
    all: tasks.length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    to_do: tasks.filter((t) => t.status === 'to_do').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  // Filter tasks based on selected status
  const filteredTasks =
    statusFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.status === statusFilter);

  // Separate parent tasks and subtasks
  const parentTasks = filteredTasks.filter((t) => !t.parent_task_id);
  const subtasks = filteredTasks.filter((t) => t.parent_task_id);

  // Group tasks by selected criteria
  const groupedTasks = React.useMemo(() => {
    if (groupBy === 'none') {
      return null;
    }

    if (groupBy === 'milestone') {
      // Get unique milestones from tasks
      const milestoneGroups = new Map();

      // Add tasks to their milestone groups
      parentTasks.forEach((task) => {
        const milestoneId = task.milestone_id || 'no-milestone';
        if (!milestoneGroups.has(milestoneId)) {
          const milestone = milestones?.find((m) => m.id === milestoneId);
          milestoneGroups.set(milestoneId, {
            id: milestoneId,
            milestone: milestone || { name: 'No Milestone', status: 'planning' },
            tasks: [],
          });
        }
        milestoneGroups.get(milestoneId).tasks.push(task);
      });

      return Array.from(milestoneGroups.values()).sort((a, b) => {
        // Sort by milestone due date
        if (!a.milestone?.due_date) return 1;
        if (!b.milestone?.due_date) return -1;
        return new Date(a.milestone.due_date) - new Date(b.milestone.due_date);
      });
    }

    return null;
  }, [groupBy, parentTasks, milestones]);

  const toggleGroup = (groupId) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const getSubtasks = (parentId) => {
    return subtasks.filter((t) => t.parent_task_id === parentId);
  };

  const getStatusBadge = (status) => {
    const badges = {
      done: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Done' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Progress' },
      to_do: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'To Do' },
      blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' },
    };
    return badges[status] || badges.to_do;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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

  const handleTaskToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'to_do' : 'done';
    if (onTaskUpdated) {
      await onTaskUpdated(taskId, { status: newStatus });
    }
  };

  return (
    <div>
      {/* Filter Tabs and Actions */}
      <div className="flex items-center justify-between mb-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'to_do', label: 'To Do' },
            { key: 'done', label: 'Done' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}{' '}
              <span
                className={`ml-1 ${
                  statusFilter === filter.key ? 'text-purple-200' : 'text-gray-500'
                }`}
              >
                {taskCounts[filter.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Group By and Add Task */}
        <div className="flex items-center gap-3">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="none">Group by: None</option>
            <option value="milestone">Group by: Milestone</option>
            <option value="status">Group by: Status</option>
            <option value="priority">Group by: Priority</option>
          </select>

          <button
            onClick={() => setShowTaskWizard(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? 'Get started by creating your first task'
              : `No ${statusFilter.replace('_', ' ')} tasks`}
          </p>
        </div>
      ) : groupBy === 'milestone' && groupedTasks ? (
        <GroupedByMilestoneView
          groupedTasks={groupedTasks}
          collapsedGroups={collapsedGroups}
          toggleGroup={toggleGroup}
          getSubtasks={getSubtasks}
          handleTaskToggle={handleTaskToggle}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          getInitials={getInitials}
        />
      ) : (
        <FlatTaskList
          tasks={parentTasks}
          getSubtasks={getSubtasks}
          handleTaskToggle={handleTaskToggle}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          getInitials={getInitials}
        />
      )}

      {/* Task Wizard */}
      {showTaskWizard && (
        <CreateTaskWizard
          projectId={projectId}
          onClose={() => setShowTaskWizard(false)}
          onCreate={(task) => {
            setShowTaskWizard(false);
            if (onTaskCreated) {
              onTaskCreated(task);
            }
          }}
        />
      )}
    </div>
  );
};

// Grouped by Milestone View Component
const GroupedByMilestoneView = ({
  groupedTasks,
  collapsedGroups,
  toggleGroup,
  getSubtasks,
  handleTaskToggle,
  getStatusBadge,
  formatDate,
  getInitials,
}) => (
  <div className="space-y-4">
    {groupedTasks.map((group) => {
      const isCollapsed = collapsedGroups.has(group.id);
      const completedTasks = group.tasks.filter((t) => t.status === 'done').length;
      const totalTasks = group.tasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return (
        <div key={group.id} className="bg-white rounded-lg border border-gray-200">
          {/* Milestone Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleGroup(group.id)}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Collapse Arrow */}
              <button className="text-gray-400 hover:text-gray-600">
                {isCollapsed ? '▸' : '▾'}
              </button>

              {/* Milestone Number Badge */}
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded font-bold text-sm flex items-center justify-center">
                {group.milestone.id ? group.milestone.id.slice(0, 1).toUpperCase() : '?'}
              </div>

              {/* Milestone Name */}
              <h3 className="font-bold text-gray-900">{group.milestone.name || 'No Milestone'}</h3>

              {/* Current Badge */}
              {group.milestone.status === 'active' && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                  Current
                </span>
              )}
            </div>

            {/* Right Side Info */}
            <div className="flex items-center gap-6">
              {/* Due Date */}
              {group.milestone.due_date && (
                <span className="text-sm text-gray-600">
                  Due {formatDate(group.milestone.due_date)}
                </span>
              )}

              {/* Task Count */}
              <span className="text-sm text-gray-600">
                {completedTasks}/{totalTasks} tasks
              </span>

              {/* Progress Bar */}
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    progress === 100 ? 'bg-emerald-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          {!isCollapsed && (
            <div className="border-t border-gray-200">
              {group.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  subtasks={getSubtasks(task.id)}
                  handleTaskToggle={handleTaskToggle}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                  getInitials={getInitials}
                />
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

// Flat Task List Component (no grouping)
const FlatTaskList = ({
  tasks,
  getSubtasks,
  handleTaskToggle,
  getStatusBadge,
  formatDate,
  getInitials,
}) => (
  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
    {tasks.map((task) => (
      <TaskRow
        key={task.id}
        task={task}
        subtasks={getSubtasks(task.id)}
        handleTaskToggle={handleTaskToggle}
        getStatusBadge={getStatusBadge}
        formatDate={formatDate}
        getInitials={getInitials}
      />
    ))}
  </div>
);

// Task Row Component
const TaskRow = ({ task, subtasks, handleTaskToggle, getStatusBadge, formatDate, getInitials, isSubtask = false }) => {
  const statusBadge = getStatusBadge(task.status);
  const isDone = task.status === 'done';

  return (
    <>
      {/* Main Task Row */}
      <div className={`flex items-center gap-4 p-4 hover:bg-gray-50 ${isSubtask ? 'pl-16' : ''}`}>
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isDone}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTaskToggle(task.id, task.status);
          }}
          className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        />

        {/* Task Title */}
        <div className="flex-1">
          <span
            className={`font-medium ${
              isDone ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}
          >
            {task.title}
          </span>
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {getInitials(task.assignee?.full_name || 'AC')}
            </div>
          </div>
        )}

        {/* Due Date */}
        {task.due_date && (
          <span className="text-sm text-gray-600 min-w-[60px] text-right">
            {formatDate(task.due_date)}
          </span>
        )}

        {/* Status Badge */}
        <span
          className={`px-2 py-1 rounded text-xs font-medium min-w-[90px] text-center ${statusBadge.bg} ${statusBadge.text}`}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* Subtasks */}
      {subtasks && subtasks.length > 0 && (
        <>
          {subtasks.map((subtask) => (
            <TaskRow
              key={subtask.id}
              task={subtask}
              subtasks={[]}
              handleTaskToggle={handleTaskToggle}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              getInitials={getInitials}
              isSubtask={true}
            />
          ))}
        </>
      )}
    </>
  );
};

export default ProjectTasksTab;
