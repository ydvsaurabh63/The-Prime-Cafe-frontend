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
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const DEFAULT_FALLBACK_MILESTONES = [
  {
    visitNumber: 1,
    title: 'Welcome Treat',
    discountType: 'percentage',
    discountValue: 10,
    couponCode: 'PRIME10'
  },
  {
    visitNumber: 3,
    title: 'Coffee Perk',
    discountType: 'percentage',
    discountValue: 15,
    couponCode: 'VISIT3COFFEE'
  },
  {
    visitNumber: 5,
    title: 'Foodie Treat',
    discountType: 'percentage',
    discountValue: 25,
    couponCode: 'MEGA5BURGER'
  },
  {
    visitNumber: 7,
    title: 'Pizza Feast',
    discountType: 'fixed',
    discountValue: 200,
    couponCode: 'GOLD7PIZZA'
  },
  {
    visitNumber: 10,
    title: 'VIP Royalty',
    discountType: 'percentage',
    discountValue: 30,
    couponCode: 'VIP10FEAST'
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
  const { isAuthenticated } = useAuth();
  const [applyMessage, setApplyMessage] = useState({ text: '', isError: false });

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
      {/* CUSTOMER VISIT CHECK-IN STAMPS (DYNAMICALLY CONNECTED) */}
      {/* ========================================================= */}
      <section className="bg-white rounded-3xl border border-[#E6DCD3] p-5 sm:p-7 shadow-xs space-y-5">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5EFEB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FAF7F2] text-[#C85A32] border border-[#E6DCD3]">
                <Award size={20} />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#2C1810]">
                  Customer Visit Check-In
                </h3>
                <p className="text-xs text-[#7A685D]">
                  Har order aur payment par aapka visit tick (✅) hota rahega
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck size={13} /> Auto Check-In Active
            </span>

            {isAuthenticated && (
              <button
                onClick={() => fetchMyOrders(true)}
                disabled={refreshing || loadingOrders}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F0EAE3] text-[#4A2C18] border border-[#E6DCD3] transition disabled:opacity-50"
                title="Refresh Check-In Count"
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#C85A32]' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* 10-Step Check-In Stamps Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A685D]">
              Visit Roadmap (Stamps 1 to 10)
            </h4>
            <span className="text-[11px] font-bold text-[#C85A32]">
              {checkInCount} / 10 Completed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
            {Array.from({ length: 10 }, (_, i) => {
              const visitNum = i + 1;
              const isDone = checkInCount >= visitNum;
              const isCurrentNext = checkInCount + 1 === visitNum;

              // Match dynamic milestone from DB/API
              const milestone = dynamicMilestones.find(
                (m) => Number(m.visitNumber) === visitNum && m.isActive !== false
              );

              const discountBadge = milestone
                ? milestone.discountType === 'percentage'
                  ? `${milestone.discountValue}% OFF`
                  : `₹${milestone.discountValue} OFF`
                : null;

              const IconComponent = milestone ? getMilestoneIcon(visitNum) : null;

              return (
                <div
                  key={visitNum}
                  className={`relative rounded-2xl p-3 flex flex-col items-center text-center transition-all ${
                    isDone
                      ? 'bg-emerald-50/70 border-2 border-emerald-500 shadow-2xs'
                      : isCurrentNext
                      ? 'bg-amber-50/70 border-2 border-[#C85A32] shadow-sm ring-2 ring-[#C85A32]/20'
                      : 'bg-[#FAF7F2] border border-dashed border-[#D6C7BC] opacity-75'
                  }`}
                >
                  {/* Milestone Badge Pill */}
                  {discountBadge && (
                    <span
                      className={`absolute -top-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight shadow-xs ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrentNext
                          ? 'bg-[#C85A32] text-white animate-bounce'
                          : 'bg-[#7A685D] text-white'
                      }`}
                    >
                      {discountBadge}
                    </span>
                  )}

                  {/* Stamp Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mt-1 transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrentNext
                        ? 'bg-[#C85A32] text-white shadow-xs ring-4 ring-[#C85A32]/20 animate-pulse'
                        : 'bg-white text-[#7A685D] border border-[#E6DCD3]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={22} className="stroke-[2.5]" />
                    ) : isCurrentNext ? (
                      <Sparkles size={18} />
                    ) : IconComponent ? (
                      <IconComponent size={16} className="text-[#7A685D]" />
                    ) : (
                      <span>{visitNum}</span>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="mt-2 text-center">
                    <span className="text-[11px] font-extrabold text-[#2C1810] block">
                      Visit #{visitNum}
                    </span>
                    <span
                      className={`text-[10px] font-semibold block leading-tight mt-0.5 ${
                        isDone
                          ? 'text-emerald-700 font-bold'
                          : isCurrentNext
                          ? 'text-[#C85A32] font-bold'
                          : 'text-[#8C7A6B]'
                      }`}
                    >
                      {isDone
                        ? 'Checked In ✓'
                        : isCurrentNext
                        ? 'Next Goal'
                        : milestone
                        ? milestone.title
                        : 'Stamp'}
                    </span>
                  </div>

                  {/* Unlocked Milestone Direct Action */}
                  {milestone && isDone && (
                    <button
                      onClick={() => handleApplyOffer(milestone.couponCode)}
                      className="mt-1.5 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-1.5 py-0.5 rounded-md transition shadow-2xs"
                      title={`Apply ${milestone.couponCode}`}
                    >
                      {milestone.couponCode}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default OffersPage;
