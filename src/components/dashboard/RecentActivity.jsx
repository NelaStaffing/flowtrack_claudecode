import React, { useState, useEffect } from 'react';
import { supabaseHelpers } from '@lib/supabase';

function ActivityItem({ activity }) {
  const getActivityIcon = (type) => {
    const icons = {
      'project.created': '📁',
      'project.updated': '✏️',
      'task.created': '✓',
      'task.completed': '✅',
      'task.assigned': '👤',
      'blocker.created': '⚠',
      'blocker.resolved': '✓',
      'comment.added': '💬',
      'milestone.completed': '🎯',
      'document.created': '📄',
    };
    return icons[type] || '📌';
  };

  const getActivityText = (activity) => {
    const user = activity.users?.full_name || 'Someone';
    const project = activity.projects?.name || 'a project';

    switch (activity.type) {
      case 'project.created':
        return `${user} created ${project}`;
      case 'project.updated':
        return `${user} updated ${project}`;
      case 'task.created':
        return `${user} created a task in ${project}`;
      case 'task.completed':
        return `${user} completed a task in ${project}`;
      case 'task.assigned':
        return `${user} was assigned a task`;
      case 'blocker.created':
        return `${user} reported a blocker in ${project}`;
      case 'blocker.resolved':
        return `${user} resolved a blocker`;
      case 'comment.added':
        return `${user} commented on a task`;
      case 'milestone.completed':
        return `${user} completed a milestone`;
      case 'document.created':
        return `${user} created a document`;
      default:
        return activity.target || 'Activity logged';
    }
  };

  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex gap-3 py-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{getActivityText(activity)}</p>
        <p className="text-xs text-gray-500 mt-0.5">{getTimeAgo(activity.created_at)}</p>
      </div>
    </div>
  );
}

export default function RecentActivity({ onNavigate }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    setLoading(true);
    const { data, error } = await supabaseHelpers.getActivity(10);
    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <button
          onClick={() => onNavigate('activity')}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View all →
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 mb-2">No activity yet</p>
          <p className="text-sm text-gray-400">Activity will appear here as you work</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
