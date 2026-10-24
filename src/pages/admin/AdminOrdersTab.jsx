import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Check,
  X,
  ChefHat,
  BellRing,
  RefreshCw,
  Clock,
  Eye,
  IndianRupee,
  ShoppingBag,
  SlidersHorizontal
} from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const AdminOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState(null);

  const fetchOrdersAndStats = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        api.get(`/admin/orders?status=${statusFilter === 'All' ? '' : statusFilter}&search=${search}`),
        api.get('/admin/dashboard')
      ]);

      if (ordersRes.data.success) setOrders(ordersRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndStats();
  }, [statusFilter]);

  // Live Socket.IO Updates
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_admin');

    socket.on('new_order', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      // Update quick stats
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalOrders: prev.totalOrders + 1,
              pendingOrders: prev.pendingOrders + 1,
              todayCount: prev.todayCount + 1,
              todaySales: prev.todaySales + newOrder.totalAmount
            }
          : prev
      );
    });

    socket.on('order_status_updated', (updated) => {
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      if (selectedOrder && selectedOrder._id === updated._id) {
        setSelectedOrder(updated);
      }
    });

    return () => {
      socket.off('new_order');
      socket.off('order_status_updated');
    };
  }, [selectedOrder]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.data : o)));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleOpenReject = (orderId) => {
    setRejectOrderId(orderId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const submitReject = async (e) => {
    e.preventDefault();
    if (!rejectOrderId) return;
    try {
      const res = await api.post(`/admin/orders/${rejectOrderId}/reject`, {
        reason: rejectReason || 'Kitchen unable to fulfill item at this moment'
      });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) => (o._id === rejectOrderId ? res.data.data : o)));
        setShowRejectModal(false);
        setRejectOrderId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order');
    }
  };

  const statuses = ['All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Served', 'Cancelled', 'Rejected'];

  const getStatusBadge = (status) => {
    const map = {
      Pending: 'bg-amber-100 text-amber-800 border-amber-200',
      Accepted: 'bg-blue-100 text-blue-800 border-blue-200',
      Preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      Ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Served: 'bg-stone-100 text-stone-800 border-stone-200',
      Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
      Rejected: 'bg-rose-100 text-rose-800 border-rose-200'
    };
    return map[status] || 'bg-stone-100 text-stone-800';
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#2C1810]">Live Orders Management</h2>
          <p className="text-xs text-[#7A685D] mt-0.5">
            Accept, update, prepare, and complete customer table orders in real-time.
          </p>
        </div>

        <button
          onClick={fetchOrdersAndStats}
          className="self-start sm:self-auto text-xs bg-white border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#4A2C18] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-2xs"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E6DCD3] shadow-2xs">
            <span className="text-xs text-[#7A685D] font-semibold">Today's Sales</span>
            <p className="text-xl font-extrabold text-[#C85A32] mt-1">₹{stats.todaySales}</p>
            <span className="text-[11px] text-[#7A685D]">{stats.todayCount} orders today</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6DCD3] shadow-2xs">
            <span className="text-xs text-amber-800 font-semibold">Pending Action</span>
            <p className="text-xl font-extrabold text-amber-700 mt-1">{stats.pendingOrders}</p>
            <span className="text-[11px] text-[#7A685D]">Requires acceptance</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6DCD3] shadow-2xs">
            <span className="text-xs text-purple-800 font-semibold">In Kitchen</span>
            <p className="text-xl font-extrabold text-purple-700 mt-1">{stats.preparingOrders}</p>
            <span className="text-[11px] text-[#7A685D]">Being prepared</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E6DCD3] shadow-2xs">
            <span className="text-xs text-emerald-800 font-semibold">Ready for Table</span>
            <p className="text-xl font-extrabold text-emerald-700 mt-1">{stats.readyOrders}</p>
            <span className="text-[11px] text-[#7A685D]">Waiting for service</span>
          </div>
        </div>
      )}

      {/* Filter Bar & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E6DCD3] space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A685D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrdersAndStats()}
              placeholder="Search by order #, table, or customer..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <button
            onClick={fetchOrdersAndStats}
            className="bg-[#4A2C18] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#2C1810] transition"
          >
            Search
          </button>
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-[#4A2C18] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Cards */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-[#4A2C18] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs text-[#7A685D]">Loading live orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DCD3]">
          <ShoppingBag size={40} className="mx-auto text-[#7A685D]/60 mb-2" />
          <h3 className="text-base font-bold text-[#2C1810]">No orders found</h3>
          <p className="text-xs text-[#7A685D] mt-1">There are no orders matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-[#E6DCD3] p-4 space-y-3.5 shadow-2xs hover:shadow-xs transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#F5EFEB] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-[#2C1810]">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs font-bold bg-[#FAF7F2] text-[#C85A32] border border-[#E6DCD3] px-2 py-0.5 rounded-md">
                      {order.tableNumber}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A685D] mt-1 flex items-center flex-wrap gap-1.5">
                    Guest: <strong className="text-[#2C1810]">{order.customerName}</strong> ({order.customerPhone})
                    {order.customerVisits > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🎖️ Visit #{order.customerVisits}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        ✨ 1st Visit
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getStatusBadge(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <p className="text-[10px] text-[#7A685D] mt-1">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 text-xs bg-[#FAF7F2] p-3 rounded-2xl border border-[#E6DCD3]/60">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[#2C1810]">
                    <span className="font-semibold">
                      {item.quantity} × {item.name}
                    </span>
                    <span className="font-mono text-xs">₹{item.subtotal}</span>
                  </div>
                ))}

                {order.specialInstructions && (
                  <div className="pt-1.5 mt-1 border-t border-[#E6DCD3] text-[11px] text-amber-800 font-medium">
                    Note: "{order.specialInstructions}"
                  </div>
                )}
              </div>

              {/* Total & Payment Method */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[#7A685D]">Bill Total: </span>
                  <span className="font-extrabold text-sm text-[#C85A32]">₹{order.totalAmount}</span>
                  <span className="text-[11px] text-[#7A685D] ml-2">
                    ({order.paymentMethod === 'counter_cash' ? 'Cash' : 'UPI'} -{' '}
                    <span className="font-semibold">{order.paymentStatus}</span>)
                  </span>
                </div>
              </div>

              {/* Kitchen Action Buttons */}
              <div className="pt-2 border-t border-[#F5EFEB] flex flex-wrap gap-2 text-xs">
                {order.orderStatus === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Accepted')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1"
                    >
                      <Check size={14} /> Accept Order
                    </button>
                    <button
                      onClick={() => handleOpenReject(order._id)}
                      className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold px-3 py-1.5 rounded-xl transition"
                    >
                      Reject
                    </button>
                  </>
                )}

                {order.orderStatus === 'Accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1.5"
                  >
                    <ChefHat size={14} /> Mark Preparing
                  </button>
                )}

                {order.orderStatus === 'Preparing' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Ready')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1.5"
                  >
                    <BellRing size={14} /> Mark Ready
                  </button>
                )}

                {order.orderStatus === 'Ready' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Served')}
                    className="bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold px-4 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1.5"
                  >
                    <Check size={14} /> Mark as Served & Paid
                  </button>
                )}

                {order.orderStatus === 'Served' && (
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                    <Check size={14} /> Completed & Served
                  </span>
                )}

                {(order.orderStatus === 'Cancelled' || order.orderStatus === 'Rejected') && (
                  <span className="text-rose-600 font-medium text-xs">
                    {order.cancellationReason || 'Order was cancelled'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-[#2C1810]">Reject Order</h3>
            <p className="text-xs text-[#7A685D]">
              Provide a reason so the customer can be notified accurately.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Ingredients sold out / Kitchen closing"
              className="w-full text-xs p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
            />
            <div className="flex gap-2">
              <button
                onClick={submitReject}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs transition"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 text-xs text-[#7A685D] border border-[#E6DCD3] rounded-xl hover:bg-[#FAF7F2]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersTab;
