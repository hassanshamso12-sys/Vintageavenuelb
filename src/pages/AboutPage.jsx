import React from 'react';
import { useSettings } from '../context/SettingsContext';

export const AboutPage = () => {
  const { settings } = useSettings();

  return (
    <div className="container" style={{ padding: '60px 24px 100px', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-heading)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {settings.about_tag || 'Heritage & Craftsmanship'}
        </span>
        <h1 style={{ fontSize: '3.2rem', marginTop: '12px', color: 'var(--color-gold)' }}>
          {settings.about_title || 'The Vintage Avenue Legacy'}
        </h1>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '40px', lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>
        <p style={{ marginBottom: '24px' }}>
          {settings.about_desc1 || 'Founded with a passion for preserving timeless design, Vintage Avenue curates the finest historical artifacts, mechanical watches, and rare garments from around the globe.'}
        </p>

        <p style={{ marginBottom: '24px' }}>
          {settings.about_desc2 || 'Every piece in our vault is meticulously inspected, authenticated, and restored by master artisans before joining our exclusive collection. We believe in high quality craftsmanship that transcends generations.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--color-gold)', fontWeight: 700 }}>100%</div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Guaranteed Authenticity</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--color-gold)', fontWeight: 700 }}>500+</div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Curated Vault Artifacts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', color: 'var(--color-gold)', fontWeight: 700 }}>50+</div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Global Collector Nations</div>
          </div>
        </div>
      </div>
    </div>
  );
};
