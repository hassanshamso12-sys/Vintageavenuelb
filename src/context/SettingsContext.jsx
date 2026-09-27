import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const SettingsContext = createContext();

export const DEFAULT_VA_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="4" fill="#0b0d12"/>
  <rect x="6" y="6" width="88" height="88" rx="2" fill="none" stroke="#d4af37" stroke-width="3"/>
  <rect x="11" y="11" width="78" height="78" fill="none" stroke="#d4af37" stroke-width="1" stroke-opacity="0.5"/>
  <text x="50" y="65" font-family="'Cinzel', 'Playfair Display', 'Times New Roman', serif" font-size="44" font-weight="700" fill="#d4af37" text-anchor="middle" letter-spacing="-2">VA</text>
</svg>`)}`;

const DEFAULT_SETTINGS = {
  brand_name: 'VINTAGE AVENUE',
  logo_icon: 'fa-gem',
  theme_palette: 'gold',
  site_logo_url: DEFAULT_VA_LOGO_SVG,
  whish_barcode_url: '',
  announcement_text: '✨ CURATED VINTAGE & LUXURY RETAIL • INSURED EXPRESS COURIER DISPATCH ✨',
  hero_tag: '• Rare & Timeless Elegance •',
  hero_title: 'Curated Vintage Masterpieces',
  hero_desc: 'Discover our handpicked vault of authenticated vintage apparel, rare mechanical timepieces, and historical luxury accessories.',
  hero_btn_primary: 'Explore Collection',
  hero_btn_secondary: 'Our Process',
  featured_title: 'Featured Arrivals',
  featured_subtitle: 'Authenticated vintage pieces recently added to our vault',
  featured_btn_text: 'View All Artifacts →',
  about_tag: 'Heritage & Craftsmanship',
  about_title: 'The Vintage Avenue Legacy',
  about_desc1: 'Founded with a passion for preserving timeless design, Vintage Avenue curates the finest historical artifacts, mechanical watches, and rare garments from around the globe.',
  about_desc2: 'Every piece in our vault is meticulously inspected, authenticated, and restored by master artisans before joining our exclusive collection.',
  contact_title: 'Contact Us',
  contact_address: '100 Avenue de Vintage, Suite 400, Beirut, Lebanon',
  contact_email: 'concierge@vintageavenuelb.com',
  contact_phone: '+961 70 123 456',
  footer_text: '© 2026 Vintage Avenue. All Rights Reserved.'
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('va_settings');
      let parsed = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
      if (!parsed.site_logo_url) {
        parsed.site_logo_url = DEFAULT_VA_LOGO_SVG;
      }
      if (parsed.contact_title === 'Contact Our Concierge') {
        parsed.contact_title = 'Contact Us';
      }
      if (parsed.announcement_text && parsed.announcement_text.includes('WORLDWIDE')) {
        parsed.announcement_text = '✨ CURATED VINTAGE & LUXURY RETAIL • INSURED EXPRESS COURIER DISPATCH ✨';
      }
      return parsed;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    // Apply theme palette to body
    document.body.classList.remove('theme-emerald', 'theme-sapphire', 'theme-rose');
    if (settings.theme_palette && settings.theme_palette !== 'gold') {
      document.body.classList.add(`theme-${settings.theme_palette}`);
    }
  }, [settings.theme_palette]);

  // Real-time Firebase Firestore Settings Sync across all browsers
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const docRef = doc(db, 'settings', 'general');
      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const remoteData = docSnap.data();
            if (remoteData) {
              setSettings((prev) => {
                const updated = { ...prev, ...remoteData };
                if (!updated.site_logo_url) updated.site_logo_url = DEFAULT_VA_LOGO_SVG;
                if (updated.contact_title === 'Contact Our Concierge') updated.contact_title = 'Contact Us';
                localStorage.setItem('va_settings', JSON.stringify(updated));
                return updated;
              });
            }
          }
        },
        (err) => {
          console.warn('Firestore real-time settings sync error:', err);
        }
      );
    } catch (e) {
      console.warn('Firestore settings listener failed:', e);
    }

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('va_settings', JSON.stringify(updated));
      return updated;
    });

    // Push to Cloud Firestore for instant real-time sync across all browsers
    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, newSettings, { merge: true });
    } catch (e) {
      console.warn('Firestore settings write error:', e);
    }

    // Secondary fallback API post
    fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('va_admin_token')}`
      },
      body: JSON.stringify({ settings: newSettings })
    }).catch(() => {});
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
