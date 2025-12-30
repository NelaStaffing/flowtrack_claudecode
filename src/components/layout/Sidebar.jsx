import React from 'react';

function NavButton({ icon, label, active, collapsed, onClick, badge, badgeRed }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        collapsed ? 'justify-center' : ''
      }`}
      style={{
        background: active ? '#7C3AED' : 'transparent',
        color: active ? 'white' : '#9CA3AF',
        boxShadow: active ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
      }}
    >
      <span>{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          {badge && (
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                badgeRed
                  ? 'bg-red-500/20 text-red-400'
                  : active
                  ? 'bg-white/20'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default function Sidebar({ collapsed, setCollapsed, currentView, setCurrentView, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'projects', icon: '📁', label: 'Projects', badge: 3 },
    { id: 'timeline', icon: '📅', label: 'Timeline' },
    { id: 'my-tasks', icon: '☑', label: 'My Tasks', badge: 8 },
    { id: 'documents', icon: '📄', label: 'Documents' },
  ];

  const insightItems = [
    { id: 'blockers', icon: '⚠', label: 'Blockers', badge: 2, badgeRed: true },
    { id: 'activity', icon: '📊', label: 'Activity' },
    { id: 'users', icon: '👥', label: 'Team', adminOnly: true },
    { id: 'reports', icon: '📈', label: 'Reports' },
  ];

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gray-900 flex flex-col transition-all duration-300`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
            }}
          >
            ⚡
          </div>
          {!collapsed && <span className="text-lg font-bold text-white">FlowTrack</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            {...item}
            active={
              currentView === item.id ||
              (item.id === 'projects' && currentView === 'project-detail')
            }
            collapsed={collapsed}
            onClick={() => setCurrentView(item.id)}
          />
        ))}

        {!collapsed && (
          <div className="pt-6 pb-2 px-3 text-xs font-semibold text-gray-500 uppercase">
            Insights
          </div>
        )}
        {collapsed && <div className="pt-4" />}

        {insightItems.map((item) => (
          <NavButton
            key={item.id}
            {...item}
            active={currentView === item.id}
            collapsed={collapsed}
            onClick={() => setCurrentView(item.id)}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-800 px-3 py-3 space-y-1">
        <NavButton icon="🔌" label="Integrations" collapsed={collapsed} onClick={() => {}} />
        <NavButton icon="⚙" label="Settings" collapsed={collapsed} onClick={() => {}} />
      </div>

      {/* User */}
      <div className="border-t border-gray-800 p-3">
        <div className="relative group">
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}
            >
              {user?.email?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
              </div>
            )}
          </div>

          {/* Logout button */}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="w-full mt-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
