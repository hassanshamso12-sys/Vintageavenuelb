import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastContainer';

import { Navbar } from './components/Navbar';
import { AdminNavbar } from './components/AdminNavbar';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

// Public Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CheckoutPage } from './pages/CheckoutPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminAddProductPage } from './pages/admin/AdminAddProductPage';
import { AdminEditProductPage } from './pages/admin/AdminEditProductPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminSalesPage } from './pages/admin/AdminSalesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

import './styles/style.css';

const AppLayout = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAdminPath ? <AdminNavbar /> : <Navbar />}
      <CartDrawer />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/new" element={<AdminAddProductPage />} />
          <Route path="/admin/products/edit/:id" element={<AdminEditProductPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/sales" element={<AdminSalesPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <CartProvider>
          <AuthProvider>
            <ToastProvider>
              <AppLayout />
            </ToastProvider>
          </AuthProvider>
        </CartProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
