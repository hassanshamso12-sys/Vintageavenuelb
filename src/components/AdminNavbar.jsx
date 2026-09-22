import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export const AdminNavbar = () => {
  const { settings } = useSettings();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    checkUnseenOrders();
    const interval = setInterval(checkUnseenOrders, 3000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const checkUnseenOrders = () => {
    try {
      const saved = localStorage.getItem('va_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        const count = parsed.filter(o => o.seen === false).length;
        setUnseenCount(count);
      } else {
        setUnseenCount(1); // Demo default unseen order ORD-110293
      }
    } catch (e) {}
  };

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
              <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')} style={{ position: 'relative' }}>
                Orders
                {unseenCount > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      borderRadius: '10px',
                      padding: '2px 7px',
                      marginLeft: '6px',
                      boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                    }}
                  >
                    {unseenCount}
                  </span>
                )}
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
            <li>
              <NavLink to="/admin/orders" onClick={() => setMobileOpen(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Orders</span>
                {unseenCount > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px' }}>
                    {unseenCount} NEW
                  </span>
                )}
              </NavLink>
            </li>
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
