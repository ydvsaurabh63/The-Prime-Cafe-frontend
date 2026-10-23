import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  TrendingUp,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  BellRing
} from 'lucide-react';
import { fetchClientsApi, getStoredClients } from '../../services/superAdminData';

const AdminPortalOverviewTab = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState(getStoredClients());
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchClientsApi();
      if (data && Array.isArray(data)) {
        const clean = data.filter(
          (c) => !['Urban Chai Lounge', 'Roast & Toast Bistro', 'Mocha Express'].includes(c.cafeName)
        );
        setClients(clean);
      }
    } catch (e) {
      console.error('Error fetching admin portal clients:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalSales = clients.reduce((acc, c) => acc + (c.totalSales || 0), 0);
  const totalOrders = clients.reduce((acc, c) => acc + (c.totalOrders || 0), 0);
  const activeCount = clients.filter(c => c.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#2C1810] tracking-tight">
              Admin Regional Overview
            </h1>
            <span className="bg-[#FAF7F2] text-[#4A2C18] border border-[#E6DCD3] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#C85A32]" /> Regional Admin
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#7A685D] mt-0.5">
            Monitor client cafe operations, daily branch turnover, and customer orders.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#2C1810] rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Assigned Cafes</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#C85A32] flex items-center justify-center font-bold">
              <Store size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">{clients.length}</div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 size={12} />
            <span>{activeCount} Active Branches</span>
          </div>
        </div>

        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Territory Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <ArrowUpRight size={14} />
            <span>+14.2% healthy growth</span>
          </div>
        </div>

        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Orders Processed</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">{totalOrders}</div>
          <div className="text-[11px] font-semibold text-blue-700">
            Across managed tables
          </div>
        </div>

        <div className="bg-white border border-[#E6DCD3] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A685D] uppercase tracking-wider">Active Tables</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <BellRing size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#2C1810]">
            {clients.reduce((acc, c) => acc + (c.tablesCount || 0), 0)}
          </div>
          <div className="text-[11px] font-semibold text-purple-700">
            QR enabled tables
          </div>
        </div>
      </div>

      {/* Managed Cafes List Preview */}
      <div className="bg-white border border-[#E6DCD3] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
          <div>
            <h2 className="font-extrabold text-sm md:text-base text-[#2C1810]">
              My Managed Cafe Clients
            </h2>
            <p className="text-xs text-[#7A685D]">
              Click on any cafe to launch its live management dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/clients')}
            className="text-xs font-bold text-[#C85A32] hover:underline flex items-center gap-1"
          >
            <span>Go to Manage Client</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((c) => (
            <div
              key={c._id}
              className="border border-[#E6DCD3] bg-[#FAF7F2] p-4 rounded-xl flex items-center justify-between hover:border-[#C85A32] transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A2C18] text-white flex items-center justify-center font-black text-sm">
                  {c.cafeName?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#2C1810] group-hover:text-[#C85A32] transition">
                    {c.cafeName}
                  </h3>
                  <p className="text-[10px] text-[#7A685D]">{c.ownerName} • {c.city}</p>
                  <p className="text-[10px] font-semibold text-[#4A2C18] mt-0.5">
                    {c.tablesCount} Tables • ₹{c.totalSales?.toLocaleString('en-IN')} Sales
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {c.status}
                </span>

                <button
                  onClick={() => navigate('/client/orders')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C85A32] bg-white hover:bg-orange-50 border border-[#E6DCD3] px-2 py-1 rounded-lg transition shadow-2xs"
                >
                  <span>Open Cafe</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPortalOverviewTab;
