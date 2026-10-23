import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Coffee,
  Check,
  ArrowRight,
  Utensils,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CustomerLoginPage = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/menu';
  const tableParam = searchParams.get('table');

  const { register } = useAuth();
  const { setTable } = useCart();
  const navigate = useNavigate();

  // If table parameter is present (from scanning table QR), auto-link it
  useEffect(() => {
    if (tableParam) {
      const clean = tableParam.trim();
      setTable({
        number: clean,
        name: clean.toLowerCase().startsWith('table') ? clean : `Table ${clean}`
      });
    }
  }, [tableParam, setTable]);

  // Real Customer Details Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [foodPreference, setFoodPreference] = useState('Both'); // 'Veg', 'Non Veg', 'Both'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuccessfulEntry = () => {
    const target = redirect || '/menu';
    if (tableParam) {
      navigate(`${target}${target.includes('?') ? '&' : '?'}table=${encodeURIComponent(tableParam)}`);
    } else {
      navigate(target);
    }
  };

  // Handle Form Submission with real personal & food preference details
  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please provide your Full Name and Mobile Number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        area: area.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        foodPreference
      };

      const res = await register(payload);
      if (res.success) {
        handleSuccessfulEntry();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-[#4A2C18] text-[#FAF7F2] flex items-center justify-center mx-auto shadow-md">
          <Coffee size={28} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#2C1810] tracking-tight">
          Welcome to The Prime Cafe
        </h2>
        <p className="text-xs text-[#7A685D] max-w-sm mx-auto">
          Please enter your details to start browsing our menu and ordering from your table.
        </p>
      </div>

      {/* Table Scanned Notification Banner */}
      {tableParam && (
        <div className="bg-[#FAF7F2] border-2 border-[#C85A32]/40 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A2C18] text-white flex items-center justify-center font-bold shadow-xs">
              <QrCode size={20} className="text-[#FAF7F2]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#7A685D] uppercase tracking-wider">
                Table QR Scanned
              </p>
              <h4 className="text-sm sm:text-base font-extrabold text-[#2C1810]">
                {tableParam.toLowerCase().startsWith('table') ? tableParam : `Table ${tableParam}`}
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            <Check size={13} /> Table Linked
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200">
          {error}
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-[#E6DCD3] p-6 sm:p-8 shadow-xs space-y-5">
        <form onSubmit={handleSubmitDetails} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Name */}
            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">
                1. Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
                required
                className="w-full p-3 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            {/* 2. Mobile Number */}
            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">
                2. Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9812345678"
                required
                className="w-full p-3 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* 3. Area, 4. City, 5. Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">3. Area / Locality</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Swaroop Nagar"
                className="w-full p-3 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">4. City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kanpur"
                className="w-full p-3 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">5. Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 208002"
                className="w-full p-3 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* FOOD CHOOSE: Veg, Non Veg, Both */}
          <div className="pt-2">
            <label className="block font-extrabold text-[#4A2C18] mb-2 flex items-center gap-1.5">
              <Utensils size={16} className="text-[#C85A32]" />
              Food Choose (Dietary Preference)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Veg */}
              <button
                type="button"
                onClick={() => setFoodPreference('Veg')}
                className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  foodPreference === 'Veg'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold shadow-xs'
                    : 'border-[#E6DCD3] bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white shadow-2xs"></span>
                <span className="text-xs">Veg</span>
              </button>

              {/* Non Veg */}
              <button
                type="button"
                onClick={() => setFoodPreference('Non Veg')}
                className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  foodPreference === 'Non Veg'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-extrabold shadow-xs'
                    : 'border-[#E6DCD3] bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-white shadow-2xs"></span>
                <span className="text-xs">Non Veg</span>
              </button>

              {/* Both */}
              <button
                type="button"
                onClick={() => setFoodPreference('Both')}
                className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  foodPreference === 'Both'
                    ? 'border-[#4A2C18] bg-[#F5EFEB] text-[#2C1810] font-extrabold shadow-xs'
                    : 'border-[#E6DCD3] bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
                }`}
              >
                <span className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                </span>
                <span className="text-xs">Both (All Food)</span>
              </button>
            </div>
          </div>

          {/* Submit Button to proceed to Landing / Menu Page */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C85A32] hover:bg-[#B24E2A] text-white font-extrabold py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              {loading ? (
                'Saving & Entering Cafe...'
              ) : (
                <>
                  Enter Cafe & Start Ordering <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Staff Link */}
      <div className="text-center">
        <Link
          to="/admin/login"
          className="text-xs text-[#7A685D] hover:text-[#4A2C18] font-semibold underline"
        >
          Staff & Management Login →
        </Link>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
