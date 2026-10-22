import React, { useEffect, useState, useRef } from 'react';
import { Tag, Plus, Edit2, Trash2, Calendar, Sparkles, Check, X, Percent, IndianRupee, Upload, RefreshCw, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const AdminOffersTab = () => {
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

  useEffect(() => {
    fetchOffers();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#2C1810]">Offers & Deals Management</h2>
          <p className="text-xs text-[#7A685D] mt-0.5">
            Configure promotions, coupon codes, percentage/fixed discounts, and valid date ranges.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="text-xs bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={15} /> Create Offer
        </button>
      </div>

      {/* Offers Cards */}
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

                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-[#2C1810] leading-snug">{offer.title}</h3>
                  <button
                    onClick={() => handleToggleOffer(offer)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                      offer.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {offer.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>

                <p className="text-xs text-[#7A685D] mt-1 line-clamp-2 leading-relaxed">
                  {offer.description}
                </p>

                {offer.couponCode && (
                  <div className="mt-2.5 inline-block bg-[#FAF7F2] border border-dashed border-[#C85A32] px-2 py-0.5 rounded-md text-xs font-mono font-bold text-[#C85A32]">
                    Code: {offer.couponCode}
                  </div>
                )}

                <div className="mt-2 text-[11px] text-[#7A685D] space-y-0.5">
                  {offer.minimumOrderAmount > 0 && (
                    <p>Min order: ₹{offer.minimumOrderAmount}</p>
                  )}
                  <p>Expiry: {new Date(offer.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-[#F5EFEB] flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => openEditModal(offer)}
                  className="p-1.5 text-[#7A685D] hover:text-[#4A2C18] hover:bg-[#FAF7F2] rounded-lg transition"
                  title="Edit Offer"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDeleteOffer(offer)}
                  className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Offer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT OFFER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-3">
              <h3 className="font-bold text-sm text-[#2C1810]">
                {editingOffer ? 'Edit Promotion' : 'Create New Offer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#7A685D]">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveOffer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">Offer Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Weekend Cappuccino Delight"
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A2C18] mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details and conditions of the offer..."
                  rows="2"
                  required
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="e.g. 20 or 100"
                    required
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Coupon Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. PRIME20"
                    className="w-full uppercase font-mono p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                    placeholder="0"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A2C18] mb-1">Max Cap (₹, for %)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="0 for uncapped"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
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
                    <img src={formData.image} alt="Offer Preview" className="w-full h-full object-cover" />
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
                  className="flex-1 bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold py-2.5 rounded-xl transition shadow-xs"
                >
                  {saving ? 'Publishing Offer...' : 'Save Offer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 text-[#7A685D] border border-[#E6DCD3] rounded-xl"
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
