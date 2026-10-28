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
        const userRole = loggedUser?.role;

        const isSuperAdmin = userRole === 'superadmin';
        const isAdmin = userRole === 'admin' || isSuperAdmin;
        const isClient = userRole === 'client' || userRole === 'admin' || isSuperAdmin;

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
            setError('Access denied! Only Admin accounts can log in here.');
            return;
          }
          navigate('/admin/overview', { replace: true });
        } else if (portal === 'client') {
          if (!isClient) {
            await logout();
            setError('Access denied! Only Client Cafe accounts can log in here.');
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

  const fillDemo = (demoEmail, demoPwd) => {
    setEmail(demoEmail);
    setPassword(demoPwd);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4 space-y-4">
      {/* Portal Switch Pills */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-[#E6DCD3] rounded-2xl shadow-2xs">
        <button
          type="button"
          onClick={() => navigate('/superadmin/login')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            portal === 'superadmin'
              ? 'bg-[#2C1810] text-amber-300 shadow-xs'
              : 'text-[#7A685D] hover:text-[#2C1810]'
          }`}
        >
          Superadmin
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/login')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            portal === 'admin'
              ? 'bg-[#4A2C18] text-emerald-300 shadow-xs'
              : 'text-[#7A685D] hover:text-[#2C1810]'
          }`}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => navigate('/client/login')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            portal === 'client'
              ? 'bg-[#C85A32] text-white shadow-xs'
              : 'text-[#7A685D] hover:text-[#2C1810]'
          }`}
        >
          Client Cafe
        </button>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6DCD3] p-6 sm:p-7 shadow-sm space-y-5">
        <div className="text-center space-y-1.5">
          {portal === 'client' ? (
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto shadow-md ring-2 ring-[#C85A32]/30 bg-black flex items-center justify-center">
              <img src="/logo.png" alt="The Prime Cafe" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-14 h-14 rounded-2xl ${current.iconBg} flex items-center justify-center mx-auto shadow-md`}>
              <PortalIcon size={28} />
            </div>
          )}
          <h2 className="text-xl font-extrabold text-[#2C1810]">{current.title}</h2>
          <p className="text-xs text-[#7A685D]">{current.subtitle}</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0 text-rose-600" />
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
                placeholder={portal === 'superadmin' ? 'superadmin@aajkalcafe.com' : portal === 'admin' ? 'admin@aajkalcafe.com' : 'owner@cafe.com'}
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
              className="w-full bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold py-3 rounded-xl transition shadow-xs text-xs cursor-pointer active:scale-98"
            >
              {loading ? 'Authenticating...' : current.btnText}
            </button>
          </div>
        </form>

        {/* Quick Demo Autofill Hint */}
        <div className="pt-3 border-t border-[#F5EFEB] space-y-2">
          <p className="text-[11px] font-bold text-[#7A685D] text-center">Quick Demo Credentials:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {portal === 'superadmin' && (
              <button
                type="button"
                onClick={() => fillDemo('superadmin@aajkalcafe.com', 'SuperAdmin@123')}
                className="text-[10px] font-bold px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#E6DCD3] rounded-lg text-[#4A2C18]"
              >
                Auto-fill Superadmin
              </button>
            )}
            {portal === 'admin' && (
              <button
                type="button"
                onClick={() => fillDemo('amit.sharma@aajkalcafe.com', 'Admin@123')}
                className="text-[10px] font-bold px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#E6DCD3] rounded-lg text-[#4A2C18]"
              >
                Auto-fill Admin
              </button>
            )}
            {portal === 'client' && (
              <button
                type="button"
                onClick={() => fillDemo('vikas@theprimecafe.com', 'Admin@123')}
                className="text-[10px] font-bold px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#E6DCD3] rounded-lg text-[#4A2C18]"
              >
                Auto-fill The Prime Cafe
              </button>
            )}
          </div>
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[11px] font-semibold text-[#7A685D] hover:text-[#C85A32] underline"
          >
            ← Back to Customer Menu & Cafe View
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
