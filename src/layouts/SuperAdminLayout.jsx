import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UsersRound,
  Store,
  ShieldCheck,
  LogOut,
  Coffee,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      const userEmail = (user?.email || '').toLowerCase();
      const isSuper = user?.role === 'superadmin' || userEmail === 'superadmin@aajkalcafe.com';
      if (!user || !isSuper) {
        navigate('/superadmin/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Exactly 3 Tabs as requested by user
  const navTabs = [
    { label: 'Overview', path: '/superadmin/overview', icon: LayoutDashboard },
    { label: 'Manage Admin', path: '/superadmin/admins', icon: UsersRound },
    { label: 'Manage Client', path: '/superadmin/clients', icon: Store }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/superadmin/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col antialiased">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E6DCD3] p-5 md:sticky md:top-0 md:h-screen justify-between overflow-y-auto shrink-0">
          <div className="space-y-6">
            {/* Superadmin Brand */}
            <div className="flex items-center gap-3 pb-2 border-b border-[#E6DCD3]/60">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2C1810] to-[#C85A32] text-amber-300 flex items-center justify-center shadow-md shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-[#2C1810] tracking-tight">Aaj Kal Cafe</h1>
                <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 w-max mt-0.5">
                  <Sparkles size={10} /> Superadmin HQ
                </span>
              </div>
            </div>

            {/* Exactly 3 Tabs Section */}
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
                            ? 'bg-[#2C1810] text-amber-300 shadow-xs'
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

          {/* Account & Sign Out Section (Pinned to bottom of sidebar) */}
          <div className="pt-4 border-t border-[#E6DCD3] space-y-3 mt-auto">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 font-black text-xs flex items-center justify-center text-amber-900 shrink-0">
                SA
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-extrabold text-[#2C1810] truncate">Super Admin Master</p>
                <p className="text-[10px] text-[#7A685D] truncate">{user?.email || 'superadmin@aajkalcafe.com'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogOut size={14} /> Sign Out
            </button>

            <button
              onClick={() => navigate('/client/orders')}
              className="w-full text-xs font-bold text-[#4A2C18] bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#E6DCD3] py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Coffee size={14} className="text-[#C85A32]" />
              <span>Open Client Dashboard</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-[#E6DCD3] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#C85A32]" />
            <span className="font-black text-sm text-[#2C1810]">Superadmin HQ</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/client/orders')}
              className="text-[11px] font-bold text-[#C85A32] bg-orange-50 px-2 py-1 rounded-lg"
            >
              Client Panel
            </button>
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
            © 2026 Aaj Kal Cafe SaaS Platform. Superadmin Master Panel.
          </footer>
        </main>

        {/* Mobile Fixed Bottom Nav with Exactly 3 Tabs */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E6DCD3] grid grid-cols-3 h-16 shadow-[0_-4px_20px_rgba(44,24,16,0.06)]">
          {navTabs.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center relative transition ${
                    isActive
                      ? 'text-[#C85A32] font-black'
                      : 'text-[#7A685D] hover:text-[#2C1810]'
                  }`
                }
              >
                <Icon size={19} />
                <span className="text-[10px] mt-1 font-semibold">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
