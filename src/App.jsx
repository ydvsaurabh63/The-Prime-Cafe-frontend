import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { useSearchParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout'; // Client Dashboard (Screenshot Panel)
import SuperAdminLayout from './layouts/SuperAdminLayout'; // 1st: Superadmin Dashboard
import AdminPortalLayout from './layouts/AdminPortalLayout'; // 2nd: Admin Dashboard

// Customer Pages (5 Tabs)
import HomePage from './pages/customer/HomePage';
import OffersPage from './pages/customer/OffersPage';
import MenuPage from './pages/customer/MenuPage';
import OrderPage from './pages/customer/OrderPage';
import ProfilePage from './pages/customer/ProfilePage';

// Auth Pages
import CustomerLoginPage from './pages/auth/CustomerLoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

import AdminOrdersTab from './pages/admin/AdminOrdersTab';
import AdminMenuTab from './pages/admin/AdminMenuTab';
import AdminOffersTab from './pages/admin/AdminOffersTab';
import AdminReviewsTab from './pages/admin/AdminReviewsTab';
import AdminCustomersTab from './pages/admin/AdminCustomersTab';
import AdminNotificationsTab from './pages/admin/AdminNotificationsTab';
import AdminProfileTab from './pages/admin/AdminProfileTab';

// Superadmin Dashboard Pages (3 Tabs: overview, manage admin, manage client)
import SuperAdminOverviewTab from './pages/superadmin/SuperAdminOverviewTab';
import SuperAdminAdminsTab from './pages/superadmin/SuperAdminAdminsTab';
import SuperAdminClientsTab from './pages/superadmin/SuperAdminClientsTab';

// Admin Dashboard Pages (2 Tabs: overview, manage client)
import AdminPortalOverviewTab from './pages/admin-portal/AdminPortalOverviewTab';
import AdminPortalClientsTab from './pages/admin-portal/AdminPortalClientsTab';

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
            <Route path="/superadmin/login" element={<AdminLoginPage portal="superadmin" />} />
            <Route path="/admin/login" element={<AdminLoginPage portal="admin" />} />
            <Route path="/client/login" element={<AdminLoginPage portal="client" />} />

            {/* 1st: Superadmin Dashboard (3 Tabs: overview, manage admin, manage client) */}
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="/superadmin/overview" replace />} />
              <Route path="overview" element={<SuperAdminOverviewTab />} />
              <Route path="admins" element={<SuperAdminAdminsTab />} />
              <Route path="manage-admin" element={<Navigate to="/superadmin/admins" replace />} />
              <Route path="clients" element={<SuperAdminClientsTab />} />
              <Route path="manage-client" element={<Navigate to="/superadmin/clients" replace />} />
            </Route>

            {/* 2nd: Admin Dashboard (2 Tabs: 1st overview, 2nd manage client) */}
            <Route path="/admin" element={<AdminPortalLayout />}>
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<AdminPortalOverviewTab />} />
              <Route path="clients" element={<AdminPortalClientsTab />} />
              <Route path="manage-client" element={<Navigate to="/admin/clients" replace />} />
            </Route>

            {/* Client Dashboard (The Screenshot Dashboard) */}
            <Route path="/client" element={<AdminLayout />}>
              <Route index element={<Navigate to="/client/orders" replace />} />
              <Route path="orders" element={<AdminOrdersTab />} />
              <Route path="menu" element={<AdminMenuTab />} />
              <Route path="offers" element={<AdminOffersTab />} />
              <Route path="reviews" element={<AdminReviewsTab />} />
              <Route path="customers" element={<AdminCustomersTab />} />
              <Route path="notifications" element={<AdminNotificationsTab />} />
              <Route path="profile" element={<AdminProfileTab />} />
            </Route>

            {/* Backward-compatibility for legacy /admin/* direct links */}
            <Route path="/admin/orders" element={<Navigate to="/client/orders" replace />} />
            <Route path="/admin/menu" element={<Navigate to="/client/menu" replace />} />
            <Route path="/admin/offers" element={<Navigate to="/client/offers" replace />} />
            <Route path="/admin/reviews" element={<Navigate to="/client/reviews" replace />} />
            <Route path="/admin/customers" element={<Navigate to="/client/customers" replace />} />
            <Route path="/admin/notifications" element={<Navigate to="/client/notifications" replace />} />
            <Route path="/admin/profile" element={<Navigate to="/client/profile" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/menu" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
