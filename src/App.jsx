import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { useSearchParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages (5 Tabs)
import HomePage from './pages/customer/HomePage';
import OffersPage from './pages/customer/OffersPage';
import MenuPage from './pages/customer/MenuPage';
import OrderPage from './pages/customer/OrderPage';
import ProfilePage from './pages/customer/ProfilePage';

// Auth Pages
import CustomerLoginPage from './pages/auth/CustomerLoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// Admin Pages (5 Tabs)
import AdminOrdersTab from './pages/admin/AdminOrdersTab';
import AdminMenuTab from './pages/admin/AdminMenuTab';
import AdminOffersTab from './pages/admin/AdminOffersTab';
import AdminNotificationsTab from './pages/admin/AdminNotificationsTab';
import AdminProfileTab from './pages/admin/AdminProfileTab';

// Handles QR scans from tables: directs customer to form login first with table parameter
const CafeQREntry = () => {
  const [searchParams] = useSearchParams();
  const table = searchParams.get('table') || '';
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={`/menu${table ? `?table=${encodeURIComponent(table)}` : ''}`} replace />;
  }
  return <Navigate to={`/login?table=${encodeURIComponent(table)}&redirect=/menu`} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer QR Entry point */}
            <Route path="/cafe" element={<CafeQREntry />} />

            {/* Customer Facing 5 Tabs Layout */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Authentication Routes */}
            <Route path="/login" element={<CustomerLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Admin Facing 5 Tabs Layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/orders" replace />} />
              <Route path="orders" element={<AdminOrdersTab />} />
              <Route path="menu" element={<AdminMenuTab />} />
              <Route path="offers" element={<AdminOffersTab />} />
              <Route path="notifications" element={<AdminNotificationsTab />} />
              <Route path="profile" element={<AdminProfileTab />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/menu" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
