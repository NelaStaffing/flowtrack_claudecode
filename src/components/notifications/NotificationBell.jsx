import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseHelpers } from '../../lib/supabase';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadUnreadCount();

      // Subscribe to real-time notifications
      const subscription = supabaseHelpers.subscribeToNotifications(
        user.id,
        (payload) => {
          console.log('New notification received:', payload);
          loadUnreadCount();
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadUnreadCount = async () => {
    const { count } = await supabaseHelpers.getUnreadNotificationCount();
    setUnreadCount(count || 0);
  };

  const handleBellClick = () => {
    setShowPanel(!showPanel);
  };

  const handleNotificationRead = () => {
    loadUnreadCount();
  };

  const handleClickOutside = (event) => {
    if (bellRef.current && !bellRef.current.contains(event.target)) {
      setShowPanel(false);
    }
  };

  useEffect(() => {
    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);

  return (
    <div className="relative" ref={bellRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className={`relative p-2 rounded-lg hover:bg-gray-100 transition-colors ${
          showPanel ? 'bg-gray-100' : ''
        }`}
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <NotificationPanel
          onClose={() => setShowPanel(false)}
          onNotificationRead={handleNotificationRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;
