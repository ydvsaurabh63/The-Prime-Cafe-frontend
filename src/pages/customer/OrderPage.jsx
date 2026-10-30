import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import { getSocket } from '../../services/socket';
import { getItemFallbackImage } from '../../utils/imageFallback';

const DEFAULT_DISH_FALLBACK = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80';

const OrderPage = () => {
  const {
    cartItems,
    table,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    tax,
    total,
    appliedCoupon,
    applyCouponCode,
    removeCoupon
  } = useCart();

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'history'
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', isError: false });
  const [paymentMethod, setPaymentMethod] = useState('counter_upi');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Order history
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchMyOrders = async () => {
    if (!isAuthenticated) return;
    try {
      setHistoryLoading(true);
      const res = await api.get('/orders/my');
      if (res.data.success) {
        setOrdersHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch order history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyOrders();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const socket = getSocket();
    socket.emit('join_user', user._id || user.id);

    socket.on('order_status_updated', (updatedOrder) => {
      setOrdersHistory((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
      if (orderSuccess && orderSuccess._id === updatedOrder._id) {
        setOrderSuccess(updatedOrder);
      }
    });

    return () => {
      socket.off('order_status_updated');
    };
  }, [isAuthenticated, user, orderSuccess]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCouponCode(couponInput.trim());
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
    setTimeout(() => setCouponMsg({ text: '', isError: false }), 4000);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/order');
      return;
    }

    if (cartItems.length === 0) return;

    try {
      setIsSubmitting(true);
      const payload = {
        items: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity
        })),
        tableIdentifier: table?.number || '01',
        couponCode: appliedCoupon?.code || '',
        paymentMethod,
        specialInstructions: instructions
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        setOrderSuccess(res.data.data);
        clearCart();
        fetchMyOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.post(`/orders/${orderId}/cancel`, {
        reason: 'Customer initiated cancellation'
      });
      if (res.data.success) {
        fetchMyOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Switcher */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 max-w-md w-full bg-[#F5EFEB] p-1 rounded-2xl border border-[#E6DCD3]">
          <button
            onClick={() => setActiveTab('cart')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'cart'
                ? 'bg-white text-[#2C1810] shadow-xs'
                : 'text-[#7A685D] hover:text-[#2C1810]'
            }`}
          >
            My Cart {cartItems.length > 0 && `(${cartItems.length})`}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-white text-[#2C1810] shadow-xs'
                : 'text-[#7A685D] hover:text-[#2C1810]'
            }`}
          >
            My Orders Tracker
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {orderSuccess && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-emerald-900 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={22} className="text-emerald-600" />
            <h3 className="font-extrabold text-sm sm:text-base">Order Placed Successfully!</h3>
          </div>
          <p className="text-xs sm:text-sm text-emerald-800">
            Order #{orderSuccess.orderNumber} is now{' '}
            <span className="font-extrabold underline">{orderSuccess.orderStatus}</span>. Payment: Pay at
            Counter.
          </p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => {
                setActiveTab('history');
                setOrderSuccess(null);
              }}
              className="text-xs font-bold bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-2xs hover:bg-emerald-800 transition"
            >
              Track in Order History
            </button>
            <button
              onClick={() => setOrderSuccess(null)}
              className="text-xs text-emerald-700 font-semibold px-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ---------------- CART VIEW ---------------- */}
      {activeTab === 'cart' && (
        <div>
          {cartItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DCD3] space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto shadow-md ring-2 ring-[#C85A32]/30 bg-black flex items-center justify-center">
                <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-[#2C1810]">Your Cart is Empty</h3>
              <p className="text-xs text-[#7A685D] max-w-xs mx-auto leading-relaxed">
                Explore our artisanal cuisine and handcrafted bites to add items to your order.
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-bold px-5 py-3 rounded-2xl transition shadow-xs"
              >
                Explore Menu <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Items list */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E6DCD3] flex items-center justify-between text-xs">
                  <span className="text-[#7A685D] font-medium">
                    Order Type: <strong className="text-[#2C1810] font-extrabold">Dine-In Cafe Order</strong>
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Trash2 size={14} /> Clear Cart
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E6DCD3] divide-y divide-[#F5EFEB] space-y-1">
                  <h4 className="text-xs font-bold text-[#7A685D] uppercase tracking-wider mb-3">
                    Selected Dishes & Beverages
                  </h4>
                  {cartItems.map((item) => {
                    const itemImg = item.image || getItemFallbackImage(item);

                    return (
                      <div
                        key={item._id}
                        className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1 gap-3 sm:gap-4"
                      >
                        {/* Dish Image Thumbnail */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E6DCD3] shrink-0 shadow-2xs">
                          <img
                            src={itemImg}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getItemFallbackImage(item);
                            }}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Dish Details */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                              title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                            />
                            <h5 className="font-bold text-sm text-[#2C1810] truncate">{item.name}</h5>
                          </div>
                          <p className="text-xs text-[#7A685D] mt-0.5">₹{item.price} each</p>
                        </div>

                        {/* Quantity Controller & Price */}
                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                          <div className="flex items-center gap-2.5 sm:gap-3 bg-[#F5EFEB] border border-[#E6DCD3] rounded-xl px-2.5 py-1 text-xs font-bold text-[#4A2C18]">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, -1)}
                              className="hover:text-[#C85A32] p-0.5 transition active:scale-90"
                              title="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-4 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, 1)}
                              className="hover:text-[#C85A32] p-0.5 transition active:scale-90"
                              title="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <span className="font-extrabold text-sm text-[#2C1810] min-w-[60px] text-right">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Special Instructions */}
                <div className="bg-white p-5 rounded-3xl border border-[#E6DCD3]">
                  <label className="block text-xs font-bold text-[#4A2C18] mb-1.5">
                    Kitchen Notes / Dietary Preferences (Optional)
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Less sugar for coffee, extra oregano, serve fries hot..."
                    className="w-full text-xs sm:text-sm p-3 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Right Column: Bill summary & checkout */}
              <div className="space-y-4">
                {/* Coupon Code */}
                <div className="bg-white p-5 rounded-3xl border border-[#E6DCD3] space-y-2">
                  <label className="block text-xs font-bold text-[#4A2C18]">
                    Promo / Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-2xl text-xs text-emerald-800">
                      <span className="font-semibold">
                        Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{discount})
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. PRIME20"
                        className="flex-1 uppercase text-xs p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32] font-mono"
                      />
                      <button
                        type="submit"
                        className="bg-[#4A2C18] hover:bg-[#2C1810] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponMsg.text && (
                    <p
                      className={`text-[11px] font-medium ${
                        couponMsg.isError ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                {/* Payment Selection */}
                <div className="bg-white p-5 rounded-3xl border border-[#E6DCD3] space-y-2.5 text-xs">
                  <label className="block font-bold text-[#4A2C18]">Payment Option</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('counter_upi')}
                      className={`p-3 rounded-2xl border text-center transition ${
                        paymentMethod === 'counter_upi'
                          ? 'border-[#C85A32] bg-[#FAF7F2] font-bold text-[#C85A32]'
                          : 'border-[#E6DCD3] text-[#7A685D]'
                      }`}
                    >
                      UPI at Counter
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('counter_cash')}
                      className={`p-3 rounded-2xl border text-center transition ${
                        paymentMethod === 'counter_cash'
                          ? 'border-[#C85A32] bg-[#FAF7F2] font-bold text-[#C85A32]'
                          : 'border-[#E6DCD3] text-[#7A685D]'
                      }`}
                    >
                      Cash at Counter
                    </button>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-white p-5 rounded-3xl border border-[#E6DCD3] space-y-3 text-xs sm:text-sm">
                  <h4 className="font-bold text-[#7A685D] uppercase tracking-wider text-xs">
                    Bill Calculation
                  </h4>
                  <div className="flex justify-between text-[#7A685D]">
                    <span>Item Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#7A685D]">
                    <span>Taxes (5% Cafe GST)</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="pt-3 border-t border-[#F5EFEB] flex justify-between font-extrabold text-base text-[#2C1810]">
                    <span>Grand Total</span>
                    <span className="text-[#C85A32]">₹{total}</span>
                  </div>

                  {/* Checkout Button */}
                  {isAuthenticated ? (
                    <button
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className="w-full bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm mt-3"
                    >
                      {isSubmitting ? (
                        'Transmitting to Kitchen...'
                      ) : (
                        <>
                          Place Order • ₹{total} <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="pt-2 text-center space-y-2">
                      <p className="text-[11px] text-[#7A685D]">
                        Please sign in so kitchen staff can link your order.
                      </p>
                      <Link
                        to="/login?redirect=/order"
                        className="block w-full bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold py-3 rounded-2xl text-xs transition"
                      >
                        Sign In to Place Order
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- ORDER HISTORY VIEW ---------------- */}
      {activeTab === 'history' && (
        <div className="max-w-3xl mx-auto space-y-4">
          {!isAuthenticated ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DCD3] space-y-3">
              <AlertCircle size={36} className="mx-auto text-[#7A685D]" />
              <p className="text-sm font-bold text-[#2C1810]">Please sign in to view your orders</p>
              <Link
                to="/login"
                className="inline-block mt-2 bg-[#C85A32] text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-xs"
              >
                Sign In Now
              </Link>
            </div>
          ) : historyLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-9 h-9 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-xs text-[#7A685D]">Fetching orders...</p>
            </div>
          ) : ordersHistory.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DCD3]">
              <Clock size={36} className="mx-auto text-[#7A685D] mb-2" />
              <p className="text-sm font-bold text-[#2C1810]">No orders placed yet</p>
              <p className="text-xs text-[#7A685D] mt-1">
                Your past and active cafe orders will appear here in real-time.
              </p>
            </div>
          ) : (
            ordersHistory.map((order) => {
              const statusColors = {
                Pending: 'bg-amber-100 text-amber-800 border-amber-200',
                Accepted: 'bg-blue-100 text-blue-800 border-blue-200',
                Preparing: 'bg-purple-100 text-purple-800 border-purple-200',
                Ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                Served: 'bg-stone-100 text-stone-800 border-stone-200',
                Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
                Rejected: 'bg-rose-100 text-rose-800 border-rose-200'
              };

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-[#E6DCD3] p-5 space-y-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-3">
                    <div>
                      <span className="font-mono font-extrabold text-sm text-[#4A2C18]">
                        #{order.orderNumber}
                      </span>
                      <p className="text-xs text-[#7A685D] mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        statusColors[order.orderStatus] || 'bg-stone-100'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[#2C1810] gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.image || getItemFallbackImage(item)}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getItemFallbackImage(item);
                            }}
                            className="w-8 h-8 rounded-lg object-cover border border-[#E6DCD3] shrink-0"
                            loading="lazy"
                          />
                          <span className="truncate">
                            <strong className="text-[#C85A32]">{item.quantity}×</strong> {item.name}
                          </span>
                        </div>
                        <span className="text-[#7A685D] font-mono shrink-0">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#F5EFEB] flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <span className="text-[#7A685D]">Total: </span>
                      <span className="font-extrabold text-[#C85A32]">₹{order.totalAmount}</span>
                      <span className="text-xs text-[#7A685D] ml-2">
                        ({order.paymentMethod === 'counter_cash' ? 'Cash' : 'UPI'} -{' '}
                        {order.paymentStatus})
                      </span>
                    </div>

                    {order.orderStatus === 'Pending' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default OrderPage;
