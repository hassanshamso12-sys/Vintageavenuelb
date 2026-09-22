import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_ORDERS = [
  { id: 'ORD-982104', customer_name: 'Hassan Shamso', customer_phone: '+961 70 123 456', customer_email: 'hassan@example.com', total_amount: 1850.00, status: 'Completed', tracking_status: 'Delivered', payment_method: 'Whish Money Transfer', order_date: '2026-09-22T14:30:00Z', delivery_method: 'Express Vault Concierge', delivery_fee: 25.00, seen: true },
  { id: 'ORD-451209', customer_name: 'Karim Al-Hassan', customer_phone: '+961 03 987 654', customer_email: 'N/A', total_amount: 250.00, status: 'Processing', tracking_status: 'Dispatched / In Transit', payment_method: 'Cash on Delivery', order_date: '2026-09-22T11:15:00Z', delivery_method: 'Standard Courier', delivery_fee: 10.00, seen: true },
  { id: 'ORD-110293', customer_name: 'Nour El-Din', customer_phone: '+961 71 456 789', customer_email: 'nour@example.com', total_amount: 1200.00, status: 'Pending', tracking_status: 'Processing', payment_method: 'Whish Money Transfer', order_date: '2026-09-21T18:45:00Z', delivery_method: 'Standard Courier', delivery_fee: 0.00, seen: false }
];

export const AdminDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data && data.orders && data.orders.length > 0) {
          setOrders(data.orders);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    const saved = localStorage.getItem('va_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      setOrders(DEFAULT_ORDERS);
      localStorage.setItem('va_orders', JSON.stringify(DEFAULT_ORDERS));
    }
    setLoading(false);
  };

  const unseenOrders = orders.filter(o => o.seen === false);
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalOrdersCount = orders.length;

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

      {/* Cute New Order Alert Banner */}
      {unseenOrders.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(26, 29, 41, 0.95) 100%)',
            border: '2px solid var(--color-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 30px',
            marginBottom: '36px',
            boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
            animation: 'pulseGlow 2.5s infinite ease-in-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.25)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                border: '1px solid var(--color-gold)',
                flexShrink: 0
              }}
            >
              <i className="fa-solid fa-bell-ring fa-bounce"></i>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                  New Order Alert!
                </h3>
                <span
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {unseenOrders.length} UNSEEN
                </span>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: '0.95rem' }}>
                Client <strong>{unseenOrders[0].customer_name}</strong> recently placed order <code>{unseenOrders[0].id}</code> for <strong>${Number(unseenOrders[0].total_amount).toFixed(2)}</strong>.
              </p>
            </div>
          </div>

          <Link
            to="/admin/orders"
            className="btn btn-gold"
            style={{ padding: '12px 24px', fontSize: '0.92rem', letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            Review Orders ({unseenOrders.length}) →
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '40px' }}>
        <div className="kpi-card">
          <div className="kpi-title">Gross Revenue</div>
          <div className="kpi-value">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        <div className="kpi-card" style={{ position: 'relative' }}>
          {unseenOrders.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '10px'
              }}
            >
              • {unseenOrders.length} NEW
            </span>
          )}
          <div className="kpi-title">Total Orders</div>
          <div className="kpi-value">{totalOrdersCount}</div>
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
          <Link to="/admin/orders" className="btn btn-outline" style={{ position: 'relative' }}>
            <i className="fa-solid fa-receipt"></i> Orders List
            {unseenOrders.length > 0 && (
              <span style={{ marginLeft: '6px', background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '2px 7px', fontSize: '0.72rem' }}>
                {unseenOrders.length}
              </span>
            )}
          </Link>
          <Link to="/admin/settings" className="btn btn-outline">
            <i className="fa-solid fa-palette"></i> Branding & Settings
          </Link>
        </div>
      </div>
    </div>
  );
};
