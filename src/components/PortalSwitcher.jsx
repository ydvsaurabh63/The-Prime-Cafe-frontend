import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ShieldCheck, UserCheck, Coffee } from 'lucide-react';

const PortalSwitcher = () => {
  const location = useLocation();

  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const isAdminPortal = location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin/orders') && !location.pathname.startsWith('/admin/menu') && !location.pathname.startsWith('/admin/offers') && !location.pathname.startsWith('/admin/notifications') && !location.pathname.startsWith('/admin/profile');
  const isClientDashboard = location.pathname.startsWith('/client') || location.pathname.startsWith('/admin/orders') || location.pathname.startsWith('/admin/menu') || location.pathname.startsWith('/admin/offers') || location.pathname.startsWith('/admin/notifications') || location.pathname.startsWith('/admin/profile');

  return (
    <div className="bg-[#2C1810] text-[#FAF7F2] px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-[#4A2C18] shadow-sm z-50">
      <div className="flex items-center gap-2">
        <span className="font-bold tracking-wide uppercase text-[10px] text-[#E6DCD3] bg-[#4A2C18] px-2 py-0.5 rounded">
          Aaj Kal Cafe Multi-Portal
        </span>
        <span className="hidden sm:inline text-[#D8CCC4] text-[11px]">Quick Switcher:</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Superadmin Link */}
        <NavLink
          to="/superadmin/overview"
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              isSuperAdmin
                ? 'bg-[#C85A32] text-white shadow-xs'
                : 'text-[#E6DCD3] hover:bg-[#3D2314] hover:text-white'
            }`
          }
        >
          <ShieldCheck size={14} className="text-amber-300" />
          <span>Superadmin (3 Tabs)</span>
        </NavLink>

        {/* Admin Link */}
        <NavLink
          to="/admin/overview"
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              isAdminPortal
                ? 'bg-[#C85A32] text-white shadow-xs'
                : 'text-[#E6DCD3] hover:bg-[#3D2314] hover:text-white'
            }`
          }
        >
          <UserCheck size={14} className="text-emerald-300" />
          <span>Admin (2 Tabs)</span>
        </NavLink>

        {/* Client (The Prime Cafe) Link */}
        <NavLink
          to="/client/orders"
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              isClientDashboard
                ? 'bg-[#4A2C18] text-white border border-[#C85A32]'
                : 'text-[#E6DCD3] hover:bg-[#3D2314] hover:text-white'
            }`
          }
        >
          <Coffee size={14} className="text-orange-300" />
          <span>Client Dashboard</span>
        </NavLink>

        {/* Customer Menu Link */}
        <NavLink
          to="/"
          className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-300 hover:bg-[#3D2314] hover:text-white transition"
        >
          <span>Customer View ↗</span>
        </NavLink>
      </div>
    </div>
  );
};

export default PortalSwitcher;
