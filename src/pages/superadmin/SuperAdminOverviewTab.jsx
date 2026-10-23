import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Store,
  UsersRound,
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Mail,
  Phone
} from 'lucide-react';
import { fetchSuperAdminOverview, fetchClientsApi, fetchAdminsApi, getStoredClients, getStoredAdmins } from '../../services/superAdminData';

const SuperAdminOverviewTab = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState(getStoredClients());
  const [admins, setAdmins] = useState(getStoredAdmins());
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, clientsData, adminsData] = await Promise.all([
        fetchSuperAdminOverview(),
        fetchClientsApi(),
        fetchAdminsApi()
      ]);

      if (overviewData) setStats(overviewData);
      if (clientsData && Array.isArray(clientsData)) setClients(clientsData);
      if (adminsData && Array.isArray(adminsData)) setAdmins(adminsData);
    } catch (e) {
      console.error('Error loading superadmin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute real dynamic values
  const totalSalesComputed = clients.reduce((acc, c) => acc + (c.totalSales || 0), 0);
  const totalOrdersComputed = clients.reduce((acc, c) => acc + (c.totalOrders || 0), 0);
  const displayRevenue = stats?.totalRevenue ?? totalSalesComputed;
  const displayOrders = stats?.totalOrders ?? totalOrdersComputed;
  const activeClientsCount = clients.filter((c) => c.status === 'Active').length;
  const inactiveClientsCount = clients.filter((c) => c.status !== 'Active').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#2C1810] tracking-tight">
              Superadmin Executive Overview
            </h1>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> Master HQ
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#7A685D] mt-0.5">
            Real-time platform sales, admin operations, and multi-cafe client management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#2C1810] rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Platform Sales */}
        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Total Platform Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            ₹{displayRevenue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <ArrowUpRight size={14} />
            <span>Live sales from {clients.length} registered cafe{clients.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* KPI 2: Managed Clients (Cafes) */}
        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Managed Clients (Cafes)</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#C85A32] flex items-center justify-center font-bold">
              <Store size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            {clients.length} <span className="text-xs font-semibold text-[#7A685D]">Cafe{clients.length === 1 ? '' : 's'}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="text-emerald-700 flex items-center gap-0.5">
              <CheckCircle2 size={12} /> {activeClientsCount} Active
            </span>
            {inactiveClientsCount > 0 && (
              <span className="text-[#7A685D] flex items-center gap-0.5">
                <Clock size={12} /> {inactiveClientsCount} Inactive
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Platform Admins */}
        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Platform Admins</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <UsersRound size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            {admins.length} <span className="text-xs font-semibold text-[#7A685D]">Admin{admins.length === 1 ? '' : 's'}</span>
          </div>
          <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
            <Sparkles size={12} />
            <span>Assigned across active operations</span>
          </div>
        </div>

        {/* KPI 4: Platform Orders */}
        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Platform Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            {displayOrders}
          </div>
          <div className="text-[11px] font-semibold text-blue-700">
            Real-time customer orders recorded
          </div>
        </div>
      </div>

      {/* Client Cafes Table (Full Width) */}
      <div className="bg-white border border-[#E6DCD3] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
          <div>
            <h2 className="font-extrabold text-sm md:text-base text-[#2C1810]">
              Client Cafes Overview & Performance
            </h2>
            <p className="text-xs text-[#7A685D]">
              Showing registered client cafes, owner contacts, and live performance.
            </p>
          </div>
          <button
            onClick={() => navigate('/superadmin/clients')}
            className="text-xs font-bold text-[#C85A32] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Clients</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Cafes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E6DCD3] text-[#7A685D] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Cafe Client</th>
                <th className="py-3 px-4">Owner & Contact</th>
                <th className="py-3 px-4">Assigned Admin</th>
                <th className="py-3 px-4 text-right">Total Sales</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFEB]">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#7A685D]">
                    No client cafes found.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c._id} className="hover:bg-[#FAF7F2] transition">
                    {/* Cafe Client */}
                    <td className="py-3 px-4 font-extrabold text-[#2C1810]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#4A2C18] text-white flex items-center justify-center font-black text-xs shadow-xs">
                          {c.cafeName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div>{c.cafeName}</div>
                          <div className="text-[10px] text-[#7A685D] font-normal">
                            ID: {c._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner & Contact */}
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="font-bold text-[#2C1810]">{c.ownerName}</div>
                      <div className="text-[11px] text-[#7A685D] flex items-center gap-1">
                        <Mail size={11} className="text-[#C85A32]" />
                        <span>{c.email}</span>
                      </div>
                      <div className="text-[11px] text-[#7A685D] flex items-center gap-1">
                        <Phone size={11} />
                        <span>{c.phone}</span>
                      </div>
                    </td>

                    {/* Assigned Admin */}
                    <td className="py-3 px-4">
                      <span className="bg-[#F5EFEB] px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#4A2C18]">
                        {c.assignedAdminName || 'Superadmin HQ'}
                      </span>
                    </td>

                    {/* Total Sales */}
                    <td className="py-3 px-4 text-right font-extrabold text-[#2C1810]">
                      <div>₹{c.totalSales?.toLocaleString('en-IN') || '0'}</div>
                      <div className="text-[10px] font-normal text-[#7A685D]">
                        {c.totalOrders || 0} orders
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        <CheckCircle2 size={11} />
                        <span>{c.status || 'Active'}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate('/client/orders')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C85A32] bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                        title="Open Cafe Client Dashboard"
                      >
                        <span>Open Panel</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminOverviewTab;
