import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Minus, Check, Clock, Sparkles, AlertCircle, Leaf, Drumstick, ArrowUpDown, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { getSocket } from '../../services/socket';
import { getItemFallbackImage } from '../../utils/imageFallback';

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const { cartItems, addToCart, updateQuantity } = useCart();

  const fetchMenuData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [catRes, menuRes] = await Promise.all([
        api.get('/categories'),
        api.get('/menu')
      ]);
      if (catRes.data?.success) setCategories(catRes.data.data || []);
      if (menuRes.data?.success) setMenuItems(menuRes.data.data || []);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuData();

    // 100% Real-Time Dynamic Sync with Cafe Management Panel
    const socket = getSocket();
    const handleMenuUpdated = (payload) => {
      // Re-fetch immediately when Cafe Manager adds, edits, deletes or toggles stock status
      fetchMenuData(true);
    };

    socket.on('menu_updated', handleMenuUpdated);

    return () => {
      socket.off('menu_updated', handleMenuUpdated);
    };
  }, [fetchMenuData]);

  // Dietary filter: 'all', 'veg', 'non-veg'
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.categorySlug === selectedCategory ||
      item.category?._id === selectedCategory ||
      item.category === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    let matchesDiet = true;
    if (dietaryFilter === 'veg') matchesDiet = item.isVeg === true;
    if (dietaryFilter === 'non-veg') matchesDiet = item.isVeg === false;

    return matchesCategory && matchesSearch && matchesDiet;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-low') {
      return (Number(a.price) || 0) - (Number(b.price) || 0);
    }
    if (sortBy === 'price-high') {
      return (Number(b.price) || 0) - (Number(a.price) || 0);
    }
    return 0;
  });

  const getItemQuantityInCart = (itemId) => {
    const found = cartItems.find((i) => i._id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Welcome Banner on Full Screen / Desktop */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#3D2314] via-[#4A2C18] to-[#2C1810] text-[#FAF7F2] p-5 sm:p-7 md:p-8 shadow-xs">
        <div className="relative z-10 max-w-2xl flex items-start gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-[#C85A32]/40 shadow-md bg-black flex items-center justify-center">
            <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
          </div>
          <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-[#C85A32] text-white shadow-2xs mb-2">
            <Sparkles size={12} /> The Prime Artisanal Roastery
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Handcrafted Coffee & Comfort Food
          </h2>
          <p className="text-xs sm:text-sm text-[#E6DCD3] mt-2 leading-relaxed">
            Freshly brewed single-origin beans, authentic Chinese dishes, and instant hunger combos handcrafted with love.
          </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6DCD3] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A685D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, beverages, combos..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl sm:rounded-2xl text-xs sm:text-sm placeholder-[#7A685D] focus:outline-none focus:border-[#C85A32] transition"
            />
          </div>

          {/* Controls: Dietary Filters & Sorting */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Dedicated Veg & Non-Veg Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl sm:rounded-2xl border border-[#E6DCD3]">
              <button
                onClick={() => setDietaryFilter((prev) => (prev === 'veg' ? 'all' : 'veg'))}
                className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-white'
                  }`}
              >
                <Leaf size={14} className={dietaryFilter === 'veg' ? 'text-white' : 'text-emerald-600'} />
                Veg
              </button>
              <button
                onClick={() => setDietaryFilter((prev) => (prev === 'non-veg' ? 'all' : 'non-veg'))}
                className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${dietaryFilter === 'non-veg'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:bg-white'
                  }`}
              >
                <Drumstick size={14} className={dietaryFilter === 'non-veg' ? 'text-white' : 'text-rose-600'} />
                Non-Veg
              </button>
            </div>

            {/* Sorting Dropdown */}
            <div className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-2xl transition cursor-pointer text-xs font-bold shadow-2xs border ${
              sortBy !== 'default'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-[#FAF7F2] hover:bg-[#F5EFEB] border-[#E6DCD3] text-[#4A2C18]'
            }`}>
              <ArrowUpDown size={13} className={sortBy !== 'default' ? 'text-amber-700' : 'text-[#C85A32]'} />
              <span className="text-[11px] text-[#7A685D] font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#4A2C18] focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="default">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown size={13} className="text-[#7A685D] pointer-events-none -ml-3.5 shrink-0" />
            </div>
          </div>
        </div>

        {/* Category Horizontal Pill Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar pt-1 -mx-1 px-1 touch-pan-x">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${selectedCategory === 'all'
              ? 'bg-[#4A2C18] text-white shadow-xs'
              : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB] hover:text-[#4A2C18]'
              }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${selectedCategory === cat.slug
                ? 'bg-[#4A2C18] text-white shadow-xs'
                : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB] hover:text-[#4A2C18]'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Grid for Menu Items (1 col on mobile, 2 on tablet, 3 on laptop) */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-md ring-2 ring-[#C85A32]/30 bg-black flex items-center justify-center animate-pulse mb-3">
            <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs font-semibold text-[#7A685D]">Loading The Prime Cafe live menu...</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-[#E6DCD3]">
          <p className="text-base font-bold text-[#2C1810]">No menu items found</p>
          <p className="text-xs text-[#7A685D] mt-1">Try another search keyword or switch categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5">
          {sortedItems.map((item) => {
            const qtyInCart = getItemQuantityInCart(item._id);
            const isAvailable = item.availability !== false && item.isAvailable !== false;

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl sm:rounded-3xl border border-[#E6DCD3] p-3.5 sm:p-4 flex gap-3 sm:gap-3.5 shadow-2xs hover:shadow-md transition-all group justify-between ${!isAvailable ? 'opacity-85' : ''
                  }`}
              >
                {/* Details Column */}
                <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5 flex-wrap">
                      <span
                        className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                        ></span>
                      </span>

                      {item.tags && item.tags.length > 0 && (
                        <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-wider flex items-center gap-0.5 truncate">
                          <Sparkles size={10} /> {item.tags[0]}
                        </span>
                      )}

                      {!isAvailable && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-md">
                          Sold Out
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-[#2C1810] leading-snug group-hover:text-[#C85A32] transition">
                      {item.name}
                    </h4>
                    {item.description && (
                      <p className="text-[11px] sm:text-xs text-[#7A685D] mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 sm:mt-3 flex items-center justify-between">
                    <span className="font-extrabold text-sm sm:text-base text-[#2C1810]">
                      ₹{item.price}
                    </span>
                    {item.prepTime && (
                      <span className="text-[10px] sm:text-[11px] text-[#7A685D] flex items-center gap-1 font-medium">
                        <Clock size={11} /> {item.prepTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Image & Action Column */}
                <div className="w-24 sm:w-28 flex flex-col items-center justify-between shrink-0">
                  <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-[#FAF7F2] relative border border-[#E6DCD3]/60 group-hover:scale-102 transition">
                    <img
                      src={item.image || getItemFallbackImage(item)}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getItemFallbackImage(item);
                      }}
                      className={`w-full h-full object-cover ${!isAvailable ? 'grayscale-[40%]' : ''}`}
                      loading="lazy"
                    />
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-1 text-center">
                        <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper / Add Button */}
                  <div className="w-22 sm:w-28 mt-2">
                    {!isAvailable ? (
                      <button
                        type="button"
                        disabled
                        className="w-full bg-neutral-100 text-[#7A685D] border border-neutral-300 rounded-xl py-1 text-[11px] sm:text-xs font-bold cursor-not-allowed opacity-75"
                      >
                        Sold Out
                      </button>
                    ) : qtyInCart > 0 ? (
                      <div className="flex items-center justify-between bg-[#F5EFEB] border border-[#C85A32] rounded-xl px-2 py-1 text-xs font-bold text-[#4A2C18] shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="hover:text-[#C85A32] p-0.5 cursor-pointer"
                        >
                          <Minus size={13} />
                        </button>
                        <span>{qtyInCart}</span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="hover:text-[#C85A32] p-0.5 cursor-pointer"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item, 1)}
                        className="w-full bg-[#FAF7F2] hover:bg-[#C85A32] hover:text-white text-[#C85A32] border border-[#C85A32] rounded-xl py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} /> ADD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
