import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { settings } = useSettings();
  const { cart, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {settings.announcement_text && settings.announcement_text.trim() !== '' && (
        <div className="announcement-bar">{settings.announcement_text}</div>
      )}

      <header className="navbar">
        <div className="container nav-container">
          <Link to="/" className="brand-logo">
            {settings.site_logo_url ? (
              <img src={settings.site_logo_url} alt={settings.brand_name || 'VINTAGE AVENUE'} className="brand-logo-img" />
            ) : (
              <i className={`fa-solid ${settings.logo_icon || 'fa-gem'}`}></i>
            )}
            <span>{settings.brand_name || 'VINTAGE AVENUE'}</span>
          </Link>

          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
              </NavLink>
            </li>
            <li
              className="has-dropdown"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>
                Catalog <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem', marginLeft: '4px' }}></i>
              </NavLink>

              <div className={`nav-dropdown ${dropdownOpen ? 'show' : ''}`}>
                <span className="dropdown-cat-title">Apparel & Clothing</span>
                <Link to="/products?category=Apparel%20%26%20Clothing&subcategory=Vintage%20Jackets" className="dropdown-sub-item">
                  • Vintage Jackets
                </Link>
                <Link to="/products?category=Apparel%20%26%20Clothing&subcategory=Luxury%20Hoodies" className="dropdown-sub-item">
                  • Luxury Hoodies
                </Link>

                <span className="dropdown-cat-title">Rare Watches</span>
                <Link to="/products?category=Rare%20Watches&subcategory=Automatic%20Chronographs" className="dropdown-sub-item">
                  • Automatic Chronographs
                </Link>

                <span className="dropdown-cat-title">Luxury Accessories</span>
                <Link to="/products?category=Luxury%20Accessories&subcategory=Leather%20Bags" className="dropdown-sub-item">
                  • Leather Bags
                </Link>

                <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }}></div>
                <Link to="/products" style={{ fontWeight: 700, color: 'var(--color-gold)' }}>
                  View All Artifacts →
                </Link>
              </div>
            </li>

            <li>
              <NavLink to="/products?category=Apparel%20%26%20Clothing" className={({ isActive }) => (isActive ? 'active' : '')}>
                Apparel
              </NavLink>
            </li>
            <li>
              <NavLink to="/products?category=Rare%20Watches" className={({ isActive }) => (isActive ? 'active' : '')}>
                Watches
              </NavLink>
            </li>
            <li>
              <NavLink to="/products?category=Luxury%20Accessories" className={({ isActive }) => (isActive ? 'active' : '')}>
                Accessories
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
                Our Story
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
                Concierge
              </NavLink>
            </li>
          </ul>

          <div className="nav-actions">
            <button className="cart-icon-btn" onClick={() => toggleCart(true)} aria-label="View Bag">
              <i className="fa-solid fa-bag-shopping"></i>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
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

      {/* Mobile Sidebar Navigation Drawer */}
      <div
        className={`mobile-nav-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      ></div>

      <div className={`mobile-nav-drawer ${mobileOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <Link to="/" className="brand-logo" onClick={() => setMobileOpen(false)}>
            {settings.site_logo_url ? (
              <img src={settings.site_logo_url} alt={settings.brand_name} className="brand-logo-img" />
            ) : (
              <i className={`fa-solid ${settings.logo_icon || 'fa-gem'}`}></i>
            )}
            <span>{settings.brand_name || 'VINTAGE AVENUE'}</span>
          </Link>
          <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}>
            &times;
          </button>
        </div>

        <div className="mobile-nav-body">
          <ul className="mobile-nav-links">
            <li>
              <NavLink to="/" onClick={() => setMobileOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" onClick={() => setMobileOpen(false)}>
                Catalog / Shop All
              </NavLink>
            </li>
            <li>
              <NavLink to="/products?category=Apparel%20%26%20Clothing" onClick={() => setMobileOpen(false)}>
                Apparel & Clothing
              </NavLink>
            </li>
            <li>
              <NavLink to="/products?category=Rare%20Watches" onClick={() => setMobileOpen(false)}>
                Rare Watches
              </NavLink>
            </li>
            <li>
              <NavLink to="/products?category=Luxury%20Accessories" onClick={() => setMobileOpen(false)}>
                Luxury Accessories
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={() => setMobileOpen(false)}>
                Our Story
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" onClick={() => setMobileOpen(false)}>
                Concierge / Contact
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
