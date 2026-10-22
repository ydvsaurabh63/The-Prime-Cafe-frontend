import React, { useEffect, useState } from 'react';
import { Search, Plus, Minus, Check, Clock, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

const MenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const { cartItems, addToCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, menuRes] = await Promise.all([
          api.get('/categories'),
          api.get('/menu')
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (menuRes.data.success) setMenuItems(menuRes.data.data);
      } catch (err) {
        console.error('Failed to load menu data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dietary filter: 'all', 'veg', 'non-veg'
  const [dietaryFilter, setDietaryFilter] = useState('all');

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.categorySlug === selectedCategory ||
      item.category?._id === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    let matchesDiet = true;
    if (dietaryFilter === 'veg') matchesDiet = item.isVeg === true;
    if (dietaryFilter === 'non-veg') matchesDiet = item.isVeg === false;

    return matchesCategory && matchesSearch && matchesDiet;
  });

  const getItemQuantityInCart = (itemId) => {
    const found = cartItems.find((i) => i._id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner on Full Screen / Desktop */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3D2314] via-[#4A2C18] to-[#2C1810] text-[#FAF7F2] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#C85A32] text-white shadow-2xs mb-2">
            <Sparkles size={12} /> The Prime Artisanal Roastery
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Handcrafted Coffee & Comfort Food
          </h2>
          <p className="text-xs sm:text-sm text-[#E6DCD3] mt-2 leading-relaxed">
            Freshly brewed single-origin beans, woodfired sourdough pizzas, and gourmet treats handcrafted with love.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E6DCD3] shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A685D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by beverage, ingredients, or bakery item..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl text-xs sm:text-sm placeholder-[#7A685D] focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          {/* Dedicated Veg & Non-Veg Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-2xl border border-[#E6DCD3] self-start md:self-auto">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                dietaryFilter === 'all'
                  ? 'bg-white text-[#2C1810] shadow-xs'
                  : 'text-[#7A685D] hover:text-[#2C1810]'
              }`}
            >
              All Food
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:bg-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dietaryFilter === 'veg' ? 'bg-white' : 'bg-emerald-600'}`}></span>
              Vegetarian
            </button>
            <button
              onClick={() => setDietaryFilter('non-veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                dietaryFilter === 'non-veg'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-800 hover:bg-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dietaryFilter === 'non-veg' ? 'bg-white' : 'bg-rose-600'}`}></span>
              Non-Vegetarian
            </button>
          </div>
        </div>

        {/* Category Horizontal Pill Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#4A2C18] text-white shadow-xs'
                : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB] hover:text-[#4A2C18]'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-[#4A2C18] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB] hover:text-[#4A2C18]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Grid for Menu Items (1 col on mobile, 2 on tablet, 3 on desktop) */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs font-semibold text-[#7A685D]">Brewing and plating the cafe menu...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DCD3]">
          <p className="text-base font-bold text-[#2C1810]">No menu items found</p>
          <p className="text-xs text-[#7A685D] mt-1">Try another search keyword or switch categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((item) => {
            const qtyInCart = getItemQuantityInCart(item._id);

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-[#E6DCD3] p-4 flex gap-3.5 shadow-2xs hover:shadow-md transition-all group justify-between"
              >
                {/* Details Column */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className={`w-3 h-3 rounded-xs border flex items-center justify-center ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        ></span>
                      </span>

                      {item.tags && item.tags.length > 0 && (
                        <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-wider flex items-center gap-0.5">
                          <Sparkles size={10} /> {item.tags[0]}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#2C1810] leading-snug group-hover:text-[#C85A32] transition">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#7A685D] mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-extrabold text-base text-[#2C1810]">
                      ₹{item.price}
                    </span>
                    {item.prepTime && (
                      <span className="text-[11px] text-[#7A685D] flex items-center gap-1 font-medium">
                        <Clock size={12} /> {item.prepTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Image & Action Column */}
                <div className="w-28 flex flex-col items-center justify-between flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#FAF7F2] relative border border-[#E6DCD3]/60 group-hover:scale-102 transition">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Quantity Stepper / Add Button */}
                  <div className="w-24 sm:w-28 mt-2.5">
                    {qtyInCart > 0 ? (
                      <div className="flex items-center justify-between bg-[#F5EFEB] border border-[#C85A32] rounded-xl px-2 py-1 text-xs font-bold text-[#4A2C18] shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="hover:text-[#C85A32] p-0.5"
                        >
                          <Minus size={14} />
                        </button>
                        <span>{qtyInCart}</span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="hover:text-[#C85A32] p-0.5"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item, 1)}
                        className="w-full bg-[#FAF7F2] hover:bg-[#C85A32] hover:text-white text-[#C85A32] border border-[#C85A32] rounded-xl py-1.5 text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1"
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
