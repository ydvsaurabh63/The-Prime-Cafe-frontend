import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Sparkles,
  AlertTriangle,
  Gift,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  Droplets,
  Receipt,
  Utensils,
  UtensilsCrossed,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

const QUICK_SERVICE_OPTIONS = [
  { label: 'Call Waiter', icon: Bell, message: 'Please send a waiter to our table.' },
  { label: 'Drinking Water', icon: Droplets, message: 'Please provide fresh drinking water.' },
  { label: 'Request Bill', icon: Receipt, message: 'Please bring our table bill.' },
  { label: 'Clean Table', icon: Utensils, message: 'Please clean our table.' },
  { label: 'Cutlery & Napkins', icon: UtensilsCrossed, message: 'Please provide extra cutlery and napkins.' },
  { label: 'Order Inquiry', icon: MessageSquare, message: 'Could you please check on our order status?' }
];

const CustomerNoticeModal = ({ isOpen, onClose, onUnreadCountChange }) => {
  const { table, setTable } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('notices'); // 'notices' | 'call_staff'
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('akc_read_notices') || '[]');
    } catch {
      return [];
    }
  });

  // Call staff form states
  const [tableInput, setTableInput] = useState(table?.number || table?.name || '');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [selectedQuick, setSelectedQuick] = useState(QUICK_SERVICE_OPTIONS[0].label);
  const [customMessage, setCustomMessage] = useState(QUICK_SERVICE_OPTIONS[0].message);
  const [sendingStaffCall, setSendingStaffCall] = useState(false);
  const [staffSuccessMsg, setStaffSuccessMsg] = useState('');
  const [staffErrorMsg, setStaffErrorMsg] = useState('');

  // Fetch notices from backend
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const tableParam = table?.number || table?.name || '';
      const res = await api.get(`/customer-notifications?table=${encodeURIComponent(tableParam)}`);
      if (res.data?.success) {
        const fetched = res.data.data || [];
        setNotices(fetched);
        updateUnreadCount(fetched, readIds);
      }
    } catch (err) {
      console.warn('Failed to fetch customer notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = (list, readList) => {
    const unread = list.filter((n) => !readList.includes(n._id)).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unread);
    }
  };

  useEffect(() => {
    fetchNotices();

    const socket = getSocket();
    const handleNewNotification = (newNotif) => {
      // Check if for this table or all
      const currentTable = String(table?.number || table?.name || '').toLowerCase();
      const notifTarget = String(newNotif.targetTable || 'All').toLowerCase();

      if (notifTarget === 'all' || notifTarget === currentTable || notifTarget.includes(currentTable)) {
        setNotices((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
        // Notify parent of unread change
        setReadIds((currentRead) => {
          const unread = [newNotif, ...notices].filter((n) => !currentRead.includes(n._id)).length;
          if (onUnreadCountChange) onUnreadCountChange(unread);
          return currentRead;
        });
      }
    };

    socket.on('customer_notification', handleNewNotification);

    return () => {
      socket.off('customer_notification', handleNewNotification);
    };
  }, [table]);

  const handleMarkAllRead = () => {
    const allIds = notices.map((n) => n._id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem('akc_read_notices', JSON.stringify(updated));
    } catch {}
    if (onUnreadCountChange) onUnreadCountChange(0);
  };

  const handleMarkSingleRead = (id) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    try {
      localStorage.setItem('akc_read_notices', JSON.stringify(updated));
    } catch {}
    updateUnreadCount(notices, updated);
  };

  const handleSendStaffCall = async (e) => {
    e.preventDefault();
    setStaffErrorMsg('');

    const resolvedTable = tableInput.trim() || table?.number || table?.name || 'Walk-in';
    const messageToSend = customMessage.trim() || `Customer requested: ${selectedQuick}`;

    setSendingStaffCall(true);
    try {
      const res = await api.post('/notify-staff', {
        tableNumber: resolvedTable,
        customerName: customerName.trim() || (isAuthenticated ? user?.name : 'Guest Customer'),
        requestType: selectedQuick,
        message: messageToSend
      });

      if (res.data?.success) {
        if (tableInput.trim() && (!table || table.number !== tableInput.trim())) {
          setTable({
            number: tableInput.trim(),
            name: String(tableInput.trim()).toLowerCase().startsWith('table')
              ? tableInput.trim()
              : `Table ${tableInput.trim()}`
          });
        }

        setStaffSuccessMsg('Alert sent to cafe staff successfully!');
        setTimeout(() => {
          setStaffSuccessMsg('');
          onClose();
        }, 2000);
      }
    } catch (err) {
      setStaffErrorMsg(err.response?.data?.message || 'Failed to notify staff. Please try again.');
    } finally {
      setSendingStaffCall(false);
    }
  };

  const getPriorityBadge = (priority, type) => {
    if (priority === 'urgent' || type === 'kitchen_alert') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
          <AlertTriangle size={11} /> Urgent Notice
        </span>
      );
    }
    if (priority === 'offer' || type === 'offer_alert') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
          <Gift size={11} /> Special Deal
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
        <Sparkles size={11} /> Cafe Update
      </span>
    );
  };

  if (!isOpen) return null;

  const unreadNoticesCount = notices.filter((n) => !readIds.includes(n._id)).length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-3xl border border-[#E6DCD3] shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[85vh] text-[#2C1810]">
        {/* Modal Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-[#E6DCD3] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs shrink-0 ring-1 ring-[#C85A32]/30 bg-black flex items-center justify-center">
              <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#2C1810] leading-tight">
                  Cafe Notice & Messages
                </h3>
                {unreadNoticesCount > 0 && (
                  <span className="bg-[#C85A32] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    {unreadNoticesCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A685D] mt-0.5">
                Real-time updates & announcements directly from cafe management
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#E6DCD3] flex items-center justify-center text-[#7A685D] hover:text-[#2C1810] transition cursor-pointer shrink-0"
          >
            <X size={17} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 bg-white/70 border-b border-[#E6DCD3] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E6DCD3]/80">
            <button
              type="button"
              onClick={() => setActiveTab('notices')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'notices'
                  ? 'bg-[#4A2C18] text-white shadow-xs'
                  : 'text-[#7A685D] hover:text-[#2C1810]'
              }`}
            >
              <Bell size={13} />
              <span>Owner Messages</span>
              {unreadNoticesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('call_staff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'call_staff'
                  ? 'bg-[#4A2C18] text-white shadow-xs'
                  : 'text-[#7A685D] hover:text-[#2C1810]'
              }`}
            >
              <UserCheck size={13} />
              <span>Call Waiter</span>
            </button>
          </div>

          {activeTab === 'notices' && unreadNoticesCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-[#C85A32] hover:text-[#9A3B18] transition flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'notices' ? (
            /* TAB 1: NOTICES FROM CAFE OWNER */
            loading ? (
              <div className="py-12 text-center text-[#7A685D]">
                <div className="w-8 h-8 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Checking latest cafe updates...</p>
              </div>
            ) : notices.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-[#E6DCD3] p-6 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E6DCD3] text-[#7A685D] flex items-center justify-center mx-auto">
                  <Bell size={22} />
                </div>
                <h4 className="text-sm font-bold text-[#2C1810]">No Active Notices</h4>
                <p className="text-xs text-[#7A685D] max-w-xs mx-auto">
                  Everything is running smoothly! Cafe owner and staff updates will pop up here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => {
                  const isRead = readIds.includes(n._id);

                  return (
                    <div
                      key={n._id}
                      onClick={() => handleMarkSingleRead(n._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        !isRead
                          ? 'bg-white border-[#C85A32]/60 shadow-[0_2px_12px_rgba(200,90,50,0.12)] ring-1 ring-[#C85A32]/30'
                          : 'bg-white/80 border-[#E6DCD3] hover:border-[#C85A32]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {getPriorityBadge(n.priority, n.type)}
                          {n.targetTable && n.targetTable !== 'All' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#4A2C18] border border-[#E6DCD3]">
                              📍 {n.targetTable}
                            </span>
                          )}
                        </div>
                        {!isRead && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#C85A32] text-white animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm text-[#2C1810] mt-2">
                        {n.title}
                      </h4>
                      <p className="text-xs text-[#5C4A3E] mt-1 leading-relaxed whitespace-pre-line">
                        {n.message}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-[#F5EFEB] flex items-center justify-between text-[10px] text-[#7A685D]">
                        <span className="font-semibold text-[#C85A32]">
                          👤 {n.senderName || 'Cafe Owner'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}{' '}
                          • {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* TAB 2: CALL STAFF / SERVICE BELL */
            <form onSubmit={handleSendStaffCall} className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#E6DCD3]">
              <div>
                <span className="text-xs font-bold text-[#2C1810] block mb-1">
                  1. Select Service Needed
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_SERVICE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedQuick === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setSelectedQuick(opt.label);
                          setCustomMessage(opt.message);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer text-xs font-bold ${
                          isSelected
                            ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-xs'
                            : 'bg-[#FAF7F2] text-[#4A2C18] border-[#E6DCD3] hover:border-[#C85A32]'
                        }`}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#7A685D] block mb-1">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={tableInput}
                    onChange={(e) => setTableInput(e.target.value)}
                    placeholder="e.g. Table 4"
                    className="w-full text-xs font-bold p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DCD3] focus:outline-hidden focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#7A685D] block mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DCD3] focus:outline-hidden focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#7A685D] block mb-1">
                  Message to Staff
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DCD3] focus:outline-hidden focus:ring-1 focus:ring-[#C85A32]"
                />
              </div>

              {staffSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>{staffSuccessMsg}</span>
                </div>
              )}

              {staffErrorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                  {staffErrorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={sendingStaffCall}
                className="w-full py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#382012] text-white font-extrabold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send size={13} />
                <span>{sendingStaffCall ? 'Sending Alert...' : 'Ring Bell / Send Call'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-white border-t border-[#E6DCD3] flex items-center justify-between text-xs text-[#7A685D]">
          <span>The Prime Cafe Management Broadcast</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#E6DCD3] text-[#2C1810] font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerNoticeModal;
