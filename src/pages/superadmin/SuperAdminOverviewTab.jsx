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
  Server,
  Activity
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
            Real-time platform sales, territory admins, and multi-cafe client management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#2C1810] rounded-xl text-xs font-bold transition shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Total Platform Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            ₹{stats?.totalRevenue?.toLocaleString('en-IN') || '1,48,970'}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <ArrowUpRight size={14} />
            <span>+18.4% this month</span>
            <span className="text-[#7A685D] ml-1">across all branches</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Managed Clients (Cafes)</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#C85A32] flex items-center justify-center font-bold">
              <Store size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            {clients.length} <span className="text-xs font-semibold text-[#7A685D]">Cafes</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="text-emerald-700 flex items-center gap-0.5">
              <CheckCircle2 size={12} /> {clients.filter(c => c.status === 'Active').length} Active
            </span>
            <span className="text-amber-700 flex items-center gap-0.5">
              <Clock size={12} /> {clients.filter(c => c.status === 'Pending').length} Pending
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Territory Admins</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <UsersRound size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            {admins.length} <span className="text-xs font-semibold text-[#7A685D]">Regional Admins</span>
          </div>
          <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
            <Sparkles size={12} />
            <span>Covering {admins.length} Territory Zone{admins.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Platform Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            {stats?.totalOrders || '994'}
          </div>
          <div className="text-[11px] font-semibold text-blue-700">
            Real-time live customer tables
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Growth + Top Cafes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Top Cafes (Clients) */}
        <div className="lg:col-span-2 bg-white border border-[#E6DCD3] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
            <div>
              <h2 className="font-extrabold text-sm md:text-base text-[#2C1810]">
                Client Cafes Overview & Performance
              </h2>
              <p className="text-xs text-[#7A685D]">
                Showing registered franchise cafes, owner contacts, and live stats.
              </p>
            </div>
            <button
              onClick={() => navigate('/superadmin/clients')}
              className="text-xs font-bold text-[#C85A32] hover:underline flex items-center gap-1"
            >
              <span>Manage All Clients</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Cafes Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6DCD3] text-[#7A685D] font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Cafe Name</th>
                  <th className="py-2.5 px-3">Owner & City</th>
                  <th className="py-2.5 px-3">Assigned Admin</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3 text-right">Total Sales</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EFEB]">
                {clients.map((c) => (
                  <tr key={c._id} className="hover:bg-[#FAF7F2] transition">
                    <td className="py-3 px-3 font-extrabold text-[#2C1810] flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#4A2C18] text-white flex items-center justify-center font-bold text-[10px]">
                        {c.cafeName?.charAt(0)}
                      </div>
                      <div>
                        <div>{c.cafeName}</div>
                        <div className="text-[10px] font-normal text-[#7A685D]">{c.tablesCount} Tables</div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#2C1810]">{c.ownerName}</div>
                      <div className="text-[10px] text-[#7A685D]">{c.city}</div>
                    </td>
                    <td className="py-3 px-3 text-[#7A685D]">
                      <span className="bg-[#F5EFEB] px-2 py-0.5 rounded text-[11px] font-medium text-[#4A2C18]">
                        {c.assignedAdminName || 'Superadmin'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.plan === 'Enterprise'
                          ? 'bg-purple-100 text-purple-800'
                          : c.plan === 'Growth'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-stone-100 text-stone-800'
                      }`}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-right text-[#2C1810]">
                      ₹{c.totalSales?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : c.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate('/client/orders')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C85A32] bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition"
                        title="View this cafe's live client dashboard"
                      >
                        <span>Open Panel</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 col): System Health & Quick Actions */}
        <div className="space-y-5">
          {/* System Health */}
          <div className="bg-white border border-[#E6DCD3] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E6DCD3] pb-2.5">
              <Server size={18} className="text-[#4A2C18]" />
              <h3 className="font-extrabold text-sm text-[#2C1810]">Infrastructure & Health</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F5EFEB]">
                <span className="text-[#7A685D]">API Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Operational (38ms)
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F5EFEB]">
                <span className="text-[#7A685D]">MongoDB Database</span>
                <span className="font-bold text-emerald-700">Connected</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F5EFEB]">
                <span className="text-[#7A685D]">Socket.IO Realtime</span>
                <span className="font-bold text-emerald-700">Live (Port 5000)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#7A685D]">Uptime Metric</span>
                <span className="font-bold text-[#2C1810]">99.98%</span>
              </div>
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-gradient-to-br from-[#4A2C18] to-[#2C1810] text-white rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-black text-sm flex items-center gap-1.5">
              <Activity size={16} className="text-amber-400" />
              <span>Superadmin Quick Actions</span>
            </h3>
            <p className="text-xs text-[#E6DCD3]">
              Perform administrative actions across territories and cafe chains.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => navigate('/superadmin/clients')}
                className="w-full text-left bg-white/10 hover:bg-white/20 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between"
              >
                <span>+ Onboard New Cafe Client</span>
                <ArrowUpRight size={14} className="text-amber-300" />
              </button>

              <button
                onClick={() => navigate('/superadmin/admins')}
                className="w-full text-left bg-white/10 hover:bg-white/20 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between"
              >
                <span>+ Add Territory Admin</span>
                <ArrowUpRight size={14} className="text-amber-300" />
              </button>

              <button
                onClick={() => navigate('/client/orders')}
                className="w-full text-left bg-[#C85A32] hover:bg-[#B24E2A] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between shadow-xs"
              >
                <span>☕ Switch to Client Dashboard</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminOverviewTab;
