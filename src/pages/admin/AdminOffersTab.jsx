import React, { useEffect, useState, useRef } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Check,
  X,
  Percent,
  IndianRupee,
  Upload,
  RefreshCw,
  Award,
  Gift,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

const AdminOffersTab = () => {
  // Sub-tab: 'offers' (Seasonal) or 'milestones' (Check-In Visit Rewards)
  const [activeTab, setActiveTab] = useState('milestones'); // Default to milestones so client sees it immediately!

  // ---------------- SEASONAL OFFERS STATE ----------------
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    discountType: 'percentage',
    discountValue: '',
    couponCode: '',
    minimumOrderAmount: '',
    maxDiscountAmount: '',
    endDate: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ---------------- CHECK-IN MILESTONES STATE (CLIENT DYNAMIC) ----------------
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({
    visitNumber: 1,
    title: '',
    discountType: 'percentage',
    discountValue: '',
    couponCode: '',
    minimumOrderAmount: '',
    maxDiscountAmount: '',
    description: '',
    isActive: true
  });
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [milestoneError, setMilestoneError] = useState('');

  // Fetch seasonal offers
  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/offers');
      if (res.data.success) {
        setOffers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin offers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch check-in milestones
  const fetchMilestones = async () => {
    try {
      setLoadingMilestones(true);
      const res = await api.get('/admin/checkin-milestones');
      if (res.data.success) {
        setMilestones(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching check-in milestones:', err);
    } finally {
      setLoadingMilestones(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchMilestones();
  }, []);

  // ---------------- SEASONAL OFFERS HANDLERS ----------------
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      setError('');
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'aaj_kal_cafe/offers');

      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.data.url }));
      } else {
        throw new Error(res.data?.message || 'Failed to upload offer banner');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error uploading banner image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openAddModal = () => {
    setEditingOffer(null);
    const inOneMonth = new Date();
    inOneMonth.setMonth(inOneMonth.getMonth() + 1);

    setFormData({
      title: '',
      description: '',
      image: '',
      discountType: 'percentage',
      discountValue: '',
      couponCode: '',
      minimumOrderAmount: '',
      maxDiscountAmount: '',
      endDate: inOneMonth.toISOString().split('T')[0],
      isActive: true
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      image: offer.image || '',
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      couponCode: offer.couponCode || '',
      minimumOrderAmount: offer.minimumOrderAmount || '',
      maxDiscountAmount: offer.maxDiscountAmount || '',
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
      isActive: offer.isActive
    });
    setError('');
    setShowModal(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (Number(formData.discountValue) <= 0) {
      setError('Discount value must be greater than zero.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      if (editingOffer) {
        const res = await api.patch(`/admin/offers/${editingOffer._id}`, formData);
        if (res.data.success) {
          setShowModal(false);
          fetchOffers();
        }
      } else {
        const res = await api.post('/admin/offers', formData);
        if (res.data.success) {
          setShowModal(false);
          fetchOffers();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOffer = async (offer) => {
    if (!window.confirm(`Are you sure you want to delete offer "${offer.title}"?`)) return;
    try {
      const res = await api.delete(`/admin/offers/${offer._id}`);
      if (res.data.success) {
        setOffers((prev) => prev.filter((o) => o._id !== offer._id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete offer');
    }
  };

  const handleToggleOffer = async (offer) => {
    try {
      const res = await api.patch(`/admin/offers/${offer._id}`, {
        isActive: !offer.isActive
      });
      if (res.data.success) {
        setOffers((prev) =>
          prev.map((o) => (o._id === offer._id ? { ...o, isActive: !offer.isActive } : o))
        );
      }
    } catch (err) {
      alert('Failed to toggle offer status');
    }
  };

  // ---------------- CHECK-IN MILESTONES HANDLERS ----------------
  const openAddMilestoneModal = () => {
    setEditingMilestone(null);
    setMilestoneForm({
      visitNumber: 1,
      title: '',
      discountType: 'percentage',
      discountValue: '',
      couponCode: '',
      minimumOrderAmount: '',
      maxDiscountAmount: '',
      description: '',
      isActive: true
    });
    setMilestoneError('');
    setShowMilestoneModal(true);
  };

  const openEditMilestoneModal = (m) => {
    setEditingMilestone(m);
    setMilestoneForm({
      visitNumber: m.visitNumber,
      title: m.title,
      discountType: m.discountType,
      discountValue: m.discountValue,
      couponCode: m.couponCode,
      minimumOrderAmount: m.minimumOrderAmount || '',
      maxDiscountAmount: m.maxDiscountAmount || '',
      description: m.description || '',
      isActive: m.isActive
    });
    setMilestoneError('');
    setShowMilestoneModal(true);
  };

  const handleSaveMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.visitNumber || !milestoneForm.title || !milestoneForm.couponCode) {
      setMilestoneError('Visit number, title, and coupon code are required.');
      return;
    }
    if (Number(milestoneForm.discountValue) <= 0) {
      setMilestoneError('Discount value must be greater than zero.');
      return;
    }

    try {
      setSavingMilestone(true);
      setMilestoneError('');
      if (editingMilestone) {
        const res = await api.patch(`/admin/checkin-milestones/${editingMilestone._id}`, milestoneForm);
        if (res.data.success) {
          setShowMilestoneModal(false);
          fetchMilestones();
        }
      } else {
        const res = await api.post('/admin/checkin-milestones', milestoneForm);
        if (res.data.success) {
          setShowMilestoneModal(false);
          fetchMilestones();
        }
      }
    } catch (err) {
      setMilestoneError(err.response?.data?.message || 'Failed to save milestone offer');
    } finally {
      setSavingMilestone(false);
    }
  };

  const handleToggleMilestone = async (m) => {
    try {
      const res = await api.patch(`/admin/checkin-milestones/${m._id}`, {
        isActive: !m.isActive
      });
      if (res.data.success) {
        setMilestones((prev) =>
          prev.map((item) => (item._id === m._id ? { ...item, isActive: !m.isActive } : item))
        );
      }
    } catch (err) {
      alert('Failed to update milestone status');
    }
  };

  const handleDeleteMilestone = async (m) => {
    if (!window.confirm(`Are you sure you want to delete milestone for Visit #${m.visitNumber}?`))
      return;
    try {
      const res = await api.delete(`/admin/checkin-milestones/${m._id}`);
      if (res.data.success) {
        setMilestones((prev) => prev.filter((item) => item._id !== m._id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete milestone');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DCD3] pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#2C1810]">Offers & Customer Rewards</h2>
          <p className="text-xs text-[#7A685D] mt-0.5">
            Client panel: Manage both seasonal promo coupons and dynamic visit check-in rewards.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-[#FAF7F2] p-1 rounded-2xl border border-[#E6DCD3] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'milestones'
                ? 'bg-[#C85A32] text-white shadow-xs'
                : 'text-[#7A685D] hover:text-[#2C1810]'
            }`}
          >
            <Award size={15} /> Check-In Milestones
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'offers'
                ? 'bg-[#4A2C18] text-white shadow-xs'
                : 'text-[#7A685D] hover:text-[#2C1810]'
            }`}
          >
            <Tag size={15} /> Seasonal Offers
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CHECK-IN MILESTONES (CLIENT DYNAMIC CONTROL) */}
      {/* ========================================================= */}
      {activeTab === 'milestones' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-[#E6DCD3] p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5EFEB] pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#2C1810]">
                  Customer Visit Milestones
                </h3>
              </div>

              <button
                onClick={openAddMilestoneModal}
                className="text-xs bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus size={15} /> Add Visit Milestone
              </button>
            </div>

            {loadingMilestones ? (
              <div className="py-14 text-center">
                <div className="w-8 h-8 border-3 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-3 text-xs text-[#7A685D]">Loading check-in milestones...</p>
              </div>
            ) : milestones.length === 0 ? (
              <div className="p-10 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E6DCD3]">
                <Award size={36} className="mx-auto text-[#7A685D]/60 mb-2" />
                <h4 className="text-sm font-bold text-[#2C1810]">No milestones configured</h4>
                <p className="text-xs text-[#7A685D] mt-1">
                  Add milestone rewards for Visit #1, Visit #3, Visit #5, etc.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {milestones.map((m) => (
                  <div
                    key={m._id}
                    className={`rounded-2xl border p-4.5 space-y-3.5 flex flex-col justify-between transition ${
                      m.isActive ? 'bg-white border-[#E6DCD3] shadow-2xs' : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4A2C18] to-[#2C1810] text-white flex items-center justify-center font-black text-xs shadow-xs">
                            #{m.visitNumber}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm text-[#2C1810]">{m.title}</h4>
                            <span className="text-[11px] font-bold text-[#C85A32]">
                              Visit #{m.visitNumber} Milestone
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {m.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DCD3] space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[#7A685D]">Discount:</span>
                          <span className="font-extrabold text-[#C85A32]">
                            {m.discountType === 'percentage'
                              ? `${m.discountValue}% OFF`
                              : `₹${m.discountValue} FLAT OFF`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#7A685D]">Coupon Code:</span>
                          <span className="font-mono font-bold text-[#2C1810] bg-white px-2 py-0.5 rounded border border-[#E6DCD3]">
                            {m.couponCode}
                          </span>
                        </div>
                        {m.minimumOrderAmount > 0 && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-[#7A685D]">Min Order:</span>
                            <span className="font-medium text-[#2C1810]">
                              ₹{m.minimumOrderAmount}
                            </span>
                          </div>
                        )}
                      </div>

                      {m.description && (
                        <p className="text-[11px] text-[#7A685D] leading-relaxed">
                          {m.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#F5EFEB] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleMilestone(m)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                          m.isActive
                            ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {m.isActive ? 'Disable' : 'Enable'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditMilestoneModal(m)}
                          className="p-1.5 text-[#4A2C18] hover:bg-[#FAF7F2] rounded-lg border border-[#E6DCD3] transition"
                          title="Edit Milestone"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(m)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition"
                          title="Delete Milestone"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SEASONAL BANNER OFFERS */}
      {/* ========================================================= */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#2C1810]">Active Seasonal Offers</h3>
              <p className="text-xs text-[#7A685D]">
                Promotional cafe deals, discount banners, and table coupons.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="text-xs bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus size={15} /> Create Offer
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-[#4A2C18] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-xs text-[#7A685D]">Loading promotions...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DCD3]">
              <Tag size={40} className="mx-auto text-[#7A685D]/60 mb-2" />
              <h3 className="text-base font-bold text-[#2C1810]">No offers created yet</h3>
              <p className="text-xs text-[#7A685D] mt-1">
                Create coupon deals to attract more table orders.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className={`bg-white rounded-3xl border p-4 space-y-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition ${
                    offer.isActive ? 'border-[#E6DCD3]' : 'border-stone-300 opacity-60'
                  }`}
                >
                  <div>
                    {offer.image && (
                      <div className="h-32 rounded-2xl overflow-hidden mb-3 relative bg-[#FAF7F2]">
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#C85A32] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {offer.discountType === 'percentage'
                            ? `${offer.discountValue}% OFF`
                            : `₹${offer.discountValue} FLAT OFF`}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#2C1810]">{offer.title}</h4>
                        <p className="text-xs text-[#7A685D] mt-1 line-clamp-2 leading-relaxed">
                          {offer.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleOffer(offer)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition shrink-0 ${
                          offer.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {offer.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>

                    <div className="mt-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DCD3] space-y-1 text-xs">
                      {offer.couponCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#7A685D]">Coupon:</span>
                          <span className="font-mono font-bold text-[#C85A32]">{offer.couponCode}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-[#7A685D]">Min Order:</span>
                        <span className="font-semibold text-[#2C1810]">
                          ₹{offer.minimumOrderAmount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-[#7A685D]">
                        <span>Expires:</span>
                        <span>{new Date(offer.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[#F5EFEB]">
                    <button
                      onClick={() => openEditModal(offer)}
                      className="flex-1 bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#E6DCD3] text-[#4A2C18] font-bold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offer)}
                      className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                      title="Delete Offer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CHECK-IN MILESTONE ADD / EDIT */}
      {/* ========================================================= */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#E6DCD3] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FAF7F2] text-[#C85A32] border border-[#E6DCD3]">
                  <Award size={18} />
                </span>
                <h3 className="text-base font-extrabold text-[#2C1810]">
                  {editingMilestone ? `Edit Visit #${milestoneForm.visitNumber} Milestone` : 'New Visit Milestone'}
                </h3>
              </div>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="text-[#7A685D] hover:text-[#2C1810] p-1"
              >
                <X size={18} />
              </button>
            </div>

            {milestoneError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {milestoneError}
              </div>
            )}

            <form onSubmit={handleSaveMilestone} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">
                    Visit Target Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={milestoneForm.visitNumber}
                    onChange={(e) =>
                      setMilestoneForm({ ...milestoneForm, visitNumber: Number(e.target.value) })
                    }
                    placeholder="e.g. 1, 3, 5, 7, 10"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={milestoneForm.couponCode}
                    onChange={(e) =>
                      setMilestoneForm({
                        ...milestoneForm,
                        couponCode: e.target.value.toUpperCase()
                      })
                    }
                    placeholder="e.g. PRIME10, VISIT3"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">
                  Milestone Reward Title *
                </label>
                <input
                  type="text"
                  required
                  value={milestoneForm.title}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, title: e.target.value })
                  }
                  placeholder="e.g. Coffee Perk, Mega Foodie Treat"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Discount Type</label>
                  <select
                    value={milestoneForm.discountType}
                    onChange={(e) =>
                      setMilestoneForm({ ...milestoneForm, discountType: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={milestoneForm.discountValue}
                    onChange={(e) =>
                      setMilestoneForm({ ...milestoneForm, discountValue: e.target.value })
                    }
                    placeholder={milestoneForm.discountType === 'percentage' ? 'e.g. 15' : 'e.g. 200'}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={milestoneForm.minimumOrderAmount}
                    onChange={(e) =>
                      setMilestoneForm({ ...milestoneForm, minimumOrderAmount: e.target.value })
                    }
                    placeholder="e.g. 200"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Max Cap (₹, for %)</label>
                  <input
                    type="number"
                    min="0"
                    value={milestoneForm.maxDiscountAmount}
                    onChange={(e) =>
                      setMilestoneForm({ ...milestoneForm, maxDiscountAmount: e.target.value })
                    }
                    placeholder="e.g. 150"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">Description / Benefit</label>
                <textarea
                  rows="2"
                  value={milestoneForm.description}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, description: e.target.value })
                  }
                  placeholder="e.g. 15% off on artisanal hot & cold brews above ₹200 on 3rd visit."
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="milestoneActive"
                  checked={milestoneForm.isActive}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, isActive: e.target.checked })
                  }
                  className="rounded text-[#C85A32] focus:ring-[#C85A32]"
                />
                <label htmlFor="milestoneActive" className="text-xs text-[#2C1810] font-semibold">
                  Active (Customer roadmap me show hoga)
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#F5EFEB]">
                <button
                  type="submit"
                  disabled={savingMilestone}
                  className="flex-1 bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold py-2.5 rounded-xl transition shadow-xs text-xs"
                >
                  {savingMilestone ? 'Saving Milestone...' : 'Save Milestone'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 text-[#7A685D] border border-[#E6DCD3] rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: SEASONAL OFFER ADD / EDIT */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-[#E6DCD3] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-3">
              <h3 className="text-base font-extrabold text-[#2C1810]">
                {editingOffer ? 'Edit Seasonal Offer' : 'Create Seasonal Cafe Offer'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#7A685D] hover:text-[#2C1810] p-1"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveOffer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Flat 20% Off Weekend Special"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">Description *</label>
                <textarea
                  required
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Valid on all dine-in table orders above ₹300."
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 100'}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) =>
                      setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. PRIME20"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minimumOrderAmount: e.target.value })
                    }
                    placeholder="e.g. 300"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Max Cap (₹, for %)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="e.g. 150"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">Banner Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {formData.image ? (
                  <div className="relative mb-2 rounded-xl overflow-hidden border border-[#E6DCD3] h-28 bg-[#FAF7F2]">
                    <img
                      src={formData.image}
                      alt="Offer Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex-1 bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#E6DCD3] text-[#4A2C18] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
                  >
                    {uploadingImage ? (
                      <>
                        <RefreshCw size={14} className="animate-spin text-[#C85A32]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} className="text-[#C85A32]" />
                        <span>Upload from Device</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="or paste online image URL..."
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl text-xs focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#F5EFEB]">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold py-2.5 rounded-xl transition shadow-xs text-xs"
                >
                  {saving ? 'Publishing Offer...' : 'Save Offer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 text-[#7A685D] border border-[#E6DCD3] rounded-xl text-xs"
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

export default AdminOffersTab;
