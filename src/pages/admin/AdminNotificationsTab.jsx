import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, ArrowRight, Clock, AlertTriangle, ShoppingBag, X } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../services/socket';

const AdminNotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    socket.emit('join_admin');

    socket.on('admin_notification', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => {
      socket.off('admin_notification');
    };
  }, []);

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await api.patch(`/admin/notifications/${notifId}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch('/admin/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      const res = await api.delete(`/admin/notifications/${notifId}`);
      if (res.data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleClickNotification = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }
    if (notif.order || notif.orderNumber) {
      navigate('/admin/orders');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag size={18} className="text-emerald-600" />;
      case 'cancellation_request':
        return <AlertTriangle size={18} className="text-rose-600" />;
      default:
        return <Bell size={18} className="text-[#C85A32]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#2C1810]">Notification Center</h2>
            {unreadCount > 0 && (
              <span className="bg-[#C85A32] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#7A685D] mt-0.5">
            Real-time alerts for incoming table orders, customer cancellations, and system events.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold bg-white border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#4A2C18] px-3 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck size={15} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-[#4A2C18] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs text-[#7A685D]">Loading alerts...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DCD3]">
          <Bell size={40} className="mx-auto text-[#7A685D]/60 mb-2" />
          <h3 className="text-base font-bold text-[#2C1810]">All caught up!</h3>
          <p className="text-xs text-[#7A685D] mt-1">
            New customer orders and alerts will be logged here as they occur.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                notif.isRead
                  ? 'bg-white border-[#E6DCD3]'
                  : 'bg-[#FDFBF9] border-[#C85A32]/40 shadow-xs'
              }`}
            >
              <div
                className="flex items-start gap-3 cursor-pointer flex-1"
                onClick={() => handleClickNotification(notif)}
              >
                <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E6DCD3]/60">
                  {getTypeIcon(notif.type)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-[#2C1810]">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#C85A32]"></span>
                    )}
                  </div>
                  <p className="text-xs text-[#7A685D] leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-[#7A685D] flex items-center gap-1 pt-1">
                    <Clock size={11} /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                    • {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="p-1.5 text-xs text-[#7A685D] hover:text-[#4A2C18] hover:bg-[#FAF7F2] rounded-lg transition"
                    title="Mark as read"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notif._id)}
                  className="p-1.5 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsTab;
