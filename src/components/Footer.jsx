import React from 'react';
import { useSettings } from '../context/SettingsContext';

export const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="footer">
      <div className="container">
        <div style={{ marginBottom: '16px', fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', fontSize: '1.2rem', fontWeight: 700 }}>
          {settings.brand_name || 'VINTAGE AVENUE'}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          Curated Vintage Apparel & Historic Mechanical Timepieces
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {settings.footer_text || '© 2026 Vintage Avenue. All Rights Reserved.'}
        </p>
      </div>
    </footer>
  );
};
