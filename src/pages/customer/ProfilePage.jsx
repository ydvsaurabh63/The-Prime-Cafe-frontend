import React, { useState } from 'react';
import { User, Award, Phone, Mail, Calendar, LogOut, Edit3, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const ProfilePage = () => {
  const { user, isAuthenticated, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="py-16 px-6 text-center bg-white rounded-3xl border border-[#E6DCD3] space-y-4 max-w-lg mx-auto shadow-2xs">
        <div className="w-16 h-16 rounded-full bg-[#F5EFEB] text-[#4A2C18] flex items-center justify-center mx-auto shadow-xs">
          <User size={30} />
        </div>
        <div>
          <h3 className="font-extrabold text-lg text-[#2C1810]">Sign in to The Prime Cafe</h3>
          <p className="text-xs sm:text-sm text-[#7A685D] mt-2 max-w-sm mx-auto leading-relaxed">
            Access your order history, earn reward points on every beverage, and personalize your dining experience.
          </p>
        </div>
        <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
          <Link
            to="/login"
            className="flex-1 bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold py-3 rounded-2xl text-xs transition shadow-xs text-center"
          >
            Sign In / Register
          </Link>
          <Link
            to="/admin/login"
            className="flex-1 bg-[#FAF7F2] hover:bg-[#F5EFEB] text-[#4A2C18] border border-[#E6DCD3] font-bold py-3 rounded-2xl text-xs transition text-center"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const res = await api.patch('/profile', { name, phone });
      if (res.data.success) {
        updateCurrentUser(res.data.data);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[#E6DCD3] p-5 sm:p-6 relative overflow-hidden shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#4A2C18] text-[#FAF7F2] font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-xs shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-base sm:text-lg text-[#2C1810] flex items-center gap-2 truncate">
                <span>{user.name}</span>
                {user.isVerified && (
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" title="Verified Guest" />
                )}
              </h2>
              <p className="text-xs text-[#7A685D] truncate">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E6DCD3] text-xs font-bold text-[#C85A32]">
                <Award size={14} className="shrink-0" /> {user.rewardPoints || 0} Cafe Reward Points
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="self-start sm:self-auto text-xs text-[#7A685D] hover:text-[#C85A32] px-3 py-1.5 flex items-center gap-1 bg-[#FAF7F2] rounded-xl border border-[#E6DCD3] font-semibold"
          >
            <Edit3 size={14} /> Edit
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 size={15} /> {message}
          </div>
        )}
      </div>

      {/* Edit Form or Account Info */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="bg-white rounded-3xl border border-[#E6DCD3] p-6 space-y-4">
          <h4 className="text-xs font-bold text-[#4A2C18] uppercase tracking-wider">
            Edit Information
          </h4>
          <div>
            <label className="block text-xs font-bold text-[#7A685D] mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full text-xs sm:text-sm p-3 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl focus:outline-none focus:border-[#C85A32]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7A685D] mb-1">Mobile Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full text-xs sm:text-sm p-3 bg-[#FAF7F2] border border-[#E6DCD3] rounded-2xl focus:outline-none focus:border-[#C85A32]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saveLoading}
              className="bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition"
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 text-xs text-[#7A685D] border border-[#E6DCD3] rounded-xl hover:bg-[#F5EFEB]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DCD3] divide-y divide-[#F5EFEB] text-xs sm:text-sm">
          <div className="p-4 sm:p-5 flex items-center justify-between">
            <span className="text-[#7A685D] flex items-center gap-2.5">
              <Phone size={16} className="text-[#C85A32]" /> Mobile Number
            </span>
            <span className="font-bold text-[#2C1810]">{user.phone}</span>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between">
            <span className="text-[#7A685D] flex items-center gap-2.5">
              <Mail size={16} className="text-[#C85A32]" /> Registered Email
            </span>
            <span className="font-bold text-[#2C1810]">{user.email}</span>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between">
            <span className="text-[#7A685D] flex items-center gap-2.5">
              <span className="text-[#C85A32] font-extrabold text-xs">📍</span> Location Details
            </span>
            <span className="font-bold text-[#2C1810]">
              {[user.area, user.city, user.pincode].filter(Boolean).join(', ') || 'Not specified'}
            </span>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between">
            <span className="text-[#7A685D] flex items-center gap-2.5">
              <span className="text-[#C85A32] font-extrabold text-xs">🍽️</span> Dietary Preference
            </span>
            <span className={`font-bold px-3 py-1 rounded-full text-xs ${
              user.foodPreference === 'Veg'
                ? 'bg-emerald-100 text-emerald-800'
                : user.foodPreference === 'Non Veg'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {user.foodPreference || 'Both'}
            </span>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between">
            <span className="text-[#7A685D] flex items-center gap-2.5">
              <Calendar size={16} className="text-[#C85A32]" /> Member Since
            </span>
            <span className="font-bold text-[#2C1810]">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
            </span>
          </div>
        </div>
      )}

      {/* Admin Quick Switch (if role is admin) */}
      {user.role === 'admin' && (
        <div className="p-5 bg-purple-50 border border-purple-200 rounded-3xl text-xs sm:text-sm flex items-center justify-between">
          <div>
            <p className="font-bold text-purple-900">Admin Staff Access</p>
            <p className="text-xs text-purple-700">Open kitchen management and live order desk</p>
          </div>
          <Link
            to="/admin/orders"
            className="bg-purple-800 hover:bg-purple-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            Staff Dashboard →
          </Link>
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full bg-[#F5EFEB] hover:bg-rose-50 text-rose-700 border border-[#E6DCD3] font-bold py-3 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs"
      >
        <LogOut size={16} /> Sign Out of The Prime Cafe
      </button>
    </div>
  );
};

export default ProfilePage;
