import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  MessageCircle,
  MapPin,
  Utensils,
  RefreshCw,
  Clock,
  Download,
  Calendar,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Award,
  QrCode
} from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const AdminCustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    todayNew: 0,
    veg: 0,
    nonVeg: 0,
    both: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [foodFilter, setFoodFilter] = useState('All'); // 'All' | 'Veg' | 'Non Veg' | 'Both'
  const [todayOnly, setTodayOnly] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/customers?search=${encodeURIComponent(search)}&foodPreference=${foodFilter}&todayOnly=${todayOnly}`
      );
      if (res.data?.success) {
        setCustomers(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [foodFilter, todayOnly]);

  // Real-Time Live WebSocket Updates
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_admin');

    const handleNewCustomer = (newCust) => {
      // Highlight incoming customer with animation
      setNewlyAddedId(newCust._id);
      setTimeout(() => setNewlyAddedId(null), 5000);

      setCustomers((prev) => [newCust, ...prev.filter((c) => c._id !== newCust._id)]);

      // Dynamically update KPI stats
      setStats((prev) => ({
        ...prev,
        total: (prev.total || 0) + 1,
        todayNew: (prev.todayNew || 0) + 1,
        veg: (prev.veg || 0) + (newCust.foodPreference === 'Veg' ? 1 : 0),
        nonVeg: (prev.nonVeg || 0) + (newCust.foodPreference === 'Non Veg' ? 1 : 0),
        both: (prev.both || 0) + (newCust.foodPreference === 'Both' ? 1 : 0)
      }));
    };

    socket.on('new_customer', handleNewCustomer);

    return () => {
      socket.off('new_customer', handleNewCustomer);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  // Export Customer Leads to CSV for marketing / WhatsApp campaigns
  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Name', 'Phone', 'Area', 'City', 'Pincode', 'Food Preference', 'Table', 'Visits', 'Registered At'];
    const rows = customers.map((c) => [
      `"${c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.area || ''}"`,
      `"${c.city || ''}"`,
      `"${c.pincode || ''}"`,
      `"${c.foodPreference || 'Both'}"`,
      `"${c.scannedTable || 'General'}"`,
      `"${c.visitCount || 1}"`,
      `"${new Date(c.createdAt).toLocaleString('en-IN')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `the-prime-cafe-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#2C1810] tracking-tight">
              Customer Leads & QR Check-Ins
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live WebSocket
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A685D] mt-0.5">
            Real-time customer data captured when guests scan stand card QRs and enter the cafe.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={customers.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2C1810] hover:bg-[#1A0E08] text-white rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            title="Download CSV for WhatsApp Marketing"
          >
            <Download size={13} />
            <span>Export Leads</span>
          </button>

          <button
            type="button"
            onClick={fetchCustomers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#FAF7F2] text-[#2C1810] border border-[#E6DCD3] rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Registered Guests */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A685D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Guests</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#2C1810]">
              {stats.total || customers.length}
            </span>
            <span className="text-xs text-[#7A685D] font-bold">registered</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Captured via QR Scans
          </p>
        </div>

        {/* Today's New QR Scans */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A685D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Check-Ins</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700">
              {stats.todayNew}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 font-bold mt-1">
            Guests checked in today
          </p>
        </div>

        {/* Veg Diners */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A685D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Veg Diners</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {stats.veg}
            </span>
            <span className="text-xs text-[#7A685D]">
              ({stats.total > 0 ? Math.round((stats.veg / stats.total) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            Pure vegetarian preference
          </p>
        </div>

        {/* Non-Veg & Both */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7A685D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Non-Veg & Both</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-rose-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#2C1810]">
              {(stats.nonVeg || 0) + (stats.both || 0)}
            </span>
            <span className="text-xs text-[#7A685D]">
              ({stats.total > 0 ? Math.round((((stats.nonVeg || 0) + (stats.both || 0)) / stats.total) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-[#7A685D] font-medium mt-1">
            Non-Veg / All food options
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A685D]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone number, area, or table..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] rounded-xl text-xs text-[#2C1810] placeholder-[#A8988D] border border-transparent focus:border-[#C85A32] focus:bg-white focus:outline-hidden transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2C1810] hover:bg-[#1A0E08] text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#F5EFEB]">
          <span className="text-[11px] font-bold text-[#7A685D] mr-1 flex items-center gap-1">
            <Filter size={12} /> Dietary:
          </span>
          {['All', 'Veg', 'Non Veg', 'Both'].map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => setFoodFilter(pref)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                foodFilter === pref
                  ? 'bg-[#C85A32] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB] border border-[#E6DCD3]'
              }`}
            >
              {pref}
            </button>
          ))}

          <div className="h-4 w-px bg-[#E6DCD3] mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() => setTodayOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              todayOnly
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB] border border-[#E6DCD3]'
            }`}
          >
            <Calendar size={12} />
            <span>Today's Check-Ins Only</span>
          </button>
        </div>
      </div>

      {/* 4. Customer Cards Grid */}
      <div className="space-y-3">
        {loading && customers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E6DCD3] space-y-3">
            <div className="w-8 h-8 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#7A685D]">Loading customer check-ins...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E6DCD3] space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0E6] text-[#C85A32] flex items-center justify-center mx-auto">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-sm text-[#2C1810]">No customer records found</h3>
            <p className="text-xs text-[#7A685D] max-w-sm mx-auto">
              When customers scan the stand card QR and submit their details, they will dynamically appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {customers.map((cust) => {
              const isNew = cust._id === newlyAddedId;
              const formattedDate = cust.createdAt
                ? new Date(cust.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Just now';

              return (
                <div
                  key={cust._id}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                    isNew
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-[1.01] bg-amber-50/20'
                      : 'border-[#E6DCD3] hover:border-[#C85A32]/40 shadow-xs'
                  }`}
                >
                  {/* Top: Avatar, Name, Scanned Table & Visits */}
                  <div>
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FAF0E6] to-[#F5EFEB] border border-[#E6DCD3] text-[#4A2C18] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          {cust.name ? cust.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-sm text-[#2C1810]">
                              {cust.name}
                            </h4>
                            {isNew && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#7A685D] font-mono mt-0.5 flex items-center gap-1">
                            <Phone size={10} /> +91 {cust.phone}
                          </p>
                        </div>
                      </div>

                      {/* Dietary Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 flex items-center gap-1 ${
                          cust.foodPreference === 'Veg'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : cust.foodPreference === 'Non Veg'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cust.foodPreference === 'Veg'
                              ? 'bg-emerald-600'
                              : cust.foodPreference === 'Non Veg'
                              ? 'bg-rose-600'
                              : 'bg-amber-600'
                          }`}
                        />
                        {cust.foodPreference || 'Both'}
                      </span>
                    </div>

                    {/* Scanned Table & Locality Info */}
                    <div className="mt-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#F5EFEB] space-y-1.5 text-xs text-[#4A3B32]">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#7A685D] flex items-center gap-1 font-semibold">
                          <QrCode size={11} className="text-[#C85A32]" /> Scanned QR:
                        </span>
                        <span className="font-bold text-[#2C1810] bg-white px-2 py-0.5 rounded border border-[#E6DCD3] text-[11px]">
                          {cust.scannedTable || 'Universal Stand'}
                        </span>
                      </div>

                      {(cust.area || cust.city) && (
                        <div className="flex items-center justify-between pt-1 border-t border-[#E6DCD3]/60">
                          <span className="text-[11px] text-[#7A685D] flex items-center gap-1">
                            <MapPin size={11} /> Location:
                          </span>
                          <span className="font-medium text-[#2C1810] truncate max-w-[170px] text-[11px]">
                            {[cust.area, cust.city, cust.pincode].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-[#E6DCD3]/60">
                        <span className="text-[11px] text-[#7A685D] flex items-center gap-1">
                          <ShoppingBag size={11} /> Orders:
                        </span>
                        <span className="font-bold text-[#2C1810] text-[11px]">
                          {cust.totalOrders || 0} orders {cust.totalSpent > 0 ? `(₹${cust.totalSpent})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Date & Quick Actions (WhatsApp / Call) */}
                  <div className="pt-2 border-t border-[#F5EFEB] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#A8988D] flex items-center gap-1">
                      <Clock size={10} /> {formattedDate}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/91${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${cust.name}! Thank you for visiting The Prime Cafe. Here is a special treat for your next visit! ☕`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={11} />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${cust.phone}`}
                        className="p-1 rounded-lg border border-[#E6DCD3] hover:bg-[#FAF7F2] text-[#4A2C18] transition"
                        title="Call Customer"
                      >
                        <Phone size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomersTab;
