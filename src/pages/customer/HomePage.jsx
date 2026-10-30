import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
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
  X,
  ShoppingBag,
  Phone,
  Compass
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import LoyaltyRewardHero from '../../components/LoyaltyRewardHero';
import CafeVideoShowcase from '../../components/CafeVideoShowcase';
import ReviewModal from '../../components/ReviewModal';
import { getSocket } from '../../services/socket';
import { getItemFallbackImage } from '../../utils/imageFallback';

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

const WhatsAppIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.031 2C6.516 2 2.024 6.49 2.024 12c0 1.897.534 3.666 1.458 5.176L2 22l4.98-1.442A9.948 9.948 0 0 0 12.031 22c5.516 0 10.008-4.49 10.008-10s-4.492-10-10.008-10zm5.836 14.195c-.244.686-1.42 1.32-1.96 1.365-.494.04-1.139.06-3.666-.99-3.23-1.34-5.297-4.63-5.457-4.846-.16-.215-1.306-1.74-1.306-3.32 0-1.58.825-2.358 1.118-2.678.293-.32.64-.4.854-.4.214 0 .427.002.614.011.198.01.462-.075.723.551.267.64.908 2.217.988 2.378.08.16.133.347.027.561-.107.214-.16.347-.32.534-.16.187-.336.417-.48.56-.16.16-.328.334-.141.654.187.32.83 1.366 1.782 2.215 1.224 1.092 2.256 1.43 2.576 1.59.32.16.507.134.694-.08.187-.214.8-1.014 1.014-1.36.214-.347.427-.294.72-.187.294.106 1.868.88 2.188 1.04.32.16.534.24.614.373.08.134.08.775-.164 1.46z" />
  </svg>
);


const DEFAULT_FEATURED_ITEMS = [
  {
    _id: 'default-burger',
    name: 'Artisan Smash Burger',
    description: 'Crisp brioche bun, house-special smoky sauce, and flame-seared patty.',
    price: 60,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    _id: 'default-coffee',
    name: 'Double Shot Espresso & Crema',
    description: '100% Arabica single-origin beans, precision extracted with rich crema.',
    price: 120,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80'
  },
  {
    _id: 'default-pizza',
    name: 'Wood-Fired Margherita Pizza',
    description: 'Crushed San Marzano tomatoes, fresh basil, and bubbly mozzarella.',
    price: 210,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80'
  },
  {
    _id: 'default-pasta',
    name: 'Creamy Italian Alfredo Pasta',
    description: 'Al dente pasta tossed in parmesan garlic cream and aromatic herbs.',
    price: 210,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62810f4?auto=format&fit=crop&w=600&q=80'
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState(DEFAULT_FEATURED_ITEMS);
  const [allItems, setAllItems] = useState(DEFAULT_FEATURED_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOffers, setActiveOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const videoRef = useRef(null);

  // Live Customer & Google Reviews
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 4.9,
    totalReviews: 2853,
    recommendedPercent: 98,
    happyGuests: '15K+'
  });
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);


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
      icon: Sparkles,
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
      icon: CheckCircle2,
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
        const [menuRes, offersRes, reviewsRes] = await Promise.allSettled([
          api.get('/menu'),
          api.get('/offers'),
          api.get('/reviews')
        ]);

        if (menuRes.status === 'fulfilled' && menuRes.value.data?.success && Array.isArray(menuRes.value.data?.data) && menuRes.value.data.data.length > 0) {
          const items = menuRes.value.data.data;
          setAllItems(items);
          setFeaturedItems(items.slice(0, 4));
        } else {
          setFeaturedItems(DEFAULT_FEATURED_ITEMS);
          setAllItems(DEFAULT_FEATURED_ITEMS);
        }

        if (offersRes.status === 'fulfilled' && offersRes.value.data.success) {
          setActiveOffers(offersRes.value.data.data.slice(0, 2));
        }

        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.data.success) {
          const { reviews, stats, googleReviewUrl: gUrl } = reviewsRes.value.data.data;
          if (Array.isArray(reviews) && reviews.length > 0) {
            setReviewsList(reviews);
          }
          if (stats) setReviewStats(stats);
          if (gUrl) setGoogleReviewUrl(gUrl);
        }
      } catch (err) {
        console.error('Failed to load home page content:', err);
        setFeaturedItems(DEFAULT_FEATURED_ITEMS);
        setAllItems(DEFAULT_FEATURED_ITEMS);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    // 100% Dynamic Sync with Cafe Management Panel
    const socket = getSocket();
    const handleSync = () => {
      fetchHomeData();
    };

    socket.on('menu_updated', handleSync);
    socket.on('offer_updated', handleSync);
    socket.on('new_review', handleSync);

    return () => {
      socket.off('menu_updated', handleSync);
      socket.off('offer_updated', handleSync);
      socket.off('new_review', handleSync);
    };
  }, []);

  const handleReviewSubmitted = (newReview) => {
    setReviewsList((prev) => [newReview, ...prev]);
    setReviewStats((prev) => ({
      ...prev,
      totalReviews: (prev.totalReviews || 2850) + 1
    }));
  };


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

  const handleOrderNow = (item, e) => {
    e?.stopPropagation();
    const existing = cartItems.find((i) => i._id === item._id);
    if (!existing) {
      addToCart(item, 1);
    }
    navigate('/order');
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
                        <img
                          src={item.image || getItemFallbackImage(item)}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getItemFallbackImage(item);
                          }}
                          className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-[#E6DCD3]"
                          loading="lazy"
                        />
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
                              onClick={() => updateQuantity(item._id, -1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded-lg"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold px-1.5">{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, 1)}
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

      {/* 2. THE PRIME CAFÉ OFFICIAL GRAND HERO BANNER */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-md border border-[#E6DCD3] group bg-[#2C1810]">
        <div 
          onClick={() => navigate('/menu')}
          className="cursor-pointer block relative overflow-hidden"
          title="Click to explore The Prime Cafe live menu"
        >
          <img
            src="/prime-cafe-banner.png"
            alt="The Prime Café - Every Bite, A Little Happiness - Pani Tanki Chowk, Muzaffarpur"
            className="w-full h-auto object-cover group-hover:scale-[1.012] transition-transform duration-500 block"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </section>

      {/* 2.5 CUSTOMER VISIT CHECK-IN / LOYALTY REWARDS */}
      <LoyaltyRewardHero />

      {/* 2.5 VIDEO SHOWCASE SECTION */}
      <CafeVideoShowcase />


            {/* 3. POPULAR FAVORITES & MENU PREVIEW (Action Driver) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] tracking-tight">
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
            {featuredItems.map((item) => {
              const qty = getItemQuantityInCart(item._id);

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl border border-[#E6DCD3] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Clickable Image & Dietary Badge */}
                  <div
                    onClick={() => navigate('/menu')}
                    className="relative aspect-4/3 w-full bg-[#F5EFEB] overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.image || getItemFallbackImage(item)}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getItemFallbackImage(item);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {item.isVeg !== undefined && (
                      <div className="absolute top-2.5 left-2.5 shadow-2xs">
                        <span
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center bg-white ${
                            item.isVeg ? 'border-green-600' : 'border-red-600'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.isVeg ? 'bg-green-600' : 'bg-red-600'
                            }`}
                          />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body & Actions */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                    <div
                      onClick={() => navigate('/menu')}
                      className="cursor-pointer"
                    >
                      <h3 className="text-xs sm:text-sm font-bold text-[#2C1810] line-clamp-1 group-hover:text-[#C85A32] transition">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#7A685D] line-clamp-2 mt-1 leading-relaxed">
                        {item.description || 'Artisanal Cafe Specialty'}
                      </p>
                    </div>

                    {/* Bottom Row: Price & Order Now Button */}
                    <div className="pt-2.5 border-t border-[#F5EFEB] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm sm:text-base font-black text-[#2C1810]">
                          ₹{item.price}
                        </span>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleOrderNow(item, e)}
                          className="bg-[#C85A32] hover:bg-[#B24E2A] active:scale-95 text-white font-extrabold text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag size={13} />
                          <span>Order Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#E6DCD3]">
            <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-[#C85A32]/30 shadow-md bg-black flex items-center justify-center">
              <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-bold text-[#2C1810]">The Prime Cafe Delicacies</p>
            <p className="text-xs text-[#7A685D] mt-0.5">Check out our delicious selection in the menu!</p>
            <Link
              to="/menu"
              className="mt-3.5 inline-block px-5 py-2.5 bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-bold rounded-xl transition shadow-xs"
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

      {/* 3. SOCIAL PROOF & LIVE REPUTATION (Directly under Hero & Search) */}
      <section className="space-y-4">
        {/* Rating Score & Instagram Follow Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Rating Snapshot with Live Review Button */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#E6DCD3] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C85A32] bg-[#FAF0E6] px-2.5 py-1 rounded-full">
                  Verified Guest Ratings
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#2C1810]">
                    {reviewStats.averageRating || '4.9'}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={17} fill="#F59E0B" className="text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#7A685D] mt-1 font-medium">
                  Based on <strong className="text-[#2C1810]">{reviewStats.totalReviews?.toLocaleString() || '2,853'}+ reviews</strong> on Google & In-House
                </p>
              </div>

              {/* Clickable Google Icon to trigger review modal */}
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="w-11 h-11 rounded-2xl bg-[#FAF7F2] hover:bg-[#FAF0E6] border border-[#E6DCD3] flex items-center justify-center shrink-0 shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer"
                title="Write a Google Review"
              >
                <GoogleIcon size={22} />
              </button>
            </div>

            {/* Interactive "Write a Review" button inside card */}
            <div className="pt-2.5 pb-1">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#C85A32] hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs shadow-md shadow-orange-950/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-200" />
                <span>Write a Review</span>
                <span className="text-sm">✍️</span>
              </button>
            </div>

            <div className="mt-2.5 pt-3 border-t border-[#F5EFEB] flex items-center justify-between text-xs text-[#7A685D]">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={15} className="text-emerald-600" />
                <span className="font-bold text-[#2C1810]">{reviewStats.recommendedPercent || 98}% Recommended</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-[#C85A32]" />
                <span className="font-bold text-[#2C1810]">{reviewStats.happyGuests || '15K+'} Happy Guests</span>
              </div>
            </div>
          </div>

          {/* Right: Instagram & Social Media Follow Card */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#24130A] via-[#1C0E07] to-[#120804] text-white rounded-3xl p-5 shadow-xs border border-[#4A2814] flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Instagram Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 opacity-20 blur-2xl pointer-events-none" />

            {/* Top Row: Profile & Follow CTA Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 z-10">
              <div className="flex items-center gap-3">
                {/* Instagram Story Gradient Ring */}
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shrink-0 shadow-md">
                  <div className="w-11 h-11 rounded-full bg-[#1A0E08] p-0.5 flex items-center justify-center">
                    <InstagramIcon size={20} className="text-pink-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                      @theprimecafe.official
                    </h4>
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black shrink-0" title="Verified">✓</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-medium">
                    Official Cafe Community
                  </p>
                </div>
              </div>

                          </div>

            {/* Bottom Row: Stats & Tag Info (Matches left card footer) */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300 z-10">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span>18.4K+ Followers</span>
              </div>
              <div className="text-[11px] font-semibold text-amber-300/90">
                #AajKalMoments
              </div>
            </div>
          </div>


        </div>

        {/* Real Customer Review Cards with Dynamic List & Review CTA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs sm:text-sm font-extrabold text-[#2C1810] uppercase tracking-wider flex items-center gap-1.5">
              <span>Customer Reviews & Google Feedback</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-black text-[#C85A32] hover:text-[#B24E2A] underline transition cursor-pointer"
            >
              <span>+ Share Your Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(reviewsList.length > 0 ? reviewsList : customerReviews).slice(0, 3).map((rev, index) => {
              const initials = rev.name
                ? rev.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'CU';
              const dateDisplay = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                : rev.date || 'Recently';

              return (
                <div
                  key={rev._id || index}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6DCD3] shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="#F59E0B" className="text-amber-500" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {rev.source === 'Google' && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-full border border-neutral-200">
                            <GoogleIcon size={10} /> Google
                          </span>
                        )}
                        <span className="text-[10px] text-[#7A685D]">{dateDisplay}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#4A2C18] leading-relaxed italic line-clamp-3">
                      "{rev.review}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2.5 border-t border-[#F5EFEB]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FAF0E6] to-[#F5EFEB] text-[#C85A32] font-black text-[11px] flex items-center justify-center shrink-0 border border-[#E6DCD3]">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#2C1810] truncate">{rev.name}</h4>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle size={10} className="text-emerald-600 shrink-0" /> {rev.tag || 'Verified Diner'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>


            {/* 6. CONTACT & LOCATION SECTION (Matches reference screenshot) */}
      <section className="relative overflow-hidden bg-[#160E0A] text-[#FAF7F2] rounded-3xl sm:rounded-[36px] p-6 sm:p-8 md:p-12 border border-[#2C1810] shadow-2xl">
        {/* Subtle Warm Amber Glow in Top-Right Corner */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-amber-500/15 via-orange-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-gradient-to-tr from-[#C85A32]/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Vintage Hanging Lantern Aesthetic Decor in Top-Right (as shown in reference screenshot) */}
        <div className="absolute top-0 right-4 sm:right-8 w-12 sm:w-16 pointer-events-none opacity-90 hidden sm:block">
          <div className="w-[1.5px] h-12 bg-gradient-to-b from-amber-700 to-amber-950 mx-auto" />
          <div className="w-8 h-11 bg-gradient-to-b from-amber-950 via-amber-700/60 to-amber-400/80 rounded-b-2xl border border-amber-500/40 mx-auto shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center">
            <div className="w-3 h-5 bg-amber-200/90 rounded-full blur-[1px] animate-pulse" />
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center relative z-10 space-y-1 mb-8 sm:mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#C85A32] block">
            VISIT & ORDER
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FAF7F2] tracking-tight uppercase">
            CONTACT & LOCATION
          </h2>
          <div className="w-16 h-1 bg-[#D93829] mx-auto mt-2.5 rounded-full" />
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 relative z-10">
          {/* Card 1: Our Address & Operating Hours */}
          <div className="bg-[#201511] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between space-y-6 shadow-md hover:border-white/10 transition">
            <div className="space-y-6">
              {/* Address Block */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#C85A32]/15 text-[#C85A32] flex items-center justify-center shrink-0 border border-[#C85A32]/30 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#A8988D]">
                    OUR ADDRESS
                  </h4>
                  <p className="text-sm sm:text-base font-bold text-white leading-snug">
                    पानी टंकी चौक, मुज़फ़्फ़रपुर
                  </p>
                  <p className="text-xs text-[#A8988D] leading-relaxed">
                    Pani Tanki Chowk, Muzaffarpur, Bihar - 842001
                  </p>
                </div>
              </div>

              {/* Hours Block */}
              <div className="flex items-start gap-3.5 pt-2">
                <div className="w-10 h-10 rounded-full bg-[#C85A32]/15 text-[#C85A32] flex items-center justify-center shrink-0 border border-[#C85A32]/30 mt-0.5">
                  <Clock size={18} />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#A8988D]">
                    OPERATING HOURS
                  </h4>
                  <p className="text-sm sm:text-base font-bold text-white leading-snug">
                    Every Day: 10:00 AM - 11:30 PM
                  </p>
                  <p className="text-xs text-[#A8988D] leading-relaxed">
                    Order anytime for dine-in, takeaway or quick delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons: Call & WhatsApp */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="tel:+916277781888"
                className="flex-1 bg-[#D93829] hover:bg-[#c32f21] text-white font-extrabold text-xs sm:text-sm py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition active:scale-95 text-center truncate"
              >
                <Phone size={14} className="shrink-0" />
                <span className="truncate">CALL US: 6277781888</span>
              </a>
              <a
                href="https://wa.me/916277781888?text=Hi%20The%20Prime%20Cafe%2C%20I%20would%20like%20to%20know%20more%20about%20your%20menu%20and%20table%20bookings."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition active:scale-95 text-center truncate"
              >
                <WhatsAppIcon size={16} className="shrink-0" />
                <span className="truncate">WHATSAPP CHAT</span>
              </a>
            </div>
          </div>

          {/* Card 2: Quick Direct Links */}
          <div className="bg-[#201511] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between space-y-4 shadow-md hover:border-white/10 transition">
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                  QUICK DIRECT LINKS
                </h3>
                <p className="text-xs text-[#A8988D] mt-1 leading-relaxed">
                  Instantly connect with us or navigate to our store using these action shortcuts.
                </p>
              </div>

              {/* Chat on WhatsApp Large Button */}
              <a
                href="https://wa.me/916277781888?text=Hi%20The%20Prime%20Cafe%2C%20I%20would%20like%20to%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
              >
                <WhatsAppIcon size={18} />
                <span>CHAT ON WHATSAPP</span>
              </a>

              {/* Navigate Google Maps Button */}
              <a
                href="https://maps.google.com/?q=The+Prime+Cafe+Pani+Tanki+Chowk+Muzaffarpur"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <Compass size={17} className="text-[#E5A84B]" />
                <span>NAVIGATE GOOGLE MAPS</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Customer & Google Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
        googleReviewUrl={googleReviewUrl}
      />
    </div>
  );
};


export default HomePage;
