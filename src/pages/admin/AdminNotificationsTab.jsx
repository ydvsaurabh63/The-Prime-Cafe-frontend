import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowRight,
  Clock,
  AlertTriangle,
  ShoppingBag,
  Send,
  Sparkles,
  Gift,
  Coffee,
  CheckCircle2,
  Users,
  MapPin,
  RefreshCw,
  MessageSquare,
  X
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../../services/socket';

const OWNER_MESSAGE_PRESETS = [
  {
    title: 'Order is Ready for Pickup! 🍽️',
    message: 'Your freshly prepared order is ready! Please collect it from the counter or wait as our staff serves it.',
    type: 'kitchen_alert',
    priority: 'urgent',
    target: 'All'
  },
  {
    title: 'Happy Hours: 20% OFF Shakes & Coffees! ☕',
    message: 'Flash offer! Get a flat 20% discount on all handcrafted beverages for the next 1 hour.',
    type: 'offer_alert',
    priority: 'offer',
    target: 'All'
  },
  {
    title: 'Kitchen Closing Call in 20 Mins ⏰',
    message: 'Last call for kitchen orders! Please place any additional food or dessert orders within the next 20 minutes.',
    type: 'cafe_announcement',
    priority: 'urgent',
    target: 'All'
  },
  {
    title: 'Artisan Wood-Fired Pizza Special 🔥',
    message: 'Hot artisan pizzas just out of the oven! Try our chef signature slice today.',
    type: 'owner_message',
    priority: 'normal',
    target: 'All'
  }
];

const AdminNotificationsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('send_customer'); // 'send_customer' | 'incoming_alerts'

  // Incoming alerts state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Owner-to-Customer compose state
  const [targetTable, setTargetTable] = useState('All');
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgType, setMsgType] = useState('owner_message');
  const [msgPriority, setMsgPriority] = useState('normal');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [sendSuccessToast, setSendSuccessToast] = useState('');
  const [sendErrorToast, setSendErrorToast] = useState('');

  // Sent customer messages state
  const [sentMessages, setSentMessages] = useState([]);
  const [loadingSent, setLoadingSent] = useState(false);

  // Fetch incoming alerts
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

  // Fetch sent messages to customers
  const fetchSentMessages = async () => {
    try {
      setLoadingSent(true);
      const res = await api.get('/admin/customer-messages');
      if (res.data.success) {
        setSentMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch sent messages:', err);
    } finally {
      setLoadingSent(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchSentMessages();

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

  const handleApplyPreset = (preset) => {
    setMsgTitle(preset.title);
    setMsgBody(preset.message);
    setMsgType(preset.type);
    setMsgPriority(preset.priority);
    setTargetTable(preset.target);
  };

  const handleSendToCustomers = async (e) => {
    e.preventDefault();
    setSendErrorToast('');
    setSendSuccessToast('');

    if (!msgTitle.trim() || !msgBody.trim()) {
      setSendErrorToast('Please provide both message title and details.');
      return;
    }

    setSendingMsg(true);
    try {
      const res = await api.post('/admin/customer-messages', {
        title: msgTitle.trim(),
        message: msgBody.trim(),
        type: msgType,
        targetTable: targetTable.trim() || 'All',
        priority: msgPriority
      });

      if (res.data.success) {
        setSendSuccessToast('Message broadcasted to customers successfully! 🚀');
        setMsgTitle('');
        setMsgBody('');
        fetchSentMessages();
        setTimeout(() => setSendSuccessToast(''), 4000);
      }
    } catch (err) {
      setSendErrorToast(err.response?.data?.message || 'Failed to send message to customers.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDeleteSentMessage = async (msgId) => {
    try {
      const res = await api.delete(`/admin/customer-messages/${msgId}`);
      if (res.data.success) {
        setSentMessages((prev) => prev.filter((m) => m._id !== msgId));
      }
    } catch (e) {
      console.error('Delete message error:', e);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await api.patch(`/admin/notifications/${notifId}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch('/admin/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {}
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      const res = await api.delete(`/admin/notifications/${notifId}`);
      if (res.data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      }
    } catch (e) {}
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
      case 'customer_request':
        return <Bell size={18} className="text-amber-600" />;
      default:
        return <Bell size={18} className="text-[#C85A32]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DCD3] pb-4">
        <div className="flex items-start justify-between gap-3 w-full sm:w-auto">
          <div>
            <h2 className="text-xl font-extrabold text-[#2C1810] tracking-tight">
              Cafe Notification & Messaging Center
            </h2>
            <p className="text-xs text-[#7A685D] mt-0.5">
              Send real-time notices directly to customers or monitor incoming orders & staff calls.
            </p>
          </div>
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/admin/orders');
              }
            }}
            className="sm:hidden p-2 rounded-xl bg-white hover:bg-neutral-100 border border-[#E6DCD3] text-[#7A685D] hover:text-[#2C1810] flex items-center justify-center transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
            title="Close / Go Back"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher & Desktop Close Button */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] rounded-2xl border border-[#E6DCD3]">
            <button
              type="button"
              onClick={() => setActiveSubTab('send_customer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'send_customer'
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'text-[#7A685D] hover:text-[#2C1810]'
              }`}
            >
              <Send size={14} />
              <span>Send to Customers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('incoming_alerts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'incoming_alerts'
                  ? 'bg-[#4A2C18] text-white shadow-xs'
                  : 'text-[#7A685D] hover:text-[#2C1810]'
              }`}
            >
              <Bell size={14} />
              <span>Incoming Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-[#C85A32] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Close Button */}
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/admin/orders');
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E6DCD3] text-[#4A2C18] hover:text-[#C85A32] text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
            title="Close Notifications"
          >
            <X size={15} />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OWNER TO CUSTOMER DYNAMIC MESSAGING */}
      {/* ============================================================== */}
      {activeSubTab === 'send_customer' ? (
        <div className="space-y-6">
          {/* Compose Card */}
          <div className="bg-white rounded-3xl border border-[#E6DCD3] p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5EFEB] pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#2C1810] flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-[#C85A32]/10 text-[#C85A32]">
                    <Send size={16} />
                  </span>
                  <span>Broadcast Notice to Customers</span>
                </h3>
                <p className="text-xs text-[#7A685D] mt-0.5">
                  Send a live message, order alert, or offer to all customers or a specific table.
                </p>
              </div>

              {/* Quick Template Pill Buttons */}
              <div className="text-xs font-bold text-[#7A685D] self-start sm:self-auto">
                Quick Templates
              </div>
            </div>

            {/* Quick Templates List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {OWNER_MESSAGE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-3 rounded-2xl border border-[#E6DCD3] bg-[#FAF7F2] hover:bg-[#F5EFEB] hover:border-[#C85A32]/50 text-left transition cursor-pointer group"
                >
                  <span className="text-xs font-bold text-[#2C1810] group-hover:text-[#C85A32] block line-clamp-1">
                    {p.title}
                  </span>
                  <span className="text-[11px] text-[#7A685D] line-clamp-2 mt-1">
                    {p.message}
                  </span>
                </button>
              ))}
            </div>

            {/* Message Form */}
            <form onSubmit={handleSendToCustomers} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Target Table */}
                <div>
                  <label className="text-xs font-bold text-[#2C1810] block mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#C85A32]" />
                    <span>Target Customers</span>
                  </label>
                  <select
                    value={targetTable}
                    onChange={(e) => setTargetTable(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DCD3] focus:outline-hidden focus:ring-1 focus:ring-[#C85A32]"
                  >
                    <option value="All">All Tables / All Customers 👥</option>
                    <option value="Table 1">Table 1</option>
                    <option value="Table 2">Table 2</option>
                    <option value="Table 3">Table 3</option>
                    <option value="Table 4">Table 4</option>
                    <option value="Table 5">Table 5</option>
                    <option value="Table 6">Table 6</option>
                    <option value="Table 7">Table 7</option>
                    <option value="Table 8">Table 8</option>
                    <option value="Table 9">Table 9</option>
                    <option value="Table 10">Table 10</option>
                    <option value="Walk-in">Walk-in Counter</option>
                  </select>
                </div>

                {/* Notice Type */}
                <div>
                  <label className="text-xs font-bold text-[#2C1810] block mb-1.5 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#C85A32]" />
                    <span>Notice Type</span>
                  </label>
                  <select
                    value={msgType}
                    onChange={(e) => setMsgType(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DCD3] focus:outline-hidden focus:ring-1 focus:ring-[#C85A32]"
                  >
                    <option value="owner_message">📢 General Notice</option>
                    <option value="kitchen_alert">🍽️ Kitchen / Order Ready</option>
                    <option value="offer_alert">🎁 Special Offer / Deal</option>
                    <option value="cafe_announcement">⏰ Cafe Announcement</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs font-bold text-[#2C1810] block mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-[#C85A32]" />
                    <span>Priority Level</span>
                  </label>
                  <select
                    value={msgPriority}
                    onChange={(e) => setMsgPriority(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DCD3] focus:outline-hidden focus:ring-1 focus:ring-[#C85A32]"
                  >
                    <option value="normal">Normal (Information)</option>
                    <option value="urgent">Urgent Alert (High Alert)</option>
                    <option value="offer">Special Offer Highlight</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-[#2C1810] block mb-1.5">
                  Message Title / Heading
                </label>
                <input
                  type="text"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  placeholder="e.g. Table 4 Order is Ready! or Special 15% Discount on Desserts"
                  className="w-full text-xs font-bold p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DCD3] focus:outline-hidden focus:ring-1 focus:ring-[#C85A32]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-bold text-[#2C1810] block mb-1.5">
                  Message Details
                </label>
                <textarea
                  rows={3}
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Type the message that will pop up on customer screens..."
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DCD3] focus:outline-hidden focus:ring-1 focus:ring-[#C85A32]"
                />
              </div>

              {/* Toast Alerts */}
              {sendSuccessToast && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{sendSuccessToast}</span>
                </div>
              )}

              {sendErrorToast && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                  {sendErrorToast}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-extrabold shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{sendingMsg ? 'Broadcasting...' : 'Send Message to Customers 🚀'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sent History List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-[#2C1810]">
                  Recently Sent Customer Notices ({sentMessages.length})
                </h4>
                <p className="text-xs text-[#7A685D]">
                  Active messages visible to customers on their header bell.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchSentMessages}
                disabled={loadingSent}
                className="text-xs font-bold text-[#7A685D] hover:text-[#2C1810] flex items-center gap-1"
              >
                <RefreshCw size={12} className={loadingSent ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingSent ? (
              <div className="py-8 text-center text-xs text-[#7A685D]">Loading sent history...</div>
            ) : sentMessages.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#E6DCD3] text-[#7A685D] text-xs">
                No notices sent to customers yet. Use the form above to send an announcement.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sentMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="p-4 bg-white rounded-2xl border border-[#E6DCD3] shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#4A2C18] border border-[#E6DCD3]">
                          📍 Target: {msg.targetTable || 'All'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {msg.priority === 'urgent' ? '⚡ Urgent' : msg.priority === 'offer' ? '🎁 Offer' : '📢 Notice'}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-[#2C1810] pt-0.5">{msg.title}</h5>
                      <p className="text-xs text-[#7A685D] leading-relaxed">{msg.message}</p>
                      <p className="text-[10px] text-[#7A685D] flex items-center gap-1 pt-1">
                        <Clock size={11} /> Sent on {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        • {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSentMessage(msg._id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Delete notice"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* TAB 2: INCOMING ALERTS & REQUESTS (Orders, Waiter Calls, etc.) */
        /* ============================================================== */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[#2C1810]">
                Incoming Orders & Service Requests
              </h3>
              <p className="text-xs text-[#7A685D]">
                Orders placed, table assistance requests, and customer cancellations.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold bg-white border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#4A2C18] px-3 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1.5"
              >
                <CheckCheck size={14} /> Mark All as Read
              </button>
            )}
          </div>

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
      )}
    </div>
  );
};

export default AdminNotificationsTab;
