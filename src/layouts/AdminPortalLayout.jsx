import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  UserCheck,
  Coffee,
  LogOut,
  Sparkles
} from 'lucide-react';
import PortalSwitcher from '../components/PortalSwitcher';

const AdminPortalLayout = () => {
  const navigate = useNavigate();

  // Exactly 2 Tabs as requested by user: 1st overview, 2nd manage client
  const navTabs = [
    { label: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { label: 'Manage Client', path: '/admin/clients', icon: Store }
  ];

  const handleLogout = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col antialiased">
      {/* Multi-Portal Quick Switcher at top */}
      <PortalSwitcher />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E6DCD3] p-5 justify-between">
          <div className="space-y-6">
            {/* Admin Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#4A2C18] text-white flex items-center justify-center shadow-xs">
                <UserCheck size={22} className="text-amber-300" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-[#2C1810] tracking-tight">Aaj Kal Cafe</h1>
                <span className="text-[10px] font-extrabold text-[#C85A32] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E6DCD3] flex items-center gap-1 w-max mt-0.5">
                  <Sparkles size={10} /> Admin Portal
                </span>
              </div>
            </div>

            {/* Exactly 2 Navigation Tabs */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#7A685D] px-3 tracking-wider">
                Admin Panel Tabs
              </span>
              <nav className="space-y-1.5 pt-1">
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

          {/* Footer info & Actions */}
          <div className="pt-4 border-t border-[#E6DCD3] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F5EFEB] border border-[#E6DCD3] font-bold text-xs flex items-center justify-center text-[#4A2C18]">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#2C1810] truncate">Amit Sharma</p>
                <p className="text-[10px] text-[#7A685D] truncate">Delhi NCR Region</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/client/orders')}
              className="w-full text-xs font-bold text-[#4A2C18] bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#E6DCD3] py-2 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Coffee size={14} className="text-[#C85A32]" />
              <span>Open Client Dashboard</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-[#E6DCD3] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <UserCheck size={20} className="text-[#4A2C18]" />
            <h2 className="font-extrabold text-sm text-[#2C1810]">Admin Portal</h2>
          </div>
          <button
            onClick={() => navigate('/client/orders')}
            className="text-[11px] font-bold text-[#C85A32] bg-orange-50 px-2 py-1 rounded-lg"
          >
            Client Panel
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 flex flex-col justify-between">
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="mt-12 pt-4 border-t border-[#E6DCD3] text-center text-xs text-[#7A685D]">
            © 2026 Aaj Kal Cafe Platform. Admin Management Portal.
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
