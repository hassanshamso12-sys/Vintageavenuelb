import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export const AdminNavbar = () => {
  const { settings } = useSettings();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const adminTag = (
    <small style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
      [ADMIN]
    </small>
  );

  return (
    <>
      <header className="navbar">
        <div className="container nav-container">
          <Link to="/admin/dashboard" className="brand-logo">
            {settings.site_logo_url ? (
              <img src={settings.site_logo_url} alt="Admin Logo" className="brand-logo-img" />
            ) : (
              <i className={`fa-solid ${settings.logo_icon || 'fa-gem'}`}></i>
            )}
            <span>
              {settings.brand_name || 'VINTAGE AVENUE'} {adminTag}
            </span>
          </Link>

          <ul className="nav-links">
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'active' : '')}>
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
                Categories
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
                Orders
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/customers" className={({ isActive }) => (isActive ? 'active' : '')}>
                VIPs
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/sales" className={({ isActive }) => (isActive ? 'active' : '')}>
                Sales Reports
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
                Settings
              </NavLink>
            </li>
            <li>
              <Link to="/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-secondary)' }}>
                <i className="fa-solid fa-external-link" style={{ marginRight: '4px' }}></i> Live Store
              </Link>
            </li>
          </ul>

          <div className="nav-actions">
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Sign Out
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Toggle Menu"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Mobile Sidebar Drawer */}
      <div
        className={`mobile-nav-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      ></div>

      <div className={`mobile-nav-drawer ${mobileOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <Link to="/admin/dashboard" className="brand-logo" onClick={() => setMobileOpen(false)}>
            {settings.site_logo_url ? (
              <img src={settings.site_logo_url} alt="Admin Logo" className="brand-logo-img" />
            ) : (
              <i className={`fa-solid ${settings.logo_icon || 'fa-gem'}`}></i>
            )}
            <span>{settings.brand_name} {adminTag}</span>
          </Link>
          <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}>&times;</button>
        </div>

        <div className="mobile-nav-body">
          <ul className="mobile-nav-links">
            <li><NavLink to="/admin/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</NavLink></li>
            <li><NavLink to="/admin/products" onClick={() => setMobileOpen(false)}>Products</NavLink></li>
            <li><NavLink to="/admin/categories" onClick={() => setMobileOpen(false)}>Categories</NavLink></li>
            <li><NavLink to="/admin/orders" onClick={() => setMobileOpen(false)}>Orders</NavLink></li>
            <li><NavLink to="/admin/customers" onClick={() => setMobileOpen(false)}>VIPs</NavLink></li>
            <li><NavLink to="/admin/sales" onClick={() => setMobileOpen(false)}>Sales Reports</NavLink></li>
            <li><NavLink to="/admin/settings" onClick={() => setMobileOpen(false)}>Settings</NavLink></li>
            <li><Link to="/" target="_blank" onClick={() => setMobileOpen(false)}>Live Store</Link></li>
            <li style={{ marginTop: '16px' }}>
              <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="btn btn-danger btn-sm" style={{ width: '100%' }}>
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
