import React from 'react';

export const AdminSalesPage = () => {
  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)' }}>
            Sales Reports & Revenue Analytics
          </h1>
          <p className="section-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
            Financial performance, gross profit margins, and sales channel analytics
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Monthly Revenue</div>
          <div className="kpi-value">$24,850.00</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Gross Profit</div>
          <div className="kpi-value">$11,400.00</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Average Order Value</div>
          <div className="kpi-value">$680.00</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Whish Money Volume</div>
          <div className="kpi-value">64%</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '16px' }}>
          <i className="fa-solid fa-chart-line"></i> Category Performance Breakout
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Rare Watches (Mechanical / Vintage Chronographs)</span>
              <strong style={{ color: 'var(--color-gold)' }}>$14,800.00 (59.5%)</strong>
            </div>
            <div style={{ background: 'var(--bg-primary)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--color-gold)', width: '59.5%', height: '100%' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Apparel & Vintage Jackets</span>
              <strong style={{ color: 'var(--color-gold)' }}>$6,450.00 (26.0%)</strong>
            </div>
            <div style={{ background: 'var(--bg-primary)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--color-gold)', width: '26.0%', height: '100%' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Luxury Accessories & Rings</span>
              <strong style={{ color: 'var(--color-gold)' }}>$3,600.00 (14.5%)</strong>
            </div>
            <div style={{ background: 'var(--bg-primary)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--color-gold)', width: '14.5%', height: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
