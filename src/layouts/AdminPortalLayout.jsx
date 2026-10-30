import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  UserCheck,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminPortalLayout = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      const isSuper = user?.role === 'superadmin';
      const isAdmin = user?.role === 'admin' || isSuper;
      if (!user || !isAdmin) {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Exactly 2 Tabs as requested by user: 1st overview, 2nd manage client
  const navTabs = [
    { label: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { label: 'Manage Client', path: '/admin/clients', icon: Store }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] space-y-4 p-4">
        <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg ring-2 ring-[#C85A32]/35 bg-black flex items-center justify-center animate-pulse">
          <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#E6DCD3] border-t-[#C85A32] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#7A685D]">Connecting to Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col antialiased">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E6DCD3] p-5 md:sticky md:top-0 md:h-screen justify-between overflow-y-auto shrink-0">
          <div className="space-y-6">
            {/* Admin Brand */}
            <div className="flex items-center gap-3 pb-2 border-b border-[#E6DCD3]/60">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs shrink-0 ring-1 ring-[#C85A32]/30 bg-black flex items-center justify-center">
                <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-[#2C1810] tracking-tight">The Prime Cafe</h1>
                <span className="text-[10px] font-extrabold text-[#C85A32] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E6DCD3] flex items-center gap-1 w-max mt-0.5">
                  <Sparkles size={10} /> Admin Portal
                </span>
              </div>
            </div>

            {/* Exactly 2 Navigation Tabs Section */}
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
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                          isActive
                            ? 'bg-[#4A2C18] text-white shadow-xs'
                            : 'text-[#7A685D] hover:bg-[#F5EFEB] hover:text-[#2C1810]'
                        }`
                      }
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
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

        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-[#E6DCD3] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-[#C85A32]/30 bg-black flex items-center justify-center">
              <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#2C1810]">The Prime Cafe</h2>
              <span className="text-[10px] text-[#C85A32] font-bold block leading-none">Admin Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 flex flex-col justify-between">
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="mt-12 pt-4 border-t border-[#E6DCD3] text-center text-xs text-[#7A685D]">
            © 2026 The Prime Cafe. Admin Management Portal.
          </footer>
        </main>

        {/* Mobile Fixed Bottom Nav with Exactly 2 Tabs */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E6DCD3] grid grid-cols-2 h-16 shadow-[0_-4px_20px_rgba(44,24,16,0.06)]">
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
                <Icon size={19} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminPortalLayout;
