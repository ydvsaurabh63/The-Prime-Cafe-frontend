import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedToken = localStorage.getItem('akc_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('akc_token');
            setUser(null);
          }
        } catch (err) {
          localStorage.removeItem('akc_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Standard Login (Customer or Admin)
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('akc_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Register / Onboard Customer with Table Personal Details
  const register = async (userData) => {
    // userData can be an object or individual params
    const payload = typeof userData === 'object' ? userData : { name: arguments[0], email: arguments[1], phone: arguments[2], password: arguments[3] };
    const res = await api.post('/auth/register', payload);
    if (res.data.success) {
      localStorage.setItem('akc_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Google Quick Login & Details
  const googleLogin = async (googleUserData) => {
    const res = await api.post('/auth/google', googleUserData);
    if (res.data.success) {
      localStorage.setItem('akc_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Request OTP for Cafe Table quick sign-in
  const requestOtp = async (phone, email, name, table) => {
    const res = await api.post('/auth/request-otp', { phone, email, name, table });
    return res.data;
  };

  // Verify OTP
  const verifyOtp = async (contact, code) => {
    const res = await api.post('/auth/verify-otp', { contact, code });
    if (res.data.success) {
      localStorage.setItem('akc_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Claim verified Google Form session
  const claimGoogleFormSession = async (contact, claimToken) => {
    const res = await api.post('/auth/claim-form-session', { contact, claimToken });
    if (res.data.success) {
      localStorage.setItem('akc_token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('akc_token');
    setUser(null);
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        requestOtp,
        verifyOtp,
        claimGoogleFormSession,
        logout,
        updateCurrentUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
        isSuperAdmin: user?.role === 'superadmin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
