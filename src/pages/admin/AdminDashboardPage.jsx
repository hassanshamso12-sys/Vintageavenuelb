import React from 'react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage = () => {
  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)' }}>
            Retail System Overview
          </h1>
          <p className="section-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
            Real-time analytics for products, sales performance, orders, and VIP customers.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Gross Revenue</div>
          <div className="kpi-value">$14,250.00</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Total Orders</div>
          <div className="kpi-value">28</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Vault Products</div>
          <div className="kpi-value">12</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Recurrent VIPs</div>
          <div className="kpi-value">18</div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '20px' }}>
          <i className="fa-solid fa-bolt"></i> Quick Management Controls
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Link to="/admin/products/new" className="btn btn-gold">
            <i className="fa-solid fa-plus"></i> Add New Product
          </Link>
          <Link to="/admin/products" className="btn btn-outline">
            <i className="fa-solid fa-boxes-stacked"></i> Manage Products
          </Link>
          <Link to="/admin/categories" className="btn btn-outline">
            <i className="fa-solid fa-folder-tree"></i> Categories Hierarchy
          </Link>
          <Link to="/admin/orders" className="btn btn-outline">
            <i className="fa-solid fa-receipt"></i> Orders List
          </Link>
          <Link to="/admin/settings" className="btn btn-outline">
            <i className="fa-solid fa-palette"></i> Branding & Settings
          </Link>
        </div>
      </div>
    </div>
  );
};
