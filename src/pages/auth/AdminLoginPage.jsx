import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Coffee, Lock, Mail, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = ({ portal: propPortal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect portal from prop or current pathname
  let portal = propPortal;
  if (!portal) {
    if (location.pathname.startsWith('/superadmin')) {
      portal = 'superadmin';
    } else if (location.pathname.startsWith('/client')) {
      portal = 'client';
    } else {
      portal = 'admin';
    }
  }

  // Clear any delayed browser password manager autofill
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    const t = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 150);
    return () => clearTimeout(t);
  }, [portal]);

  const portalConfig = {
    superadmin: {
      title: 'Aaj Kal Food Superadmin',
      subtitle: 'Superadmin Portal Login',
      Icon: ShieldCheck,
      iconBg: 'bg-[#2C1810] text-amber-300',
      btnText: 'Sign In as Superadmin',
      target: '/superadmin/overview',
      roleLabel: 'Superadmin'
    },
    admin: {
      title: 'Aaj Kal Food Admin',
      subtitle: 'Regional Admin Portal Login',
      Icon: UserCheck,
      iconBg: 'bg-[#4A2C18] text-emerald-300',
      btnText: 'Sign In as Admin',
      target: '/admin/overview',
      roleLabel: 'Admin'
    },
    client: {
      title: 'The Prime Cafe',
      subtitle: 'Client Cafe Portal Login',
      Icon: Coffee,
      iconBg: 'bg-[#2C1810] text-orange-300',
      btnText: 'Sign In as Client',
      target: '/client/orders',
      roleLabel: 'Client'
    }
  };

  const current = portalConfig[portal] || portalConfig.admin;
  const PortalIcon = current.Icon;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await login(email, password, portal);
      if (res?.success) {
        const loggedUser = res.user;
        const userEmail = (loggedUser?.email || '').toLowerCase();
        const userRole = loggedUser?.role;

        const isSuperAdmin = userRole === 'superadmin' || userEmail === 'superadmin@aajkalcafe.com';
        const isClient = userRole === 'client' || userEmail.includes('theprimecafe') || userEmail === 'admin@theprimecafe.com';
        const isAdmin = userEmail.includes('amit.sharma') || (userRole === 'admin' && !isSuperAdmin && !isClient);

        if (portal === 'superadmin') {
          if (!isSuperAdmin) {
            await logout();
            setError('Access denied! Only Superadmin can log in here.');
            return;
          }
          navigate('/superadmin/overview', { replace: true });
        } else if (portal === 'admin') {
          if (!isAdmin) {
            await logout();
            setError('Access denied! Only Admin can log in here.');
            return;
          }
          navigate('/admin/overview', { replace: true });
        } else if (portal === 'client') {
          if (!isClient) {
            await logout();
            setError('Access denied! Only Client can log in here.');
            return;
          }
          navigate('/client/orders', { replace: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password for this portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6DCD3] p-6 shadow-sm space-y-5">
        <div className="text-center space-y-1.5">
          <div className={`w-14 h-14 rounded-2xl ${current.iconBg} flex items-center justify-center mx-auto shadow-md`}>
            <PortalIcon size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-[#2C1810]">{current.title}</h2>
          <p className="text-xs text-[#7A685D]">{current.subtitle}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
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
              {loading ? 'Authenticating...' : current.btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
