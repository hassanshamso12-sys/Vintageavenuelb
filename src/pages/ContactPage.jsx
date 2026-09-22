import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../components/ToastContainer';

export const ContactPage = () => {
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Your message has been received! Our concierge will contact you shortly.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="container" style={{ padding: '60px 24px 100px', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '12px' }}>
          {settings.contact_title || 'Contact Our Concierge'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          Have questions regarding an artifact or bespoke sourcing request? We are at your service.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Contact Info */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '24px' }}>
            <i className="fa-solid fa-gem"></i> Boutique Concierge
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Physical Address</div>
            <div style={{ fontWeight: 600 }}>{settings.contact_address || '100 Avenue de Vintage, Suite 400, Beirut, Lebanon'}</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Support Email</div>
            <div style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{settings.contact_email || 'concierge@vintageavenuelb.com'}</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Concierge Hotline / WhatsApp</div>
            <div style={{ fontWeight: 600 }}>{settings.contact_phone || '+961 70 123 456'}</div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '24px' }}>
            <i className="fa-solid fa-paper-plane"></i> Send Direct Inquiry
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Full Name *</label>
              <input type="text" required className="form-control" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Email Address *</label>
              <input type="email" required className="form-control" style={{ width: '100%' }} value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Message / Sourcing Details *</label>
              <textarea required rows="4" className="form-control" style={{ width: '100%' }} value={message} onChange={e => setMessage(e.target.value)}></textarea>
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};
