import React, { useEffect, useState } from 'react';
import { listNotifications, markNotificationRead } from '@/api/notification.api.js';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { Bell, Check, Info, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationPage = () => {
  const [data, setData] = useState({ notifications: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const result = await listNotifications(page);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        )
      }));
    } catch (e) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    // In a real app, you'd have an endpoint for this. 
    // Here we'll just loop for demonstration, or assume the user clicks individually.
    const unread = data.notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await markNotificationRead(n._id);
    }
    fetchNotifications(data.page);
    toast.success('All notifications marked as read');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'alert':
      case 'anomaly':
        return <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full"><AlertTriangle className="w-5 h-5" /></div>;
      case 'collection_reminder':
        return <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full"><Calendar className="w-5 h-5" /></div>;
      case 'verification_request':
        return <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full"><CheckCircle className="w-5 h-5" /></div>;
      default:
        return <div className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full"><Info className="w-5 h-5" /></div>;
    }
  };

  if (loading && !data.notifications.length) {
    return <div className="h-[calc(100vh-8rem)] flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return <EmptyState title="Error" message={error} icon={Bell} />;
  }

  const unreadCount = data.notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You have {unreadCount} unread messages
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        {data.notifications.length === 0 ? (
          <EmptyState title="All caught up!" message="You have no notifications at this time." icon={Bell} />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {data.notifications.map((n) => (
              <div 
                key={n._id} 
                className={`p-4 sm:p-6 transition-colors ${n.isRead ? 'bg-transparent' : 'bg-brand-50/50 dark:bg-brand-500/5'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h3 className={`text-base font-medium truncate ${n.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                        {n.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm ${n.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {n.message}
                    </p>
                    
                    {!n.isRead && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
