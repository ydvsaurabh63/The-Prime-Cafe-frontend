import React, { useState, useEffect } from 'react';
import { Coffee, Bell, Sparkles, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import CustomerNoticeModal from './CustomerNoticeModal';
import { getSocket } from '../services/socket';
import api from '../services/api';

const CustomerHeader = () => {
  const { itemCount, table } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [incomingAlert, setIncomingAlert] = useState(null);

  // Initial fetch of unread notices count
  useEffect(() => {
    const checkUnreadCount = async () => {
      try {
        const tableParam = table?.number || table?.name || '';
        const res = await api.get(`/customer-notifications?table=${encodeURIComponent(tableParam)}`);
        if (res.data?.success) {
          const list = res.data.data || [];
          let readIds = [];
          try {
            readIds = JSON.parse(localStorage.getItem('akc_read_notices') || '[]');
          } catch {}
          const unread = list.filter((n) => !readIds.includes(n._id)).length;
          setUnreadCount(unread);
        }
      } catch (e) {
        // ignore
      }
    };

    checkUnreadCount();

    const socket = getSocket();
    const handleNewNotif = (newNotif) => {
      const currentTable = String(table?.number || table?.name || '').toLowerCase();
      const notifTarget = String(newNotif.targetTable || 'All').toLowerCase();

      if (notifTarget === 'all' || notifTarget === currentTable || notifTarget.includes(currentTable)) {
        setUnreadCount((c) => c + 1);
        setIncomingAlert(newNotif);
        setTimeout(() => {
          setIncomingAlert((curr) => (curr?._id === newNotif._id ? null : curr));
        }, 6000);
      }
    };

    socket.on('customer_notification', handleNewNotif);

    return () => {
      socket.off('customer_notification', handleNewNotif);
    };
  }, [table]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DCD3] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Link
              to="/"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#4A2C18] text-[#FAF7F2] flex items-center justify-center shadow-md shrink-0"
            >
              <Coffee size={19} className="text-[#FAF7F2]" />
            </Link>
            <div className="min-w-0">
              <Link to="/">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#2C1810] tracking-tight leading-none hover:text-[#C85A32] transition truncate">
                  The Prime Cafe
                </h1>
              </Link>
              <p className="text-[10px] sm:text-[11px] text-[#7A685D] mt-0.5 font-medium truncate max-w-[140px] sm:max-w-none">
                Artisanal Brews & Comfort Eats
              </p>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dynamic Cafe Owner to Customer Notice Bell */}
            <button
              type="button"
              onClick={() => setIsNoticeModalOpen(true)}
              className={`flex items-center gap-1.5 text-xs font-black px-3 sm:px-4 py-1.5 rounded-full shadow-xs transition active:scale-95 cursor-pointer relative ${
                unreadCount > 0
                  ? 'bg-gradient-to-r from-[#C85A32] to-[#E06638] text-white ring-2 ring-[#C85A32]/40 shadow-md animate-pulse'
                  : 'bg-[#C85A32] hover:bg-[#B24E2A] text-white'
              }`}
              title="View Notices & Messages from Cafe Owner"
            >
              <Bell size={13} className={unreadCount > 0 ? 'animate-bounce stroke-[2.5]' : ''} />
              <span className="text-[11px] sm:text-xs">Cafe Notice</span>
              {unreadCount > 0 && (
                <span className="ml-0.5 bg-white text-[#C85A32] font-black text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            <Link
              to="/client/login"
              className="hidden lg:inline-block text-[11px] text-[#7A685D] hover:text-[#4A2C18] font-semibold underline ml-1"
            >
              Management Portal
            </Link>
          </div>
        </div>

        {/* Real-Time Floating Banner when Cafe Owner broadcasts a notice */}
        {incomingAlert && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-[92%] max-w-lg bg-neutral-900 text-white rounded-2xl p-3 shadow-2xl border-2 border-amber-400 flex items-start justify-between gap-3 animate-in slide-in-from-top-3 backdrop-blur-md">
            <div
              className="flex-1 cursor-pointer"
              onClick={() => {
                setIncomingAlert(null);
                setIsNoticeModalOpen(true);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-400/20 text-amber-400">
                  <Sparkles size={13} />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  New Message from Cafe Owner
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                {incomingAlert.title}
              </h4>
              <p className="text-[11px] text-neutral-300 mt-0.5 line-clamp-1">
                {incomingAlert.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIncomingAlert(null)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </header>

      {/* Dynamic Cafe Notice & Owner Messages Modal */}
      <CustomerNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onUnreadCountChange={(count) => setUnreadCount(count)}
      />
    </>
  );
};

export default CustomerHeader;
