import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../components/ToastContainer';

export const AdminSettingsPage = () => {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();

  // Visual Identity State
  const [brandName, setBrandName] = useState(settings.brand_name || 'VINTAGE AVENUE');
  const [logoIcon, setLogoIcon] = useState(settings.logo_icon || 'fa-gem');
  const [themePalette, setThemePalette] = useState(settings.theme_palette || 'gold');

  // Custom Logo State
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [pendingLogoDataUrl, setPendingLogoDataUrl] = useState('');

  // Whish Barcode State
  const [whishUrlInput, setWhishUrlInput] = useState('');
  const [pendingWhishDataUrl, setPendingWhishDataUrl] = useState('');

  // Coupons State
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'SUMMER15', discount_type: 'percentage', discount_value: 15, min_order_amount: 0 },
    { id: '2', code: 'VIP10', discount_type: 'fixed', discount_value: 10, min_order_amount: 50 }
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState('percentage');
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponMin, setNewCouponMin] = useState('');

  // CMS Copy State
  const [announcementText, setAnnouncementText] = useState(settings.announcement_text || '');
  const [heroTag, setHeroTag] = useState(settings.hero_tag || '');
  const [heroTitle, setHeroTitle] = useState(settings.hero_title || '');
  const [heroDesc, setHeroDesc] = useState(settings.hero_desc || '');
  const [heroBtnPrimary, setHeroBtnPrimary] = useState(settings.hero_btn_primary || '');
  const [heroBtnSecondary, setHeroBtnSecondary] = useState(settings.hero_btn_secondary || '');

  const [featuredTitle, setFeaturedTitle] = useState(settings.featured_title || '');
  const [featuredSubtitle, setFeaturedSubtitle] = useState(settings.featured_subtitle || '');
  const [featuredBtnText, setFeaturedBtnText] = useState(settings.featured_btn_text || '');

  const [aboutTag, setAboutTag] = useState(settings.about_tag || '');
  const [aboutTitle, setAboutTitle] = useState(settings.about_title || '');
  const [aboutDesc1, setAboutDesc1] = useState(settings.about_desc1 || '');
  const [aboutDesc2, setAboutDesc2] = useState(settings.about_desc2 || '');

  const [contactTitle, setContactTitle] = useState(settings.contact_title || '');
  const [contactAddress, setContactAddress] = useState(settings.contact_address || '');
  const [contactEmail, setContactEmail] = useState(settings.contact_email || '');
  const [contactPhone, setContactPhone] = useState(settings.contact_phone || '');
  const [footerText, setFooterText] = useState(settings.footer_text || '');

  useEffect(() => {
    setBrandName(settings.brand_name || 'VINTAGE AVENUE');
    setLogoIcon(settings.logo_icon || 'fa-gem');
    setThemePalette(settings.theme_palette || 'gold');
    setAnnouncementText(settings.announcement_text || '');
    setHeroTag(settings.hero_tag || '');
    setHeroTitle(settings.hero_title || '');
    setHeroDesc(settings.hero_desc || '');
    setHeroBtnPrimary(settings.hero_btn_primary || '');
    setHeroBtnSecondary(settings.hero_btn_secondary || '');
    setFeaturedTitle(settings.featured_title || '');
    setFeaturedSubtitle(settings.featured_subtitle || '');
    setFeaturedBtnText(settings.featured_btn_text || '');
    setAboutTag(settings.about_tag || '');
    setAboutTitle(settings.about_title || '');
    setAboutDesc1(settings.about_desc1 || '');
    setAboutDesc2(settings.about_desc2 || '');
    setContactTitle(settings.contact_title || '');
    setContactAddress(settings.contact_address || '');
    setContactEmail(settings.contact_email || '');
    setContactPhone(settings.contact_phone || '');
    setFooterText(settings.footer_text || '');
  }, [settings]);

  // Visual Identity Handler
  const handleSaveBranding = (e) => {
    e.preventDefault();
    updateSettings({
      brand_name: brandName,
      logo_icon: logoIcon,
      theme_palette: themePalette
    });
    showToast('Visual identity settings updated live!', 'success');
  };

  // Custom Logo Upload Handler
  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPendingLogoDataUrl(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = (e) => {
    e.preventDefault();
    const logoToSave = logoUrlInput.trim() || pendingLogoDataUrl;
    if (!logoToSave) {
      showToast('Please select a logo image file or enter an image URL.', 'warning');
      return;
    }
    updateSettings({ site_logo_url: logoToSave });
    showToast('Custom logo uploaded & activated live across site header!', 'success');
  };

  const handleRemoveLogo = () => {
    if (window.confirm('Remove custom logo image and revert to font icon logo?')) {
      updateSettings({ site_logo_url: '' });
      setPendingLogoDataUrl('');
      setLogoUrlInput('');
      showToast('Reverted to default font icon logo.', 'success');
    }
  };

  // Whish Barcode Handler
  const handleWhishFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPendingWhishDataUrl(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveWhish = (e) => {
    e.preventDefault();
    const whishToSave = whishUrlInput.trim() || pendingWhishDataUrl;
    if (!whishToSave) {
      showToast('Please select a barcode file or enter an image URL.', 'warning');
      return;
    }
    updateSettings({ whish_barcode_url: whishToSave });
    showToast('Whish Money barcode uploaded & activated!', 'success');
  };

  // Coupon Handlers
  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponValue) return;

    const newC = {
      id: Date.now().toString(),
      code: newCouponCode.trim().toUpperCase(),
      discount_type: newCouponType,
      discount_value: parseFloat(newCouponValue),
      min_order_amount: parseFloat(newCouponMin || 0)
    };

    setCoupons(prev => [...prev, newC]);
    showToast('Coupon added successfully!', 'success');
    setNewCouponCode('');
    setNewCouponValue('');
    setNewCouponMin('');
  };

  const handleDeleteCoupon = (id) => {
    if (window.confirm('Delete coupon code?')) {
      setCoupons(prev => prev.filter(c => c.id !== id));
      showToast('Coupon deleted', 'success');
    }
  };

  // Save Storefront Copy CMS Handler
  const handleSaveCMS = (e) => {
    e.preventDefault();
    updateSettings({
      announcement_text: announcementText,
      hero_tag: heroTag,
      hero_title: heroTitle,
      hero_desc: heroDesc,
      hero_btn_primary: heroBtnPrimary,
      hero_btn_secondary: heroBtnSecondary,

      featured_title: featuredTitle,
      featured_subtitle: featuredSubtitle,
      featured_btn_text: featuredBtnText,

      about_tag: aboutTag,
      about_title: aboutTitle,
      about_desc1: aboutDesc1,
      about_desc2: aboutDesc2,

      contact_title: contactTitle,
      contact_address: contactAddress,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      footer_text: footerText
    });
    showToast('Live Storefront Text Content updated successfully!', 'success');
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)' }}>
            Visual Identity & Store Settings
          </h1>
          <p className="section-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
            Customize brand logo, color palette, upload Whish Money payment barcode, and manage discount coupons
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start', marginBottom: '40px' }}>
        {/* Visual Identity Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '20px' }}>
            <i className="fa-solid fa-palette"></i> Live Color Palette & Logo Icon
          </h3>

          <form onSubmit={handleSaveBranding}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Brand Name Text</label>
              <input type="text" className="form-control" style={{ width: '100%' }} value={brandName} onChange={e => setBrandName(e.target.value)} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Logo Icon (FontAwesome)</label>
              <select className="form-control" style={{ width: '100%' }} value={logoIcon} onChange={e => setLogoIcon(e.target.value)}>
                <option value="fa-gem">Gem Diamond (fa-gem)</option>
                <option value="fa-crown">Royal Crown (fa-crown)</option>
                <option value="fa-feather">Vintage Feather (fa-feather)</option>
                <option value="fa-clock">Classic Clock (fa-clock)</option>
                <option value="fa-shield-halved">Heritage Shield (fa-shield-halved)</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Primary Color Palette Theme</label>
              <select className="form-control" style={{ width: '100%' }} value={themePalette} onChange={e => setThemePalette(e.target.value)}>
                <option value="gold">Champagne Gold (Default Luxury)</option>
                <option value="emerald">Imperial Emerald</option>
                <option value="sapphire">Royal Sapphire</option>
                <option value="rose">Rose Gold</option>
              </select>
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>Save Visual Identity</button>
          </form>
        </div>

        {/* Custom Logo Upload Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '20px' }}>
            <i className="fa-solid fa-image"></i> Custom Brand Logo Image
          </h3>

          <form onSubmit={handleSaveLogo}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Upload Brand Logo Photo / PNG</label>
              <input type="file" accept="image/*" className="form-control" style={{ width: '100%' }} onChange={handleLogoFileChange} />
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>Transparent PNG or SVG recommended. Will replace font icon in site navbar.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Or Paste Logo Image URL</label>
              <input type="url" className="form-control" placeholder="https://... or data:image/..." style={{ width: '100%' }} value={logoUrlInput} onChange={e => setLogoUrlInput(e.target.value)} />
            </div>

            {(settings.site_logo_url || pendingLogoDataUrl || logoUrlInput) && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Header Logo Preview:</div>
                <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                  <img src={logoUrlInput || pendingLogoDataUrl || settings.site_logo_url} alt="Logo Preview" style={{ maxHeight: '48px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ marginTop: '10px' }}>
                  <button type="button" onClick={handleRemoveLogo} className="btn btn-outline btn-sm" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                    <i className="fa-solid fa-trash"></i> Remove Logo Image
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>Upload & Save Logo</button>
          </form>
        </div>

        {/* Whish Money Payment Barcode Upload Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '20px' }}>
            <i className="fa-solid fa-qrcode"></i> Whish Money Payment Barcode
          </h3>

          <form onSubmit={handleSaveWhish}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Upload Merchant QR / Barcode Photo</label>
              <input type="file" accept="image/*" className="form-control" style={{ width: '100%' }} onChange={handleWhishFileChange} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Or Paste Barcode Image URL</label>
              <input type="url" className="form-control" placeholder="https://... or data:image/..." style={{ width: '100%' }} value={whishUrlInput} onChange={e => setWhishUrlInput(e.target.value)} />
            </div>

            {(settings.whish_barcode_url || pendingWhishDataUrl || whishUrlInput) && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Live Barcode Preview:</div>
                <img src={whishUrlInput || pendingWhishDataUrl || settings.whish_barcode_url} alt="Whish Barcode Preview" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '8px', background: '#fff' }} />
              </div>
            )}

            <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>Upload & Save Barcode</button>
          </form>
        </div>
      </div>

      {/* Coupons Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '20px' }}>
          <i className="fa-solid fa-ticket"></i> Active Discount Coupons
        </h3>

        <form onSubmit={handleAddCoupon} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <input type="text" placeholder="CODE (e.g. SUMMER15)" className="form-control" style={{ textTransform: 'uppercase', flex: 1 }} value={newCouponCode} onChange={e => setNewCouponCode(e.target.value)} required />
          <select className="form-control" style={{ width: '150px' }} value={newCouponType} onChange={e => setNewCouponType(e.target.value)}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed ($)</option>
          </select>
          <input type="number" step="0.01" min="0.01" placeholder="Value" className="form-control" style={{ width: '120px' }} value={newCouponValue} onChange={e => setNewCouponValue(e.target.value)} required />
          <input type="number" step="0.01" min="0" placeholder="Min Order ($)" className="form-control" style={{ width: '140px' }} value={newCouponMin} onChange={e => setNewCouponMin(e.target.value)} />
          <button type="submit" className="btn btn-gold btn-sm">Add Coupon</button>
        </form>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td><code>{c.code}</code></td>
                  <td>{c.discount_type.toUpperCase()}</td>
                  <td>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value.toFixed(2)}`}</td>
                  <td>${c.min_order_amount.toFixed(2)}</td>
                  <td><button onClick={() => handleDeleteCoupon(c.id)} className="btn btn-danger btn-sm">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CMS Copy CMS Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '16px' }}>
          <i className="fa-solid fa-pen-to-square"></i> Live Storefront Copy CMS
        </h3>

        <form onSubmit={handleSaveCMS}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Announcement Bar</h4>
              <input type="text" className="form-control" style={{ width: '100%' }} value={announcementText} onChange={e => setAnnouncementText(e.target.value)} />
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Hero Tag & Title</h4>
              <input type="text" className="form-control" style={{ width: '100%', marginBottom: '8px' }} value={heroTag} onChange={e => setHeroTag(e.target.value)} placeholder="Tag line" />
              <input type="text" className="form-control" style={{ width: '100%', marginBottom: '8px' }} value={heroTitle} onChange={e => setHeroTitle(e.target.value)} placeholder="Main Title" />
              <textarea rows="2" className="form-control" style={{ width: '100%' }} value={heroDesc} onChange={e => setHeroDesc(e.target.value)} placeholder="Hero description"></textarea>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>About Story</h4>
              <input type="text" className="form-control" style={{ width: '100%', marginBottom: '8px' }} value={aboutTitle} onChange={e => setAboutTitle(e.target.value)} placeholder="About Title" />
              <textarea rows="2" className="form-control" style={{ width: '100%', marginBottom: '8px' }} value={aboutDesc1} onChange={e => setAboutDesc1(e.target.value)} placeholder="Paragraph 1"></textarea>
              <textarea rows="2" className="form-control" style={{ width: '100%' }} value={aboutDesc2} onChange={e => setAboutDesc2(e.target.value)} placeholder="Paragraph 2"></textarea>
            </div>
          </div>

          <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}>
            Save All Live Storefront Copy Changes
          </button>
        </form>
      </div>
    </div>
  );
};
