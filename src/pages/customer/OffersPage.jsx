import React, { useEffect, useState, useCallback } from 'react';
import {
  Tag,
  Sparkles,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  Gift,
  RefreshCw,
  Award,
  Coffee,
  Pizza,
  Utensils,
  Crown,
  ShieldCheck,
  Lock,
  X,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import LoyaltyRewardHero from '../../components/LoyaltyRewardHero';

const DEFAULT_FALLBACK_MILESTONES = [
  {
    visitNumber: 1,
    title: '10% OFF Welcome Feast',
    productName: '10% OFF All Cafe Favorites',
    discountType: 'percentage',
    discountValue: 10,
    couponCode: 'PRIME10',
    image: '/assets/welcome_discount.jpg',
    description: 'Enjoy a flat 10% discount across our entire cafe menu on your 1st order!',
    perkHighlight: 'Instant 10% OFF on Pizza, Burgers, Fries & Drinks'
  },
  {
    visitNumber: 3,
    title: 'Free Artisan Coffee',
    productName: 'Artisan Hot Brewed Cappuccino',
    discountType: 'fixed',
    discountValue: 120,
    couponCode: 'FREECOFFEE',
    image: '/assets/cappuccino.jpg',
    description: 'Complimentary rich handcrafted espresso with steamed milk & frothy crema on your 3rd order!',
    perkHighlight: '100% Free Artisan Coffee with zero minimum order'
  },
  {
    visitNumber: 5,
    title: 'Free Gourmet Fried Rice',
    productName: 'Wok-Tossed Gourmet Fried Rice',
    discountType: 'fixed',
    discountValue: 160,
    couponCode: 'FREEFRIEDRICE',
    image: '/assets/fried_rice.jpg',
    description: 'Complimentary sizzling wok-tossed fried rice with farm-fresh veggies & aromatic seasonings on your 5th order!',
    perkHighlight: '100% Free Fried Rice Plate with zero minimum order'
  }
];

const getMilestoneIcon = (visitNum) => {
  if (visitNum <= 1) return Gift;
  if (visitNum <= 3) return Coffee;
  if (visitNum <= 5) return Utensils;
  if (visitNum <= 7) return Pizza;
  return Crown;
};

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const { applyCouponCode } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [applyMessage, setApplyMessage] = useState({ text: '', isError: false });
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Dynamic check-in milestones from backend API
  const [dynamicMilestones, setDynamicMilestones] = useState(DEFAULT_FALLBACK_MILESTONES);

  // Check-in tracking state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch active seasonal offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/offers');
        if (res.data?.success) {
          setOffers(res.data.data);
        }
      } catch (err) {
        setError('Failed to load active offers. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  // Fetch dynamic check-in milestones from backend API
  const fetchCheckInMilestones = useCallback(async () => {
    try {
      const res = await api.get('/offers/checkin-milestones');
      if (res.data?.success && res.data.data?.length > 0) {
        setDynamicMilestones(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dynamic check-in milestones:', err);
    }
  }, []);

  useEffect(() => {
    fetchCheckInMilestones();
  }, [fetchCheckInMilestones]);

  // Fetch customer orders for check-in calculation
  const fetchMyOrders = useCallback(async (isManualRefresh = false) => {
    if (!isAuthenticated) return;
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoadingOrders(true);

      const [ordersRes] = await Promise.all([
        api.get('/orders/my'),
        fetchCheckInMilestones()
      ]);

      if (ordersRes.data?.success) {
        setOrders(ordersRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch check-in visit history:', err);
    } finally {
      setLoadingOrders(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, fetchCheckInMilestones]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  // Calculate completed visits based on paid or served orders
  const paidOrders = orders.filter(
    (o) =>
      o.paymentStatus?.toLowerCase() === 'paid' ||
      o.orderStatus === 'Served' ||
      o.orderStatus === 'Ready'
  );
  const checkInCount = paidOrders.length;

  const currentVisitNumbers = [1, 2, 3, 4, 5];

  const getMilestoneDate = (visitNum) => {
    const order = paidOrders[visitNum - 1];
    if (order && order.createdAt) {
      const d = new Date(order.createdAt);
      return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }
    const baseDate = new Date();
    const diffDays = (visitNum - Math.max(1, Math.min(checkInCount, 5))) * 6;
    const calcDate = new Date(baseDate.getTime() + diffDays * 24 * 60 * 60 * 1000);
    return calcDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const handleApplyOffer = async (code) => {
    const res = await applyCouponCode(code);
    setApplyMessage({
      text: res.message,
      isError: !res.success
    });
    if (res.success) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
    setTimeout(() => setApplyMessage({ text: '', isError: false }), 4500);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A2C18] to-[#2C1810] text-[#FAF7F2] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#C85A32] text-white mb-2">
            <Sparkles size={12} /> Cafe Rewards & Milestone Offers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Check-In Rewards & Promo Offers
          </h2>
          <p className="text-xs sm:text-sm text-[#E6DCD3] mt-2 leading-relaxed">
            Order food, complete your payments, and automatically collect check-in stamps to unlock
            exclusive cafe rewards and discounts!
          </p>
        </div>
      </div>

      {applyMessage.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between ${
            applyMessage.isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{applyMessage.text}</span>
          <Link to="/order" className="font-bold underline text-xs ml-2">
            Go to Cart →
          </Link>
        </div>
      )}

      {/* ========================================================= */}
      {/* CUSTOMER VISIT CHECK-IN TIMELINE (MATCHING IMAGE 2) */}
      {/* ========================================================= */}
      <LoyaltyRewardHero />


      {/* ========================================================= */}
      {/* SEASONAL & GENERAL CAFE PROMO OFFERS */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-[#2C1810]">Active Seasonal Offers</h3>
            <p className="text-xs text-[#7A685D]">
              Special discounts and limited-time promotional deals
            </p>
          </div>
          <span className="text-xs font-bold text-[#C85A32] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#E6DCD3]">
            {offers.length} Deal{offers.length !== 1 ? 's' : ''} Available
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs text-[#7A685D]">Loading special cafe treats...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-12 text-center bg-[#F5EFEB] rounded-3xl border border-[#E6DCD3]">
            <Tag size={40} className="mx-auto text-[#7A685D] mb-2" />
            <h3 className="text-base font-bold text-[#2C1810]">No Active Offers</h3>
            <p className="text-xs text-[#7A685D] mt-1">Check back soon for fresh deals and discounts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white rounded-3xl border border-[#E6DCD3] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {offer.image && (
                    <div className="h-44 w-full overflow-hidden relative">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#C85A32] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                        {offer.discountType === 'percentage'
                          ? `${offer.discountValue}% OFF`
                          : `₹${offer.discountValue} FLAT OFF`}
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="font-bold text-base text-[#2C1810]">{offer.title}</h3>
                    <p className="text-xs text-[#7A685D] mt-1.5 leading-relaxed">{offer.description}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[#7A685D]">
                      {offer.minimumOrderAmount > 0 && (
                        <span className="bg-[#FAF7F2] border border-[#E6DCD3] px-2.5 py-1 rounded-lg font-semibold">
                          Min Order: ₹{offer.minimumOrderAmount}
                        </span>
                      )}
                      {offer.endDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-[#C85A32]" />
                          Valid till {new Date(offer.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {offer.couponCode && (
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-[#F5EFEB] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 bg-[#FAF7F2] border border-dashed border-[#C85A32] rounded-xl px-3 py-1.5">
                        <span className="font-mono font-extrabold text-xs text-[#C85A32] tracking-wider">
                          {offer.couponCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(offer.couponCode)}
                          className="text-[#7A685D] hover:text-[#2C1810] transition p-0.5"
                          title="Copy code"
                        >
                          {copiedCode === offer.couponCode ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => handleApplyOffer(offer.couponCode)}
                        className="text-xs bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold px-4 py-2 rounded-xl transition shadow-xs"
                      >
                        Apply Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DEDICATED PRODUCT PREVIEW & CLAIM MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative w-full max-w-md max-h-[92dvh] flex flex-col bg-gradient-to-b from-[#23150D] via-[#1A0E08] to-[#100905] border-2 border-amber-500/50 text-[#FAF7F2] rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black/95 text-white/80 hover:text-white border border-white/20 flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer shadow-lg active:scale-90"
              title="Close Preview"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Product Image Banner */}
            {selectedProduct.image && (
              <div className="relative w-full h-40 sm:h-52 md:h-60 overflow-hidden bg-black/60 shrink-0">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.productName || selectedProduct.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#23150D] via-transparent to-black/40 pointer-events-none" />

                <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500 text-neutral-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.9)] flex items-center gap-1">
                    <Sparkles size={11} className="sm:w-[13px] sm:h-[13px] fill-neutral-950" />
                    <span>Order #{selectedProduct.visitNumber} Reward</span>
                  </span>
                </div>
              </div>
            )}

            {/* Product Information Body (Scrollable for mobile screens) */}
            <div className="p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-amber-400 uppercase tracking-widest">
                  <Award size={13} className="sm:w-[15px] sm:h-[15px]" />
                  <span>Customer Visit #{selectedProduct.visitNumber} Milestone</span>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-white mt-0.5 sm:mt-1 tracking-tight">
                  {selectedProduct.productName || selectedProduct.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  {selectedProduct.description}
                </p>
                {selectedProduct.perkHighlight && (
                  <p className="text-[11px] sm:text-xs font-bold text-amber-300/90 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="sm:w-[15px] sm:h-[15px] text-emerald-400 shrink-0" />
                    <span>{selectedProduct.perkHighlight}</span>
                  </p>
                )}
              </div>

              {/* Promo Code Box: Unlocked vs Locked */}
              {selectedProduct.couponCode && (
                checkInCount >= selectedProduct.visitNumber ? (
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/50 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-inner">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">
                        Promo Coupon Code
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-sm sm:text-base md:text-lg font-black text-amber-300 tracking-wider">
                          {selectedProduct.couponCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(selectedProduct.couponCode)}
                          className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
                          title="Copy code"
                        >
                          {copiedCode === selectedProduct.couponCode ? (
                            <Check size={14} className="sm:w-4 sm:h-4 text-emerald-400" />
                          ) : (
                            <Copy size={14} className="sm:w-4 sm:h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleApplyOffer(selectedProduct.couponCode)}
                        className="w-full sm:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                      >
                        <Sparkles size={13} className="sm:w-[14px] sm:h-[14px] stroke-[2.5]" />
                        <span>Claim & Apply</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-950/70 border border-amber-500/50 space-y-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-amber-300 font-extrabold text-xs sm:text-sm">
                      <AlertTriangle size={15} className="sm:w-[17px] sm:h-[17px] text-amber-400 shrink-0 animate-pulse" />
                      <span>first complete your order then claim offer</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed">
                      Yeh reward claim karne ke liye pehle Order #{selectedProduct.visitNumber} complete karein. Aapka live progress: {Math.min(checkInCount, 5)}/5 orders.
                    </p>
                    <div className="pt-0.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                      <span className="font-mono text-[11px] sm:text-xs text-neutral-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-center sm:text-left">
                        Code: ••••••••• (Locked)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setApplyMessage({
                            text: 'first complete your order then claim offer',
                            isError: true
                          });
                          setTimeout(() => setApplyMessage({ text: '', isError: false }), 4500);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Lock size={12} className="text-amber-400" />
                        <span>Claim Offer</span>
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* Action Buttons: Order Now & Close */}
              <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <Link
                  to="/order"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-xs sm:text-sm text-center shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span>
                    {checkInCount >= selectedProduct.visitNumber
                      ? 'Order Now & Enjoy'
                      : 'Complete Order to Unlock →'}
                  </span>
                  <ArrowRight size={14} className="sm:w-4 sm:h-4 stroke-[3]" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white font-bold text-xs transition cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersPage;
