import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coffee,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Wifi,
  Music,
  Heart,
  UtensilsCrossed,
  Tag,
  Award,
  Smile,
  ShieldCheck,
  ChevronRight,
  Star,
  CheckCircle,
  Users,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  QrCode,
  Plus,
  Minus,
  Check,
  Copy,
  Search,
  X
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

// Crisp inline SVGs for Google and Instagram
const GoogleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

const InstagramIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOffers, setActiveOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const videoRef = useRef(null);


  const { cartItems, addToCart, updateQuantity } = useCart();
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);

  const faqs = [
    {
      q: 'How do I order directly from my table using the QR code?',
      a: 'Simply open your phone’s camera or any QR scanner app and point it at the QR code placed on your table. You will be instantly redirected to our digital menu where you can customize dishes, add beverages to your cart, and place orders directly without waiting for a server.'
    },
    {
      q: 'What are the operating hours for The Prime Cafe?',
      a: 'We are open 7 days a week, Monday through Sunday, from 10:00 AM to 11:30 PM. Both dine-in table service and quick takeaway pickups are active all day.'
    },
    {
      q: 'Is high-speed Wi-Fi and power outlets available for work or study?',
      a: 'Yes, absolutely! We provide complimentary high-speed optical fiber Wi-Fi and designated workstation seating with convenient charging power sockets for laptops and smartphones.'
    },
    {
      q: 'Do you offer pure vegetarian, vegan, and dairy-free options?',
      a: 'Yes! Our menu features clearly marked 100% vegetarian dishes, eggless artisan pastries & cakes, and plant-based dairy milk alternatives (Oat milk, Almond milk) for all handcrafted coffees and lattes.'
    },
    {
      q: 'What payment methods are supported?',
      a: 'We accept all popular payment modes including UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards (Visa, Mastercard, RuPay), and Counter Cash.'
    },
    {
      q: 'Can I book tables for birthdays, meetings, or private celebrations?',
      a: 'Yes! We love hosting birthday celebrations, anniversaries, and group gatherings. Tap the "Notify Staff" bell in the top navigation or speak with our manager at the front counter to coordinate custom party setups.'
    }
  ];

  const customerReviews = [
    {
      name: 'Aarav Mehta',
      tag: 'Regular Diner',
      rating: 5,
      date: 'Yesterday',
      review: 'The artisanal 3D burger and smoked hazelnut cold brew are out of this world! Cozy aesthetic and super smooth table QR ordering.',
      initials: 'AM',
      badgeColor: 'bg-[#FAF0E6] text-[#C85A32]'
    },
    {
      name: 'Priya Sharma',
      tag: 'Food Critic',
      rating: 5,
      date: '3 days ago',
      review: 'Incredible cozy vibe! High speed Wi-Fi makes it my favorite place to work remotely while sipping their single-origin cappuccino.',
      initials: 'PS',
      badgeColor: 'bg-[#F5EFEB] text-[#4A2C18]'
    },
    {
      name: 'Kabir Verma',
      tag: 'Verified Guest',
      rating: 5,
      date: '1 week ago',
      review: 'Table QR ordering was seamless. Sourdough pizza and pastries were served oven-hot within 10 minutes. 10/10 recommended!',
      initials: 'KV',
      badgeColor: 'bg-[#FAF0E6] text-[#2C1810]'
    }
  ];

  const ambianceHighlights = [
    {
      icon: Coffee,
      title: 'Artisanal Roastery',
      desc: '100% Arabica single-origin beans, precision ground & freshly extracted for every cup.'
    },
    {
      icon: Sparkles,
      title: 'Handcrafted Bakery',
      desc: 'Flaky croissants, gourmet cheesecakes, and oven-fresh snacks made from scratch.'
    },
    {
      icon: Wifi,
      title: 'Work & Chill Friendly',
      desc: 'High-speed fiber Wi-Fi, comfortable workstations, and dedicated power sockets.'
    },
    {
      icon: Music,
      title: 'Aesthetic Ambiance',
      desc: 'Warm ambient lighting, soulful lo-fi & indie tunes, and cozy intimate seating.'
    }
  ];

  const dineInSteps = [
    {
      step: '01',
      icon: QrCode,
      title: 'Scan Table QR',
      desc: 'Take your seat and scan the QR code placed on your table with your phone camera.',
      badge: 'Step 01',
      tag: 'Zero App Download',
      highlight: 'Instant camera scan — no app download or sign-up needed'
    },
    {
      step: '02',
      icon: UtensilsCrossed,
      title: 'Browse & Customize',
      desc: 'Pick your handcrafted brews & comfort food, add special instructions, and order in 1 tap.',
      badge: 'Step 02',
      tag: 'Live Menu & Offers',
      highlight: 'Full live menu with custom notes & coupon application'
    },
    {
      step: '03',
      icon: Coffee,
      title: 'Served Hot at Table',
      desc: 'Our barista and kitchen prepare your meal fresh. Pay seamlessly via UPI, card, or cash.',
      badge: 'Step 03',
      tag: 'Direct Table Delivery',
      highlight: 'Delivered oven-hot to your table with digital bill'
    }
  ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [menuRes, offersRes] = await Promise.allSettled([
          api.get('/menu'),
          api.get('/offers')
        ]);

        if (menuRes.status === 'fulfilled' && menuRes.value.data.success) {
          const items = menuRes.value.data.data;
          setAllItems(items);
          setFeaturedItems(items.slice(0, 4));
        }

        if (offersRes.status === 'fulfilled' && offersRes.value.data.success) {
          setActiveOffers(offersRes.value.data.data.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleCopyCoupon = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const getItemQuantityInCart = (itemId) => {
    const item = cartItems.find((i) => i._id === itemId);
    return item ? item.quantity : 0;
  };

  const searchResults = searchQuery.trim()
    ? allItems.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.name?.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
        );
      })
    : [];

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* 1. TOP CLEAN SEARCH BAR */}
      <section className="relative z-30">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search size={19} className="absolute left-3.5 sm:left-4 text-[#C85A32] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coffee, burgers, pizza, pasta, shakes, desserts..."
            className="w-full pl-11 sm:pl-12 pr-24 py-3 sm:py-3.5 bg-white border border-[#E6DCD3] focus:border-[#C85A32] rounded-2xl text-xs sm:text-sm text-[#2C1810] placeholder-[#7A685D] focus:outline-none transition shadow-2xs"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-[#7A685D] hover:text-[#2C1810] rounded-full hover:bg-[#E6DCD3]/50 transition"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
            <button
              type="submit"
              className="bg-[#C85A32] hover:bg-[#B24E2A] active:scale-95 text-white font-bold text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-xs flex items-center gap-1"
            >
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Real-Time Live Search Results Preview */}
        {searchQuery.trim() && (
          <div className="mt-2.5 bg-white p-4 rounded-3xl border border-[#E6DCD3] shadow-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A2C18]">
                {searchResults.length > 0
                  ? `Found ${searchResults.length} dish${searchResults.length > 1 ? 'es' : ''} for "${searchQuery}"`
                  : `No items matching "${searchQuery}"`}
              </span>
              {searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="text-[11px] font-bold text-[#C85A32] hover:underline flex items-center gap-1"
                >
                  View in Full Menu <ArrowRight size={12} />
                </button>
              )}
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {searchResults.slice(0, 6).map((item) => {
                  const qty = getItemQuantityInCart(item._id);
                  return (
                    <div
                      key={item._id}
                      className="p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl flex items-center justify-between gap-3 hover:border-[#C85A32] transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-[#E6DCD3]"
                          />
                        ) : (
                          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-[#E6DCD3] flex items-center justify-center shrink-0 text-[#7A685D]">
                            <Coffee size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                              title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                            />
                            <h5 className="font-extrabold text-xs text-[#2C1810] truncate">
                              {item.name}
                            </h5>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-[#7A685D] truncate mt-0.5 max-w-[140px] sm:max-w-[180px]">
                            {item.description || item.category?.name || 'Freshly handcrafted'}
                          </p>
                          <span className="font-extrabold text-xs text-[#4A2C18] block mt-0.5">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>

                      {/* Add to Cart button */}
                      <div className="shrink-0">
                        {qty > 0 ? (
                          <div className="flex items-center gap-1 bg-[#4A2C18] text-white rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, qty - 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded-lg"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold px-1.5">{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, qty + 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded-lg"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item, 1)}
                            className="bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1"
                          >
                            <Plus size={13} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 bg-[#FAF7F2] rounded-2xl">
                <p className="text-xs text-[#7A685D]">
                  No dishes found matching <strong>"{searchQuery}"</strong>. Try popular terms like <strong>Burger</strong>, <strong>Cold Brew</strong>, or <strong>Pizza</strong>.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. HERO SECTION: Full-Bleed 3D Video Background */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0F0805] text-[#FAF7F2] p-6 sm:p-10 shadow-2xl border border-[#3D2314] min-h-[420px] sm:min-h-[480px] flex flex-col justify-between">
        {/* Full-Bleed 3D Video Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover opacity-100"
          >
            <source src="/assets/gemini_generated_video_caa8d77b.mp4" type="video/mp4" />
            <source src="/assets/burger-animation.mp4" type="video/mp4" />
          </video>
          {/* Subtle all-over cinematic vignette so whole video shines edge-to-edge */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl space-y-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C85A32] text-white text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-md">
            <Sparkles size={13} className="animate-spin-slow shrink-0" />
            <span>Welcome to The Prime Cafe</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-lg">
            Where Every Sip <br />
            <span className="text-[#E08D5B] font-serif italic">Tells a Story</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#FAF7F2] leading-relaxed max-w-lg font-medium drop-shadow-md">
            Step into a cozy sanctuary of rich artisanal coffee, warm comfort food, and unforgettable moments. Handcrafted fresh with every order.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold text-xs sm:text-sm shadow-xl shadow-black/40 hover:scale-[1.02] active:scale-95 transition-all text-center"
            >
              <UtensilsCrossed size={16} />
              <span>Explore Menu</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/offers"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black/40 hover:bg-black/60 text-[#FAF7F2] font-semibold text-xs sm:text-sm border border-white/20 hover:border-white/40 backdrop-blur-md shadow-lg transition-all text-center"
            >
              <Tag size={15} className="text-[#E08D5B]" />
              <span>Special Offers</span>
            </Link>
          </div>
        </div>

        {/* Quick Cafe Badges Bar */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-[#FAF7F2] drop-shadow-md">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#E08D5B] shrink-0" />
            <span>Open: 10:00 AM – 11:30 PM</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#E08D5B] shrink-0" />
            <span>Dine-In & Takeaway</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <ShieldCheck size={16} className="text-[#E08D5B] shrink-0" />
            <span>100% Fresh & Hygienic</span>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF & LIVE REPUTATION (Directly under Hero & Search) */}
      <section className="space-y-4">
        {/* Rating Score & Instagram Follow Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Rating Snapshot */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C85A32] bg-[#FAF0E6] px-2.5 py-1 rounded-full">
                  Verified Guest Ratings
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#2C1810]">4.9</span>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={17} fill="#F59E0B" className="text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#7A685D] mt-1 font-medium">
                  Based on <strong className="text-[#2C1810]">2,850+ reviews</strong> on Google & In-House
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] border border-[#E6DCD3] flex items-center justify-center shrink-0 shadow-2xs">
                <GoogleIcon size={22} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F5EFEB] flex items-center justify-between text-xs text-[#7A685D]">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={15} className="text-emerald-600" />
                <span className="font-bold text-[#2C1810]">98% Recommended</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-[#C85A32]" />
                <span className="font-bold text-[#2C1810]">15K+ Happy Guests</span>
              </div>
            </div>
          </div>

          {/* Right: Instagram & Social Media Follow Card */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#2C1810] via-[#381F12] to-[#1A0E08] text-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#4A2C18] flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
            {/* Ambient Instagram Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 opacity-25 blur-2xl pointer-events-none" />

            <div className="space-y-1.5 z-10 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-bold text-[#FAF7F2]">
                <InstagramIcon size={13} className="text-pink-400" />
                <span>Join Our Cafe Community</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Follow <span className="text-[#E08D5B]">@theprimecafe.official</span>
              </h3>
              <p className="text-xs text-[#D8CBC1] max-w-sm leading-relaxed">
                Tag your coffee & burger moments with <span className="text-white font-semibold">#AajKalMoments</span> to get featured on our feed!
              </p>
            </div>

            <div className="z-10 shrink-0 flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white font-bold text-xs shadow-lg shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all"
              >
                <InstagramIcon size={16} />
                <span>Follow on Instagram</span>
                <ExternalLink size={13} />
              </a>
              <span className="text-[11px] text-[#D8CBC1] font-medium">18.4K+ Followers</span>
            </div>
          </div>
        </div>

        {/* Real Customer Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customerReviews.map((rev, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6DCD3] shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#F59E0B" className="text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#7A685D]">{rev.date}</span>
                </div>
                <p className="text-xs text-[#4A2C18] leading-relaxed italic">
                  "{rev.review}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2.5 border-t border-[#F5EFEB]">
                <div className={`w-8 h-8 rounded-full ${rev.badgeColor} font-extrabold text-[11px] flex items-center justify-center shrink-0`}>
                  {rev.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#2C1810] truncate">{rev.name}</h4>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle size={10} className="text-emerald-600" /> {rev.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR FAVORITES & MENU PREVIEW (Action Driver) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C85A32]">
              <Sparkles size={14} /> Curated Cafe Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] tracking-tight mt-1">
              Popular Favorites
            </h2>
            <p className="text-xs sm:text-sm text-[#7A685D] mt-0.5">
              Handcrafted artisan roasts, gourmet burgers, and oven-fresh bakery items loved by our diners.
            </p>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#C85A32] hover:text-[#B24E2A] self-start sm:self-auto transition"
          >
            <span>View Full Menu</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 border border-[#E6DCD3] animate-pulse h-60" />
            ))}
          </div>
        ) : featuredItems.length > 0 ? (
          <div className="grid grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
            {featuredItems.map((item) => (
              <Link
                key={item._id}
                to="/menu"
                className="bg-white rounded-3xl border border-[#E6DCD3] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group block"
              >
                <div className="relative aspect-4/3 w-full bg-[#F5EFEB] overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#7A685D]">
                      <Coffee size={32} />
                    </div>
                  )}
                  {item.isVeg !== undefined && (
                    <div className="absolute top-2.5 left-2.5 shadow-2xs">
                      <span className={`w-4 h-4 rounded-sm border flex items-center justify-center bg-white ${
                        item.isVeg ? 'border-green-600' : 'border-red-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          item.isVeg ? 'bg-green-600' : 'bg-red-600'
                        }`} />
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#2C1810] line-clamp-1 group-hover:text-[#C85A32] transition">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-[#7A685D] line-clamp-2 mt-1 leading-relaxed">
                      {item.description || 'Artisanal Cafe Specialty'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#E6DCD3]">
            <Coffee size={32} className="mx-auto text-[#7A685D] mb-2" />
            <p className="text-sm text-[#7A685D]">Check out our delicious selection in the menu!</p>
            <Link
              to="/menu"
              className="mt-3 inline-block px-4 py-2 bg-[#C85A32] text-white text-xs font-bold rounded-xl"
            >
              Browse Menu
            </Link>
          </div>
        )}
      </section>

      {/* 4. ACTIVE PROMO / DEAL BANNER */}
      {activeOffers.length > 0 && (
        <section className="bg-gradient-to-r from-[#FAF0E6] to-[#F5E6D8] border border-[#E6DCD3] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center shrink-0 shadow-md">
              <Tag size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C85A32] bg-white px-2 py-0.5 rounded-md border border-[#E6DCD3]">
                  Special Offer
                </span>
                <span className="text-xs font-mono font-bold text-[#4A2C18] bg-white/70 px-2 py-0.5 rounded-md border border-[#E6DCD3]">
                  {activeOffers[0].code}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#2C1810]">
                {activeOffers[0].title || 'Special discount on your table order'}
              </h3>
              <p className="text-xs text-[#7A685D]">
                {activeOffers[0].description || 'Apply this promo code in your cart to avail instant discount.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              to="/offers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B24E2A] px-5 py-2.5 rounded-xl shadow-xs transition hover:scale-105 text-center"
            >
              <span>View Deals</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* 5. HOW IT WORKS: 3-Step Seamless Dine-In Experience (Highlighted) */}
      <section className="relative bg-gradient-to-b from-[#FAF0E6] via-[#FAF7F2] to-[#FAF0E6]/90 border-2 border-[#E6DCD3] rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden">
        {/* Soft Decorative Ambient Background Glows */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-[#C85A32]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-[#E08D5B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2C1810] tracking-tight">
            How Digital Table Ordering Works
          </h2>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {dineInSteps.map((s, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-3xl p-6 border-2 border-[#E6DCD3] hover:border-[#C85A32] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5"
              >
                <div>
                  {/* Top Bar: Badge and Step Number */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#C85A32] text-white shadow-2xs">
                      {s.badge}
                    </span>
                    <span className="text-3xl font-black text-[#E6DCD3] group-hover:text-[#E08D5B] transition-colors font-mono">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#2C1810] group-hover:text-[#C85A32] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7A685D] mt-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {/* Step Feature Pill Footer */}
                <div className="mt-5 pt-3.5 border-t border-[#E6DCD3]/70 flex items-center gap-2 text-[11px] font-semibold text-[#4A2C18] bg-[#FAF0E6]/60 rounded-xl px-3 py-2">
                  <CheckCircle size={14} className="text-[#C85A32] shrink-0" />
                  <span>{s.highlight}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Highlighted Footer Action Button */}
        <div className="relative z-10 mt-8 pt-2 flex items-center justify-center">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-bold rounded-2xl transition shadow-xs hover:shadow-md hover:scale-105"
          >
            <QrCode size={14} />
            <span>Open Table Digital Menu</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* 6. THE CAFE EXPERIENCE & AMBIANCE */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] tracking-tight">
              Why You'll Love Being Here
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ambianceHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-3xl border border-[#E6DCD3] shadow-xs hover:shadow-md hover:border-[#C85A32]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FAF0E6] text-[#C85A32] group-hover:bg-[#C85A32] group-hover:text-white flex items-center justify-center mb-3.5 transition-colors shadow-2xs">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-[#2C1810] group-hover:text-[#C85A32] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#7A685D] mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="space-y-5">
        <div className="text-center max-w-2xl mx-auto mb-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-[#C85A32]/40 shadow-sm' : 'border-[#E6DCD3] hover:border-[#D8CBC1]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className={`text-xs sm:text-sm font-bold transition-colors ${
                    isOpen ? 'text-[#C85A32]' : 'text-[#2C1810]'
                  }`}>
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-[#FAF0E6] text-[#C85A32] rotate-180' : 'bg-[#FAF7F2] text-[#7A685D]'
                  }`}>
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 text-xs sm:text-[13px] text-[#7A685D] leading-relaxed border-t border-[#F5EFEB]">
                    <div className="pt-3">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. VISIT & TABLE SERVICE BANNER */}
      <section className="bg-white rounded-3xl border border-[#E6DCD3] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A32] bg-[#FAF0E6] px-3 py-1 rounded-full">
            <Smile size={14} /> Seamless Dine-In Experience
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#2C1810]">
            Order straight from your table, hassle-free
          </h2>
          <p className="text-xs sm:text-sm text-[#7A685D] max-w-lg">
            Scan your table QR code anytime to add extra beverages, notify staff, or request the bill directly from your phone.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
          <Link
            to="/menu"
            className="px-5 py-2.5 rounded-2xl bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold text-xs shadow-md transition text-center"
          >
            Go to Menu
          </Link>
          <Link
            to="/order"
            className="px-5 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#EAE0D5] text-[#4A2C18] border border-[#E6DCD3] font-bold text-xs transition text-center"
          >
            View Cart
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
