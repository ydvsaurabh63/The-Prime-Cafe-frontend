import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, Check, AlertCircle, X, Image as ImageIcon, Upload, Camera, Link as LinkIcon, RefreshCw, ChevronDown, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { getCategoryPresetItems } from '../../data/categoryPresetItems';
import { getItemFallbackImage } from '../../utils/imageFallback';

// Helper to compress and convert image files to optimized Base64
const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (JPG, PNG, WEBP).'));
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to process image.'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
  });
};

const AdminMenuTab = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State for adding/editing item
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVeg: true,
    prepTime: '10-15 mins',
    tags: '',
    image: '',
    availability: true
  });

  // Gallery Upload state
  const [imageInputMode, setImageInputMode] = useState('gallery'); // 'gallery' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Modal State for adding category
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImg, setNewCatImg] = useState('');
  const [catImageMode, setCatImageMode] = useState('gallery');
  const [catUploading, setCatUploading] = useState(false);
  const catFileInputRef = useRef(null);

  // Inline Category State inside Item Modal
  const [showInlineNewCat, setShowInlineNewCat] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatLoading, setInlineCatLoading] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Predefined Item selection vs Custom text input
  const [showCustomItemName, setShowCustomItemName] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Selected category object & its predefined items
  const selectedCategoryObj = categories.find((c) => c._id === formData.category);
  const currentPresetItems = getCategoryPresetItems(selectedCategoryObj);

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
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryChange = (newCatId) => {
    const newCatObj = categories.find((c) => c._id === newCatId);
    const newPresets = getCategoryPresetItems(newCatObj);
    const isCurrentInNew = newPresets.some((p) => p.name === formData.name);

    setFormData((prev) => ({
      ...prev,
      category: newCatId,
      name: isCurrentInNew ? prev.name : ''
    }));

    if (newPresets.length > 0) {
      setShowCustomItemName(false);
    } else {
      setShowCustomItemName(true);
    }
  };

  const handlePresetItemSelect = (e) => {
    const selectedName = e.target.value;
    if (!selectedName) {
      setFormData((prev) => ({ ...prev, name: '' }));
      return;
    }
    const matched = currentPresetItems.find((p) => p.name === selectedName);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        name: matched.name,
        price: matched.price !== undefined ? String(matched.price) : prev.price,
        isVeg: matched.isVeg !== undefined ? matched.isVeg : prev.isVeg
      }));
    } else {
      setFormData((prev) => ({ ...prev, name: selectedName }));
    }
  };

  const handleQuickAddCategory = async (e) => {
    e?.preventDefault();
    if (!inlineCatName.trim()) return;
    try {
      setInlineCatLoading(true);
      const res = await api.post('/admin/categories', {
        name: inlineCatName.trim()
      });
      if (res.data?.success && res.data.data) {
        const newCat = res.data.data;
        setCategories((prev) => [...prev, newCat]);
        setFormData((prev) => ({ ...prev, category: newCat._id, name: '' }));
        setInlineCatName('');
        setShowInlineNewCat(false);
        setShowCustomItemName(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setInlineCatLoading(false);
    }
  };

  const openAddItemModal = () => {
    const defaultCatId = categories[0]?._id || '';
    const defaultCatObj = categories[0];
    const presets = getCategoryPresetItems(defaultCatObj);

    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: defaultCatId,
      isVeg: true,
      prepTime: '10-15 mins',
      tags: '',
      image: '',
      availability: true
    });
    setImageInputMode('gallery');
    setShowInlineNewCat(false);
    setInlineCatName('');
    setShowCustomItemName(presets.length === 0);
    setShowAdvancedOptions(false);
    setError('');
    setShowItemModal(true);
  };

  const openEditItemModal = (item) => {
    setEditingItem(item);
    const catId = item.category?._id || item.category;
    const catObj = categories.find((c) => c._id === catId);
    const presets = getCategoryPresetItems(catObj);
    const isPresetMatch = presets.some((p) => p.name.toLowerCase() === (item.name || '').toLowerCase());

    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: catId,
      isVeg: item.isVeg,
      prepTime: item.prepTime || '10-15 mins',
      tags: item.tags ? item.tags.join(', ') : '',
      image: item.image || '',
      availability: item.availability
    });
    setShowCustomItemName(!isPresetMatch);
    setImageInputMode(item.image?.startsWith('data:') ? 'gallery' : item.image ? 'url' : 'gallery');
    setShowInlineNewCat(false);
    setInlineCatName('');
    setShowAdvancedOptions(!!item.tags?.length);
    setError('');
    setShowItemModal(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      setError('');
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'aaj_kal_cafe/menu');

      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.data.url }));
      } else {
        throw new Error(res.data?.message || 'Failed to upload image');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCatImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCatUploading(true);
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'aaj_kal_cafe/categories');

      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.data?.url) {
        setNewCatImg(res.data.data.url);
      } else {
        throw new Error(res.data?.message || 'Failed to upload category image');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error uploading image');
    } finally {
      setCatUploading(false);
      if (catFileInputRef.current) catFileInputRef.current.value = '';
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (Number(formData.price) < 0) {
      setError('Price cannot be negative');
      return;
    }
    try {
      setSaving(true);
      setError('');
      if (editingItem) {
        // Update
        const res = await api.patch(`/admin/menu/${editingItem._id}`, formData);
        if (res.data.success) {
          setShowItemModal(false);
          fetchData();
        }
      } else {
        // Create
        const res = await api.post('/admin/menu', formData);
        if (res.data.success) {
          setShowItemModal(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) return;
    try {
      const res = await api.delete(`/admin/menu/${item._id}`);
      if (res.data.success) {
        setMenuItems((prev) => prev.filter((i) => i._id !== item._id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete item');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const res = await api.patch(`/admin/menu/${item._id}`, {
        availability: !item.availability
      });
      if (res.data.success) {
        setMenuItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, availability: !item.availability } : i))
        );
      }
    } catch (err) {
      alert('Could not update availability');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setSaving(true);
      const res = await api.post('/admin/categories', {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        image: newCatImg.trim()
      });
      if (res.data.success) {
        setShowCatModal(false);
        setNewCatName('');
        setNewCatDesc('');
        setNewCatImg('');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' ||
      item.category?._id === selectedCategory ||
      item.categorySlug === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#2C1810]">Menu Management</h2>
          <p className="text-xs text-[#7A685D] mt-0.5">
            Add items, update recipes, adjust pricing, toggle availability, and organize categories.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowCatModal(true)}
            className="text-xs bg-[#FAF7F2] border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#4A2C18] font-bold px-3 py-2 rounded-xl transition shadow-2xs"
          >
            + New Category
          </button>
          <button
            onClick={openAddItemModal}
            className="text-xs bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <Plus size={15} /> Add Menu Item
          </button>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E6DCD3] space-y-3 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A685D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by title or ingredients..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-[#4A2C18] text-white'
                : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
            }`}
          >
            All Categories ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat._id
                  ? 'bg-[#4A2C18] text-white'
                  : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Table / Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-md ring-2 ring-[#C85A32]/30 bg-black flex items-center justify-center animate-pulse mx-auto mb-3">
            <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
          </div>
          <div className="w-8 h-8 border-3 border-[#4A2C18] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs text-[#7A685D]">Loading menu items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DCD3]">
          <p className="font-bold text-sm text-[#2C1810]">No items found</p>
          <p className="text-xs text-[#7A685D] mt-1">Try modifying your search or add a new dish.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-3xl border p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs transition ${
                item.availability ? 'border-[#E6DCD3]' : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF7F2] flex-shrink-0 border border-[#E6DCD3]/60">
                  <img
                    src={item.image || getItemFallbackImage(item)}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getItemFallbackImage(item);
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    ></span>
                    <h4 className="font-bold text-xs text-[#2C1810] truncate">{item.name}</h4>
                  </div>
                  <p className="text-[11px] text-[#7A685D] mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-xs font-extrabold text-[#C85A32] mt-1">₹{item.price}</p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-2 border-t border-[#F5EFEB] flex items-center justify-between text-xs">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                    item.availability
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {item.availability ? 'In Stock' : 'Sold Out'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditItemModal(item)}
                    className="p-1.5 text-[#7A685D] hover:text-[#4A2C18] hover:bg-[#FAF7F2] rounded-lg transition"
                    title="Edit Item"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ITEM CREATE / EDIT MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-3">
              <h3 className="font-bold text-sm text-[#2C1810]">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-[#7A685D] hover:text-[#2C1810]"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              {/* 1. Category Selection & Quick Inline Category Creator */}
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E6DCD3]/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#4A2C18]">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowInlineNewCat(!showInlineNewCat)}
                    className="text-[11px] font-bold text-[#C85A32] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    {showInlineNewCat ? 'Choose existing' : '+ Add New Category'}
                  </button>
                </div>

                {showInlineNewCat ? (
                  <div className="flex gap-2 pt-0.5">
                    <input
                      type="text"
                      value={inlineCatName}
                      onChange={(e) => setInlineCatName(e.target.value)}
                      placeholder="e.g. Instant Hunger, Chinees, Combo..."
                      className="flex-1 p-2 bg-white border border-[#C85A32] rounded-xl focus:outline-none text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQuickAddCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      disabled={inlineCatLoading || !inlineCatName.trim()}
                      className="px-3.5 py-2 bg-[#C85A32] text-white rounded-xl font-bold text-xs hover:bg-[#B24E2A] transition disabled:opacity-50 shrink-0"
                    >
                      {inlineCatLoading ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32] font-semibold text-[#2C1810]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 2. Item Name (Predefined Dropdown like Category + Custom Item Option) */}
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E6DCD3]/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#4A2C18]">
                    Item Name <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomItemName(!showCustomItemName)}
                    className="text-[11px] font-bold text-[#C85A32] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    {showCustomItemName
                      ? (currentPresetItems.length > 0 ? 'Choose from list' : 'Type name')
                      : '+ Add Custom Item'}
                  </button>
                </div>

                {showCustomItemName || currentPresetItems.length === 0 ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Bun Maska, Egg Roll Double, Peri-Peri, Mojito..."
                      required
                      className="w-full p-2.5 bg-white border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32] font-semibold text-[#2C1810]"
                    />
                    {currentPresetItems.length === 0 && (
                      <p className="text-[11px] text-[#7A685D]">
                        No preset items for this category yet — enter custom name.
                      </p>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.name}
                    onChange={handlePresetItemSelect}
                    required
                    className="w-full p-2.5 bg-white border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32] font-semibold text-[#2C1810]"
                  >
                    <option value="">
                      Select Item ({currentPresetItems.length} items available)
                    </option>
                    {currentPresetItems.map((item, idx) => (
                      <option key={idx} value={item.name}>
                        {idx + 1}. {item.name} — ₹{item.price} ({item.isVeg ? 'Veg' : 'Non-Veg'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 3. Description Field */}
              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">
                  Description <span className="text-[#7A685D] font-normal text-[11px]">(Optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short notes about flavor, garnish, or ingredients..."
                  rows="2"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32] text-xs font-medium resize-none"
                ></textarea>
              </div>

              {/* 4. Price & Dietary Classification */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 49"
                    required
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32] font-bold text-sm text-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1.5">Dietary</label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="isVegRadio"
                        checked={formData.isVeg === true}
                        onChange={() => setFormData({ ...formData, isVeg: true })}
                        className="text-emerald-600 focus:ring-0"
                      />
                      <span className="font-bold text-emerald-800 flex items-center gap-1 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Veg
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="isVegRadio"
                        checked={formData.isVeg === false}
                        onChange={() => setFormData({ ...formData, isVeg: false })}
                        className="text-rose-600 focus:ring-0"
                      />
                      <span className="font-bold text-rose-800 flex items-center gap-1 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Non-Veg
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Availability Status */}
              <div className="flex items-center justify-between p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E6DCD3]/70">
                <span className="font-bold text-xs text-[#4A2C18]">Item Availability</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    className="w-4 h-4 text-[#C85A32] rounded"
                  />
                  <span className={`text-xs font-bold ${formData.availability ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {formData.availability ? 'In Stock (Active)' : 'Sold Out (Hidden)'}
                  </span>
                </label>
              </div>

              {/* 5. Food Image Selection: Gallery Upload or URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#4A2C18]">Item Photo (Optional)</label>
                  <div className="flex items-center bg-[#FAF7F2] p-0.5 rounded-lg border border-[#E6DCD3] text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('gallery')}
                      className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                        imageInputMode === 'gallery'
                          ? 'bg-white text-[#C85A32] shadow-2xs font-bold'
                          : 'text-[#7A685D] hover:text-[#2C1810]'
                      }`}
                    >
                      <Camera size={12} />
                      <span>Gallery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                        imageInputMode === 'url'
                          ? 'bg-white text-[#C85A32] shadow-2xs font-bold'
                          : 'text-[#7A685D] hover:text-[#2C1810]'
                      }`}
                    >
                      <LinkIcon size={12} />
                      <span>Web URL</span>
                    </button>
                  </div>
                </div>

                {imageInputMode === 'gallery' ? (
                  <div>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {formData.image ? (
                      /* Image Preview Container */
                      <div className="relative rounded-2xl border border-[#E6DCD3] p-2 bg-[#FAF7F2] flex items-center gap-3">
                        <img
                          src={formData.image}
                          alt="Item Preview"
                          className="w-16 h-16 rounded-xl object-cover border border-[#E6DCD3] shadow-xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#2C1810] truncate">
                            {formData.name || 'Photo Selected'}
                          </p>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            Photo ready
                          </span>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImage}
                              className="text-[11px] font-bold text-[#C85A32] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={11} className={uploadingImage ? 'animate-spin' : ''} />
                              Change Photo
                            </button>
                            <span className="text-[#E6DCD3]">|</span>
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={11} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Drag & drop / click to upload box */
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full border-2 border-dashed border-[#E6DCD3] hover:border-[#C85A32] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] rounded-2xl p-3.5 text-center transition group cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white text-[#C85A32] mx-auto flex items-center justify-center shadow-2xs group-hover:scale-110 transition mb-1.5">
                          {uploadingImage ? (
                            <RefreshCw size={18} className="animate-spin text-[#C85A32]" />
                          ) : (
                            <Upload size={18} />
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#2C1810]">
                          {uploadingImage ? 'Optimizing photo...' : 'Choose Photo (Optional)'}
                        </p>
                        <p className="text-[10px] text-[#7A685D] mt-0.5">
                          Tap to select photo • JPG, PNG, WEBP
                        </p>
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32] text-xs font-mono"
                    />
                    {formData.image && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={formData.image}
                          alt="URL Preview"
                          className="w-10 h-10 rounded-lg object-cover border"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-[11px] text-[#7A685D]">Image URL linked</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 6. Optional Collapsible Details: Prep Time, Tags */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-[11px] font-bold text-[#7A685D] hover:text-[#C85A32] flex items-center gap-1 cursor-pointer transition"
                >
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showAdvancedOptions ? 'rotate-180' : ''}`} />
                  <span>{showAdvancedOptions ? 'Hide Prep Time & Tags' : '+ Add Prep Time or Tags (Optional)'}</span>
                </button>

                {showAdvancedOptions && (
                  <div className="space-y-3 pt-2.5 pl-3 border-l-2 border-[#E6DCD3] mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#7A685D] mb-1">Prep Time</label>
                        <input
                          type="text"
                          value={formData.prepTime}
                          onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                          placeholder="e.g. 10-15 mins"
                          className="w-full p-2 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#7A685D] mb-1">Tags</label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="Bestseller, Hot, Special"
                          className="w-full p-2 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#F5EFEB]">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold py-2.5 rounded-xl transition shadow-xs"
                >
                  {saving ? 'Saving Item...' : 'Save Menu Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 text-[#7A685D] border border-[#E6DCD3] rounded-xl hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-2">
              <h3 className="font-bold text-sm text-[#2C1810]">Create Menu Category</h3>
              <button onClick={() => setShowCatModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Mocktails & Coolers"
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">Short Description</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Refreshing beverages and ice fusions"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* Category Image Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#4A2C18]">Category Photo</label>
                  <div className="flex items-center bg-[#FAF7F2] p-0.5 rounded-lg border border-[#E6DCD3] text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setCatImageMode('gallery')}
                      className={`px-2 py-0.5 rounded transition flex items-center gap-1 ${
                        catImageMode === 'gallery'
                          ? 'bg-white text-[#C85A32] shadow-2xs font-bold'
                          : 'text-[#7A685D]'
                      }`}
                    >
                      <Camera size={11} />
                      <span>Gallery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatImageMode('url')}
                      className={`px-2 py-0.5 rounded transition flex items-center gap-1 ${
                        catImageMode === 'url'
                          ? 'bg-white text-[#C85A32] shadow-2xs font-bold'
                          : 'text-[#7A685D]'
                      }`}
                    >
                      <LinkIcon size={11} />
                      <span>URL</span>
                    </button>
                  </div>
                </div>

                {catImageMode === 'gallery' ? (
                  <div>
                    <input
                      ref={catFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCatImageFileChange}
                      className="hidden"
                    />

                    {newCatImg ? (
                      <div className="p-2 bg-[#FAF7F2] rounded-xl border border-[#E6DCD3] flex items-center gap-2">
                        <img
                          src={newCatImg}
                          alt="Category preview"
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-[#2C1810]">Cover Selected</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => catFileInputRef.current?.click()}
                              className="text-[10px] text-[#C85A32] font-bold hover:underline cursor-pointer"
                            >
                              Change
                            </button>
                            <span className="text-[#E6DCD3]">|</span>
                            <button
                              type="button"
                              onClick={() => setNewCatImg('')}
                              className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => catFileInputRef.current?.click()}
                        disabled={catUploading}
                        className="w-full border-2 border-dashed border-[#E6DCD3] hover:border-[#C85A32] rounded-xl p-3 text-center bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] transition cursor-pointer"
                      >
                        <Upload size={16} className="mx-auto text-[#C85A32] mb-1" />
                        <span className="text-[11px] font-bold text-[#2C1810] block">
                          {catUploading ? 'Processing...' : 'Choose from Gallery'}
                        </span>
                      </button>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={newCatImg}
                    onChange={(e) => setNewCatImg(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32] font-mono text-xs"
                  />
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold py-2 rounded-xl transition"
                >
                  Create Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-3 border border-[#E6DCD3] rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenuTab;
