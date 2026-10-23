import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear any delayed browser password manager autofill
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    const t = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role !== 'admin' && res.user.role !== 'superadmin') {
          setError('Access denied. This account does not possess staff or admin privileges.');
          return;
        }

        // Smart routing based on role and account
        if (res.user.role === 'superadmin') {
          navigate('/superadmin/overview');
        } else if (res.user.email?.toLowerCase().includes('amit.sharma')) {
          navigate('/admin/overview');
        } else {
          navigate('/client/orders');
        }
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
          <h2 className="text-xl font-extrabold text-[#2C1810]">Aaj Kal Food Management</h2>
          <p className="text-xs text-[#7A685D]">Superadmin, Regional Admin & Client Cafe Access</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} autoComplete="off" className="space-y-3.5 text-xs">
          {/* Hidden inputs to absorb browser autofill trap */}
          <input type="text" name="fake_email_prevent_autofill" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input type="password" name="fake_password_prevent_autofill" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <div>
            <label className="block font-bold text-[#4A2C18] mb-1">Account Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A685D]" />
              <input
                type="text"
                name="akc_user_login_identity"
                id="akc_user_login_identity"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@aajkalcafe.com"
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
                name="akc_user_login_key"
                id="akc_user_login_key"
                autoComplete="new-password"
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
              className="w-full bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold py-3 rounded-xl transition shadow-xs text-xs cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
