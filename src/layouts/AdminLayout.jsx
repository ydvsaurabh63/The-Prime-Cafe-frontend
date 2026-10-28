import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  UtensilsCrossed,
  Tag,
  Bell,
  User,
  Coffee,
  LogOut,
  QrCode,
  Sparkles,
  Star,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import api from '../services/api';
import PortalSwitcher from '../components/PortalSwitcher';

const AdminLayout = () => {
  const { user, isAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [newReviewBadge, setNewReviewBadge] = useState(0);
  const [newCustomerBadge, setNewCustomerBadge] = useState(0);
  const [reviewToast, setReviewToast] = useState(null);
  const [customerToast, setCustomerToast] = useState(null);

  // Fetch unread notifications count
  const fetchUnread = async () => {
    try {
      const res = await api.get('/admin/notifications');
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/client/login', { replace: true });
      } else {
        const isClient = user.role === 'client' || user.role === 'admin' || user.role === 'superadmin';
        if (!isClient) {
          navigate('/client/login', { replace: true });
        }
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isAdmin || user?.role === 'superadmin') {
      fetchUnread();
      const socket = getSocket();
      socket.emit('join_admin');

      socket.on('admin_notification', (notif) => {
        setUnreadCount((prev) => prev + 1);
      });

      socket.on('new_order', () => {
        fetchUnread();
      });

      socket.on('new_review', (rev) => {
        setNewReviewBadge((prev) => prev + 1);
        setReviewToast(rev);
        setTimeout(() => {
          setReviewToast((curr) => (curr?._id === rev._id ? null : curr));
        }, 6000);
      });

      socket.on('new_customer', (cust) => {
        setNewCustomerBadge((prev) => prev + 1);
        setCustomerToast(cust);
        setTimeout(() => {
          setCustomerToast((curr) => (curr?._id === cust._id ? null : curr));
        }, 6000);
      });

      return () => {
        socket.off('admin_notification');
        socket.off('new_order');
        socket.off('new_review');
        socket.off('new_customer');
      };
    }
  }, [isAdmin, user]);

  const location = useLocation();
  const isClientRoute = location.pathname.startsWith('/client');
  const basePath = isClientRoute ? '/client' : '/admin';

  const navTabs = [
    { label: 'Orders', path: `${basePath}/orders`, icon: ShoppingBag },
    { label: 'Menu', path: `${basePath}/menu`, icon: UtensilsCrossed },
    { label: 'Offers', path: `${basePath}/offers`, icon: Tag },
    { label: 'Reviews', path: `${basePath}/reviews`, icon: Star, badge: newReviewBadge },
    { label: 'Customers', path: `${basePath}/customers`, icon: Users, badge: newCustomerBadge },
    { label: 'Notifications', path: `${basePath}/notifications`, icon: Bell, badge: unreadCount },
    { label: 'Profile', path: `${basePath}/profile`, icon: User }
  ];

  // Mobile Bottom Navigation Tabs (Notifications moved to top header for cleaner access)
  const bottomNavTabs = [
    { label: 'Orders', path: `${basePath}/orders`, icon: ShoppingBag },
    { label: 'Menu', path: `${basePath}/menu`, icon: UtensilsCrossed },
    { label: 'Offers', path: `${basePath}/offers`, icon: Tag },
    { label: 'Reviews', path: `${basePath}/reviews`, icon: Star, badge: newReviewBadge },
    { label: 'Customers', path: `${basePath}/customers`, icon: Users, badge: newCustomerBadge },
    { label: 'Profile', path: `${basePath}/profile`, icon: User }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/client/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] space-y-3">
        <div className="w-8 h-8 border-3 border-[#4A2C18] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-[#7A685D]">Connecting to The Prime Cafe Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col antialiased">
      <PortalSwitcher />
      <div className="flex-1 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E6DCD3] p-5 md:sticky md:top-0 md:h-screen justify-between overflow-y-auto shrink-0">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 pb-2 border-b border-[#E6DCD3]/60">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs shrink-0 ring-1 ring-[#C85A32]/30 bg-black flex items-center justify-center">
              <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-[#2C1810] tracking-tight">The Prime Cafe</h1>
              <span className="text-[10px] font-semibold text-[#C85A32] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E6DCD3]">
                Management Panel
              </span>
            </div>
          </div>

          {/* 5 Navigation Tabs Section */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#7A685D] px-2 tracking-wider">
              Navigation Tabs
            </span>
            <nav className="space-y-1 pt-1">
              {navTabs.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#4A2C18] text-white shadow-xs'
                          : 'text-[#7A685D] hover:bg-[#F5EFEB] hover:text-[#2C1810]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="bg-[#C85A32] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sign Out Section (Pinned to bottom of sidebar) */}
        <div className="pt-4 border-t border-[#E6DCD3] mt-auto">
          <button
            onClick={handleLogout}
            className="w-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header with Notification Hub */}
      <header className="md:hidden bg-white/95 backdrop-blur-md border-b border-[#E6DCD3] px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-xs ring-1 ring-[#C85A32]/30 bg-black flex items-center justify-center">
            <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-xs sm:text-sm text-[#2C1810] tracking-tight truncate">
              The Prime Cafe
            </h2>
            <span className="text-[10px] text-[#C85A32] font-bold block leading-tight">
              Management Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* If on notifications page, show Close button, else Notification Bell */}
          {location.pathname.endsWith('/notifications') ? (
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(`${basePath}/orders`);
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-[#2C1810] font-bold text-xs flex items-center gap-1 transition border border-[#E6DCD3] cursor-pointer"
              title="Close Notifications"
            >
              <X size={15} className="text-[#C85A32]" />
              <span>Close</span>
            </button>
          ) : (
            <NavLink
              to={`${basePath}/notifications`}
              className={({ isActive }) =>
                `relative p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-[#4A2C18] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#4A2C18] hover:bg-[#F5EFEB] border border-[#E6DCD3]'
                }`
              }
              title="Notifications & Broadcasts"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C85A32] text-white text-[9px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition"
            title="Sign Out"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 flex flex-col justify-between">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="mt-12 pt-4 border-t border-[#E6DCD3] text-center text-xs text-[#7A685D]">
          © 2026 Diin Technologies Pvt. Ltd. All rights reserved.
        </footer>
      </main>

      {/* Real-Time Live Review Toast Notification */}
      {reviewToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 max-w-sm w-full bg-white text-[#2C1810] p-4 rounded-2xl shadow-2xl border-2 border-amber-400 ring-4 ring-amber-400/20 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Star size={16} className="fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#2C1810]">
                  New {reviewToast.rating}★ Review Received!
                </h4>
                <p className="text-[11px] text-[#7A685D] font-semibold">
                  From {reviewToast.name} ({reviewToast.tag || 'Verified Diner'})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReviewToast(null)}
              className="text-[#7A685D] hover:text-[#2C1810] p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-[#4A3B32] mt-2 bg-[#FAF7F2] p-2 rounded-xl italic line-clamp-2 border border-[#E6DCD3]">
            "{reviewToast.review}"
          </p>
          <button
            type="button"
            onClick={() => {
              setReviewToast(null);
              navigate(`${basePath}/reviews`);
            }}
            className="w-full mt-2.5 py-1.5 rounded-lg bg-[#2C1810] hover:bg-[#1A0E08] text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View All Reviews</span>
          </button>
        </aside>
      )}

      {/* Real-Time Live Customer Check-In Toast Notification */}
      {customerToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 max-w-sm w-full bg-white text-[#2C1810] p-4 rounded-2xl shadow-2xl border-2 border-emerald-500 ring-4 ring-emerald-500/20 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                <Users size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-black text-[#2C1810]">
                    New Guest Check-In!
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-[#7A685D] font-bold">
                  {customerToast.name} (+91 {customerToast.phone})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCustomerToast(null)}
              className="text-[#7A685D] hover:text-[#2C1810] p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="text-[11px] text-[#4A3B32] mt-2 bg-[#FAF7F2] p-2 rounded-xl border border-[#E6DCD3] flex items-center justify-between">
            <span>Table: <strong>{customerToast.scannedTable || 'General Stand'}</strong></span>
            <span>Food: <strong>{customerToast.foodPreference || 'Both'}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => {
              setCustomerToast(null);
              navigate(`${basePath}/customers`);
            }}
            className="w-full mt-2.5 py-1.5 rounded-lg bg-[#2C1810] hover:bg-[#1A0E08] text-white text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View All Customers</span>
          </button>
        </aside>
      )}

      {/* Mobile Fixed Bottom Nav (Spacious 6 columns without notifications) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E6DCD3] grid grid-cols-6 h-16 shadow-[0_-4px_20px_rgba(44,24,16,0.06)] px-1">
        {bottomNavTabs.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center relative transition ${
                  isActive
                    ? 'text-[#4A2C18] font-bold'
                    : 'text-[#7A685D] hover:text-[#4A2C18]'
                }`
              }
            >
              <div className="relative">
                <Icon size={19} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C85A32] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 truncate max-w-full px-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      </div>
    </div>
  );
};

export default AdminLayout;
