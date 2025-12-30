import React from 'react';

function StatCard({ icon, label, value, change, changeType, color, onClick }) {
  const colorClasses = {
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-500',
      text: 'text-purple-700',
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-500',
      text: 'text-blue-700',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-500',
      text: 'text-green-700',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-red-500',
      text: 'text-red-700',
    },
  };

  const colors = colorClasses[color] || colorClasses.purple;

  return (
    <div
      onClick={onClick}
      className={`${colors.bg} rounded-xl p-6 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text}`}>{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={changeType === 'up' ? 'text-green-600' : 'text-red-600'}>
                {changeType === 'up' ? '↑' : '↓'}
              </span>
              <span className={`text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}%
              </span>
              <span className="text-sm text-gray-500">vs last week</span>
            </div>
          )}
        </div>
        <div
          className={`${colors.icon} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon="📁"
        label="Active Projects"
        value={stats.activeProjects}
        change={12}
        changeType="up"
        color="purple"
      />
      <StatCard
        icon="☑"
        label="Total Tasks"
        value={stats.totalTasks}
        change={8}
        changeType="up"
        color="blue"
      />
      <StatCard
        icon="🎯"
        label="My Tasks"
        value={stats.myTasks}
        change={5}
        changeType="down"
        color="green"
      />
      <StatCard
        icon="⚠"
        label="Active Blockers"
        value={stats.blockers}
        change={stats.blockers > 0 ? 15 : 0}
        changeType={stats.blockers > 0 ? 'up' : 'down'}
        color="red"
      />
    </div>
  );
}
