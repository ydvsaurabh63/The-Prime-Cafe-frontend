import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('admin@theprimecafe.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role !== 'admin') {
          setError('Access denied. This account does not possess staff or admin privileges.');
          return;
        }
        navigate('/admin/orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6DCD3] p-6 shadow-sm space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-[#2C1810] text-[#FAF7F2] flex items-center justify-center mx-auto shadow-md">
            <Coffee size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-[#2C1810]">The Prime Cafe Management</h2>
          <p className="text-xs text-[#7A685D]">Staff & Kitchen Management Portal</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#4A2C18] mb-1">Staff / Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A685D]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@theprimecafe.com"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#4A2C18] mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A685D]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold py-3 rounded-xl transition shadow-xs text-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In to Management'}
            </button>
          </div>
        </form>

        <div className="p-3 bg-[#F5EFEB] rounded-xl border border-[#E6DCD3] text-[11px] text-[#7A685D] space-y-1">
          <p className="font-bold text-[#4A2C18]">Default Admin Credentials (Seeded):</p>
          <p>Email: <span className="font-mono text-[#2C1810]">admin@theprimecafe.com</span></p>
          <p>Password: <span className="font-mono text-[#2C1810]">Admin@123</span></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
