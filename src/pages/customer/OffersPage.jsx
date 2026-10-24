import React, { useEffect, useState, useCallback } from 'react';
import {
  Tag,
  Sparkles,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  Lock,
  Gift,
  RefreshCw,
  Award,
  ArrowRight,
  Coffee,
  Pizza,
  Utensils,
  Crown,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const MILESTONES = [
  {
    visit: 1,
    title: 'Welcome Treat',
    tag: '1st Check-In',
    discount: '10% OFF',
    code: 'PRIME10',
    icon: Gift,
    emoji: '🎁',
    description: 'Flat 10% discount on your initial table order above ₹150.',
    color: 'from-amber-500 to-amber-600'
  },
  {
    visit: 3,
    title: 'Coffee Lover Perk',
    tag: '3rd Check-In',
    discount: '15% OFF',
    code: 'VISIT3COFFEE',
    icon: Coffee,
    emoji: '☕',
    description: '15% off on artisanal hot espresso, cold brews & shakes above ₹200.',
    color: 'from-[#C85A32] to-[#A84520]'
  },
  {
    visit: 5,
    title: 'Mega Foodie Treat',
    tag: '5th Check-In',
    discount: '25% OFF',
    code: 'MEGA5BURGER',
    icon: Utensils,
    emoji: '🍔',
    description: '25% off on gourmet burgers, wraps & loaded cafe snacks above ₹300.',
    color: 'from-orange-500 to-red-600'
  },
  {
    visit: 7,
    title: 'Sourdough Pizza Feast',
    tag: '7th Check-In',
    discount: '₹200 FLAT OFF',
    code: 'GOLD7PIZZA',
    icon: Pizza,
    emoji: '🍕',
    description: 'Flat ₹200 instant savings on dining feast orders above ₹500.',
    color: 'from-rose-500 to-purple-600'
  },
  {
    visit: 10,
    title: 'VIP Royalty Crown',
    tag: '10th Check-In',
    discount: '30% VIP OFF',
    code: 'VIP10FEAST',
    icon: Crown,
    emoji: '👑',
    description: '30% VIP discount on your entire table feast combo above ₹500.',
    color: 'from-amber-600 to-yellow-500'
  }
];

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const { applyCouponCode } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [applyMessage, setApplyMessage] = useState({ text: '', isError: false });

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

  // Fetch customer orders for check-in calculation
  const fetchMyOrders = useCallback(async (isManualRefresh = false) => {
    if (!isAuthenticated) return;
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoadingOrders(true);

      const res = await api.get('/orders/my');
      if (res.data?.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch check-in visit history:', err);
    } finally {
      setLoadingOrders(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

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

  // Next milestone calculation
  const nextMilestone =
    MILESTONES.find((m) => m.visit > checkInCount) || MILESTONES[MILESTONES.length - 1];
  const isAllUnlocked = checkInCount >= 10;
  const visitsNeeded = nextMilestone ? Math.max(0, nextMilestone.visit - checkInCount) : 0;
  const progressPercent = Math.min(100, Math.round((checkInCount / 10) * 100));

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
      {/* CUSTOMER VISIT CHECK-IN STAMP CARD SECTION */}
      {/* ========================================================= */}
      <section className="bg-white rounded-3xl border border-[#E6DCD3] p-5 sm:p-7 shadow-xs space-y-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5EFEB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FAF7F2] text-[#C85A32] border border-[#E6DCD3]">
                <Award size={20} />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#2C1810]">
                  Dine & Check-In Stamp Card
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

        {/* Status / Logged In Overview */}
        {isAuthenticated ? (
          <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5EFEB] rounded-2xl p-4 sm:p-5 border border-[#E6DCD3] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#4A2C18] text-white flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#2C1810]">
                    {user?.name || 'Valued Customer'}
                  </h4>
                  <p className="text-[11px] text-[#7A685D]">
                    {checkInCount > 0
                      ? `🎉 ${checkInCount} Order Visits Completed & Ticked!`
                      : 'Abhi tak koi paid visit check-in nahi hua hai.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                <div className="bg-white px-3.5 py-1.5 rounded-xl border border-[#E6DCD3] shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-[#7A685D] block">
                    Total Check-ins
                  </span>
                  <span className="text-base font-extrabold text-[#C85A32]">
                    {checkInCount} <span className="text-xs text-[#7A685D] font-normal">/ 10</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#7A685D]">
                <span>
                  {isAllUnlocked
                    ? '👑 VIP Royalty Status Achieved! All 10 stamps collected!'
                    : `Next Reward: ${nextMilestone.emoji} ${nextMilestone.title} (${nextMilestone.discount})`}
                </span>
                <span className="text-[#C85A32] font-bold">
                  {isAllUnlocked ? '100% Unlocked' : `${visitsNeeded} visit${visitsNeeded > 1 ? 's' : ''} left`}
                </span>
              </div>
              <div className="w-full bg-[#E6DCD3] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#C85A32] to-emerald-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-5 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <UserCheck size={16} className="text-[#C85A32]" />
                Track Your Check-Ins & Unlock Free Rewards!
              </div>
              <p className="text-xs text-amber-800">
                Sign in with your phone or email so that whenever you order and pay, your visits are
                automatically ticked here.
              </p>
            </div>
            <Link
              to="/login?redirect=/offers"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#2C1810] text-white transition shadow-xs whitespace-nowrap"
            >
              Sign In to Check-In <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* 10-Step Check-In Stamps Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A685D]">
              Visit Roadmap (Stamps 1 to 10)
            </h4>
            <span className="text-[11px] text-[#7A685D]">
              {checkInCount} of 10 Completed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
            {Array.from({ length: 10 }, (_, i) => {
              const visitNum = i + 1;
              const isDone = checkInCount >= visitNum;
              const isCurrentNext = checkInCount + 1 === visitNum;
              const milestone = MILESTONES.find((m) => m.visit === visitNum);

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
                  {milestone && (
                    <span
                      className={`absolute -top-2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight shadow-xs ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrentNext
                          ? 'bg-[#C85A32] text-white animate-bounce'
                          : 'bg-[#7A685D] text-white'
                      }`}
                    >
                      {milestone.discount}
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
                    ) : milestone ? (
                      <milestone.icon size={16} className="text-[#7A685D]" />
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
                      {isDone ? 'Checked In ✓' : isCurrentNext ? 'Next Goal' : milestone ? milestone.tag : 'Stamp'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Rewards Cards */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A685D]">
              Milestone Reward Perks
            </h4>
            <span className="text-[11px] text-[#C85A32] font-semibold">
              Visit complete karte hi coupon unlock ho jayega
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {MILESTONES.map((milestone) => {
              const isUnlocked = checkInCount >= milestone.visit;
              const ordersRemaining = Math.max(0, milestone.visit - checkInCount);
              const IconComponent = milestone.icon;

              return (
                <div
                  key={milestone.visit}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    isUnlocked
                      ? 'bg-white border-emerald-300 shadow-2xs hover:shadow-md'
                      : 'bg-[#FAF7F2]/60 border-[#E6DCD3] opacity-85'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{milestone.emoji}</span>
                        <div>
                          <h5 className="font-extrabold text-sm text-[#2C1810]">
                            {milestone.title}
                          </h5>
                          <span className="text-[11px] font-bold text-[#C85A32]">
                            {milestone.discount} • {milestone.tag}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          isUnlocked
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <CheckCircle2 size={11} /> Unlocked
                          </>
                        ) : (
                          <>
                            <Lock size={10} /> Locked
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-[#7A685D] leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#F5EFEB]">
                    {isUnlocked ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-dashed border-[#C85A32] rounded-xl px-2.5 py-1">
                          <span className="font-mono font-extrabold text-xs text-[#C85A32]">
                            {milestone.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(milestone.code)}
                            className="text-[#7A685D] hover:text-[#2C1810] transition p-0.5"
                            title="Copy Code"
                          >
                            {copiedCode === milestone.code ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => handleApplyOffer(milestone.code)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1"
                        >
                          Apply to Cart
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-[#7A685D]">
                        <span className="flex items-center gap-1">
                          <Lock size={12} className="text-[#8C7A6B]" /> Unlocks on Visit #{milestone.visit}
                        </span>
                        <span className="font-bold text-[#C85A32]">
                          {ordersRemaining} order{ordersRemaining > 1 ? 's' : ''} left
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How Check-In Works Explainer */}
        <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E6DCD3] flex items-start gap-3 text-xs text-[#7A685D]">
          <span className="p-1.5 rounded-xl bg-white text-[#C85A32] shadow-2xs border border-[#E6DCD3] mt-0.5">
            <Sparkles size={16} />
          </span>
          <div className="space-y-1">
            <h5 className="font-bold text-[#2C1810] text-xs">
              Check-In Kaise Kaam Karta Hai? (How Auto Check-In Works)
            </h5>
            <p className="leading-relaxed text-[11px]">
              1. Aap jab bhi cafe me aakar order karenge aur counter ya online UPI se payment complete
              hogi, aapka visit <strong>automatically check-in</strong> ho kar tick (✅) ho jayega.
              <br />
              2. Jitni baar aap order karke payment karenge, aapka stamp card aage badhega aur milestone
              poora hote hi discounts unlock ho jayenge!
            </p>
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
