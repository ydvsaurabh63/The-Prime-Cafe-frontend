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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import api from '../services/api';
import PortalSwitcher from '../components/PortalSwitcher';

const AdminLayout = () => {
  const { user, isAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

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
        const userEmail = (user.email || '').toLowerCase();
        const isClient = userEmail.includes('theprimecafe') || user.role === 'client' || user.role === 'superadmin';
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

      return () => {
        socket.off('admin_notification');
        socket.off('new_order');
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
    { label: 'Notifications', path: `${basePath}/notifications`, icon: Bell, badge: unreadCount },
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
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E6DCD3] p-5 justify-between">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A2C18] text-white flex items-center justify-center shadow-xs">
              <Coffee size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-[#2C1810] tracking-tight">The Prime Cafe</h1>
              <span className="text-[10px] font-semibold text-[#C85A32] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E6DCD3]">
                Management Panel
              </span>
            </div>
          </div>

          {/* 5 Navigation Tabs */}
          <nav className="space-y-1.5">
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

        {/* Footer info & Logout */}
        <div className="pt-4 border-t border-[#E6DCD3] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F5EFEB] border border-[#E6DCD3] font-bold text-xs flex items-center justify-center text-[#4A2C18]">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#2C1810] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#7A685D] truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-[#E6DCD3] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Coffee size={20} className="text-[#4A2C18]" />
          <h2 className="font-extrabold text-sm text-[#2C1810]">The Prime Cafe Admin</h2>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-rose-600 font-semibold p-1"
        >
          Logout
        </button>
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

      {/* Mobile Fixed Bottom Nav with Exactly Five Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E6DCD3] grid grid-cols-5 h-16 shadow-[0_-4px_20px_rgba(44,24,16,0.06)]">
        {navTabs.map((item) => {
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
              <span className="text-[10px] mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      </div>
    </div>
  );
};

export default AdminLayout;
