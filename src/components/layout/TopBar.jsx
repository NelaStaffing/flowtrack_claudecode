import React, { useState } from 'react';

function NotificationItem({ type, message, time, unread }) {
  const icons = {
    task: '☑',
    blocker: '⚠',
    comment: '💬',
    mention: '@',
  };

  return (
    <div
      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
        unread ? 'border-purple-500 bg-purple-50/50' : 'border-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[type] || '📌'}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {message}
          </p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
        {unread && (
          <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
        )}
      </div>
    </div>
  );
}

export default function TopBar({ onNewProject, onSearch }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: 1,
      type: 'task',
      message: 'Sarah Chen assigned you to "Update API documentation"',
      time: '5 minutes ago',
      unread: true,
    },
    {
      id: 2,
      type: 'blocker',
      message: 'New blocker reported in Project Alpha',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      type: 'comment',
      message: 'Mike Torres commented on "Database Migration"',
      time: '2 hours ago',
      unread: false,
    },
    {
      id: 4,
      type: 'mention',
      message: 'You were mentioned in a document',
      time: '1 day ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search projects, tasks, documents..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                if (onSearch) onSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 ml-6">
        {/* New Project Button */}
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm hover:shadow-md"
        >
          <span className="text-lg">+</span>
          <span>New Project</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} {...notification} />
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 text-center">
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <button
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Quick actions"
        >
          <span className="text-xl">⚡</span>
        </button>

        {/* Help */}
        <button
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Help & Support"
        >
          <span className="text-xl">❓</span>
        </button>
      </div>
    </header>
  );
}
