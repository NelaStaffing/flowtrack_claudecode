import React, { useState } from 'react';
import NotificationBell from '../notifications/NotificationBell';

export default function TopBar({ onNewProject, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');

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
        <NotificationBell />

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
