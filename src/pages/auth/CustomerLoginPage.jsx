import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  Utensils,
  QrCode,
  Sparkles,
  AlertCircle,
  UserCheck,
  Leaf,
  Drumstick
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const CustomerLoginPage = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/home';
  const tableParam = searchParams.get('table');

  const { register, googleLogin, logout, updateCurrentUser } = useAuth();
  const { setTable } = useCart();
  const navigate = useNavigate();

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '970179278240-9ov5n9q46vg5p5ejhaa2c3fnps85g38p.apps.googleusercontent.com';
  const googleBtnContainerRef = useRef(null);
  const [gisRendered, setGisRendered] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showConfigNotice, setShowConfigNotice] = useState(false);

  // Flow Step: 'login' (Google sign-in only) -> 'details' (Customer details form)
  const [step, setStep] = useState('login');
  const [googleAccount, setGoogleAccount] = useState(null);

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
  const [foodPreference, setFoodPreference] = useState('Veg'); // 'Veg', 'Non Veg'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuccessfulEntry = () => {
    const target = redirect || '/home';
    if (tableParam) {
      navigate(`${target}${target.includes('?') ? '&' : '?'}table=${encodeURIComponent(tableParam)}`);
    } else {
      navigate(target);
    }
  };

  // Google Credential Callback from Google Identity Services
  const handleGoogleCredentialResponse = async (response) => {
    try {
      setGoogleLoading(true);
      setError('');
      const res = await googleLogin({
        credential: response.credential,
        table: tableParam || '',
        foodPreference
      });
      if (res && res.success) {
        const loggedUser = res.user;
        setGoogleAccount(loggedUser);
        if (loggedUser?.name) setName(loggedUser.name);
        if (loggedUser?.phone) setPhone(loggedUser.phone);
        if (loggedUser?.area) setArea(loggedUser.area);
        if (loggedUser?.city) setCity(loggedUser.city);
        if (loggedUser?.pincode) setPincode(loggedUser.pincode);
        if (loggedUser?.foodPreference) setFoodPreference(loggedUser.foodPreference);
        // Switch to the form immediately after Google sign-in
        setStep('details');
      } else {
        setError(res?.message || 'Google login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication error. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    if (!googleClientId || step !== 'login') return;

    const interval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'left',
            width: googleBtnContainerRef.current.offsetWidth || 320
          });

          setGisRendered(true);
        } catch (err) {
          console.warn('GIS initialize error:', err);
        }
      }
    }, 200);

    const timeout = setTimeout(() => clearInterval(interval), 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [googleClientId, step, foodPreference, tableParam]);

  // Click handler for fallback button
  const handleGoogleClick = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        window.google.accounts.id.prompt();
      } catch (e) {
        console.warn('Google prompt error:', e);
      }
    } else {
      setShowConfigNotice(true);
    }
  };

  // Demo Google Login for testing before OAuth Client ID is configured
  const handleDemoGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      setShowConfigNotice(false);
      const res = await googleLogin({
        name: 'Guest Customer',
        email: `guest_${Date.now().toString().slice(-4)}@gmail.com`,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        table: tableParam || '',
        foodPreference
      });
      if (res && res.success) {
        const loggedUser = res.user;
        setGoogleAccount(loggedUser);
        setName(loggedUser?.name || 'Guest Customer');
        setStep('details');
      } else {
        setError(res?.message || 'Demo login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Form Submission after Google Login
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
        foodPreference,
        table: tableParam || ''
      };

      const token = localStorage.getItem('akc_token');
      if (token) {
        const res = await api.patch('/profile', payload);
        if (res.data?.success) {
          if (updateCurrentUser) {
            updateCurrentUser(res.data.data);
          }
          handleSuccessfulEntry();
        } else {
          setError(res.data?.message || 'Failed to update profile details');
        }
      } else {
        const res = await register(payload);
        if (res.success) {
          handleSuccessfulEntry();
        } else {
          setError(res.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6">

      {/* ============================================================== */}
      {/* STEP 1: INITIAL GOOGLE SIGN IN SCREEN                          */}
      {/* ============================================================== */}
      {step === 'login' && (
        <>
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mx-auto shadow-lg ring-2 ring-[#C85A32]/30 bg-black flex items-center justify-center">
              <img src="/logo.png" alt="The Prime Cafe Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#2C1810] tracking-tight">
              Welcome to The Prime Cafe
            </h2>
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

          {/* Google Setup Guide / Demo Notice Modal */}
          {showConfigNotice && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Google Client ID Setup Required</p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Google Login ko live chalane ke liye frontend <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">.env</code> file me <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">VITE_GOOGLE_CLIENT_ID</code> add karein.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDemoGoogleLogin}
                  disabled={googleLoading}
                  className="px-3.5 py-2 bg-[#4A2C18] text-white rounded-xl font-bold hover:bg-[#381F10] transition text-[11px] cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles size={13} />
                  {googleLoading ? 'Logging in...' : 'Test Demo Google Login Now'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigNotice(false)}
                  className="px-3 py-2 bg-transparent text-amber-800 rounded-xl font-semibold hover:bg-amber-100/60 transition text-[11px] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Google Sign In Card */}
          <div className="bg-white rounded-3xl border border-[#E6DCD3] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="text-center space-y-3">
              {/* Official Google Identity Services Container */}
              <div
                ref={googleBtnContainerRef}
                id="googleSignInContainer"
                className={`flex justify-center w-full min-h-[44px] ${gisRendered ? 'block' : 'hidden'}`}
              ></div>

              {/* Premium Branded Google Button */}
              {!gisRendered && (
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={googleLoading}
                  className="inline-flex items-center justify-center gap-2.5 py-2.5 px-6 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-[#2C1810] font-bold text-xs sm:text-sm border-2 border-[#E6DCD3] hover:border-[#4A2C18]/40 rounded-full shadow-xs transition cursor-pointer mx-auto"
                >
                  <GoogleIcon />
                  <span>{googleLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* STEP 2: CUSTOMER DETAILS FORM (OPENS RIGHT AFTER GOOGLE LOGIN) */}
      {/* ============================================================== */}
      {step === 'details' && (
        <>
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mx-auto shadow-md ring-2 ring-[#C85A32]/30 bg-black flex items-center justify-center">
              <img src="/logo.png" alt="The Prime Cafe Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1810] tracking-tight">
              Complete Your Registration
            </h2>
          </div>

          {/* Google Account Profile Chip (Small, Centered, No Switch) */}
          {googleAccount && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#E6DCD3] rounded-full px-3.5 py-1.5 shadow-2xs">
                {googleAccount.profileImage ? (
                  <img
                    src={googleAccount.profileImage}
                    alt={googleAccount.name || 'User'}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    <UserCheck size={12} />
                  </div>
                )}
                <span className="text-xs font-bold text-[#2C1810] truncate max-w-[220px]">
                  {googleAccount.email || googleAccount.name}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200">
              {error}
            </div>
          )}

          {/* Details Form Card */}
          <div className="bg-white rounded-3xl border border-[#E6DCD3] p-6 sm:p-8 shadow-xs">
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

              {/* 3. Area / Locality */}
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

              {/* 4. City & 5. Pincode (Adjusted into a single line) */}
              <div className="grid grid-cols-2 gap-3.5">
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

              {/* FOOD CHOOSE: Veg, Non Veg */}
              <div className="pt-2">
                <label className="block font-extrabold text-[#4A2C18] mb-2 flex items-center gap-1.5">
                  <Utensils size={16} className="text-[#C85A32]" />
                  Food Choose (Dietary Preference)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Veg */}
                  <button
                    type="button"
                    onClick={() => setFoodPreference('Veg')}
                    className={`py-2.5 px-3 rounded-2xl border flex items-center justify-center gap-2 transition cursor-pointer ${
                      foodPreference === 'Veg'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold shadow-xs'
                        : 'border-[#E6DCD3] bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition shrink-0 ${
                      foodPreference === 'Veg'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Leaf size={13} className="stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold">Veg</span>
                  </button>

                  {/* Non Veg */}
                  <button
                    type="button"
                    onClick={() => setFoodPreference('Non Veg')}
                    className={`py-2.5 px-3 rounded-2xl border flex items-center justify-center gap-2 transition cursor-pointer ${
                      foodPreference === 'Non Veg'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-extrabold shadow-xs'
                        : 'border-[#E6DCD3] bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition shrink-0 ${
                      foodPreference === 'Non Veg'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      <Drumstick size={13} className="stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold">Non Veg</span>
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
        </>
      )}

    </div>
  );
};

export default CustomerLoginPage;
