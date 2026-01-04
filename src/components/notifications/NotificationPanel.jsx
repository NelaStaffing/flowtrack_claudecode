import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';

const NotificationPanel = ({ onClose, onNotificationRead }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    const result = filter === 'unread'
      ? await supabaseHelpers.getUnreadNotifications()
      : await supabaseHelpers.getNotifications(20);

    if (result.data) {
      setNotifications(result.data);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    await supabaseHelpers.markNotificationAsRead(notificationId);
    await loadNotifications();
    onNotificationRead();
  };

  const handleMarkAllAsRead = async () => {
    await supabaseHelpers.markAllNotificationsAsRead();
    await loadNotifications();
    onNotificationRead();
  };

  const handleDelete = async (notificationId) => {
    await supabaseHelpers.deleteNotification(notificationId);
    await loadNotifications();
    onNotificationRead();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task_assigned: '📋',
      task_updated: '✏️',
      task_completed: '✅',
      task_comment: '💬',
      project_created: '🚀',
      project_updated: '📊',
      blocker_created: '🚧',
      blocker_resolved: '✓',
      deadline_approaching: '⏰',
      team_invite: '👥',
      mention: '@',
      document_shared: '📄',
    };
    return icons[type] || '🔔';
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread
          </button>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="ml-auto text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔔</div>
            <h4 className="text-gray-900 font-semibold mb-1">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h4>
            <p className="text-sm text-gray-500">
              {filter === 'unread'
                ? 'You have no unread notifications'
                : "We'll notify you when something important happens"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                getIcon={getNotificationIcon}
                getTime={getRelativeTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-200 p-3 text-center">
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

// Individual Notification Item Component
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  getIcon,
  getTime,
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    // Could navigate to action_url here
    if (notification.action_url) {
      // window.location.href = notification.action_url;
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer relative ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl">
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4
                className={`text-sm ${
                  !notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                }`}
              >
                {notification.title}
              </h4>
              {notification.message && (
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {getTime(notification.created_at)}
                </span>
                {notification.actor && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      by {notification.actor.full_name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Unread Indicator */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-2 mt-2">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Mark as read
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
