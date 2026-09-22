import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastContainer';

export const AdminAddProductPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Apparel & Clothing');
  const [subcategory, setSubcategory] = useState('Vintage Jackets');
  const [sku, setSku] = useState('APP-' + Math.floor(1000 + Math.random() * 9000));
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [era, setEra] = useState('1970s');
  const [condition, setCondition] = useState('Mint');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [directUrl, setDirectUrl] = useState('');

  const handleGenerateSku = () => {
    const prefix = category.substring(0, 3).toUpperCase();
    setSku(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImages(prev => [...prev, evt.target.result]);
      };
      reader.readAsDataURL(file);
    });
    showToast(`Added ${files.length} photo(s)!`, 'success');
  };

  const handleAddDirectUrl = () => {
    if (directUrl.trim()) {
      setImages(prev => [...prev, directUrl.trim()]);
      setDirectUrl('');
      showToast('Image URL added to gallery!', 'success');
    }
  };

  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      name,
      category,
      subcategory,
      sku,
      price: parseFloat(price) || 0,
      cost_price: parseFloat(costPrice) || 0,
      quantity: parseInt(quantity, 10) || 0,
      era,
      condition,
      description,
      image_url: images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=60',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=60']
    };

    try {
      const existing = JSON.parse(localStorage.getItem('va_products') || '[]');
      localStorage.setItem('va_products', JSON.stringify([newProduct, ...existing]));
    } catch (err) {}

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).catch(() => {});

    showToast(`Product '${name}' created successfully!`, 'success');
    navigate('/admin/products');
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px', maxWidth: '900px' }}>
      <h1 className="section-title" style={{ fontSize: '2.5rem', color: 'var(--color-gold)', marginBottom: '32px' }}>
        Add New Vault Product
      </h1>

      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Product Title *</label>
          <input type="text" required className="form-control" style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 1976 Vintage Moto Leather Jacket" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Category *</label>
            <select className="form-control" style={{ width: '100%' }} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Apparel & Clothing">Apparel & Clothing</option>
              <option value="Rare Watches">Rare Watches</option>
              <option value="Luxury Accessories">Luxury Accessories</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Subcategory</label>
            <input type="text" className="form-control" style={{ width: '100%' }} value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="e.g. Vintage Jackets" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>SKU Code *</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="text" required className="form-control" style={{ flex: 1 }} value={sku} onChange={e => setSku(e.target.value)} />
              <button type="button" onClick={handleGenerateSku} className="btn btn-outline btn-sm">Auto</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Retail Price ($) *</label>
            <input type="number" step="0.01" required className="form-control" style={{ width: '100%' }} value={price} onChange={e => setPrice(e.target.value)} placeholder="250.00" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Cost Price ($)</label>
            <input type="number" step="0.01" className="form-control" style={{ width: '100%' }} value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="120.00" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Stock Quantity *</label>
            <input type="number" min="0" required className="form-control" style={{ width: '100%' }} value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Era / Period</label>
            <input type="text" className="form-control" style={{ width: '100%' }} value={era} onChange={e => setEra(e.target.value)} placeholder="e.g. 1970s, Victorian" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Condition Grade</label>
            <input type="text" className="form-control" style={{ width: '100%' }} value={condition} onChange={e => setCondition(e.target.value)} placeholder="e.g. Mint, Pristine, Excellent" />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Description *</label>
          <textarea required rows="4" className="form-control" style={{ width: '100%' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed history, provenance, and specifications..."></textarea>
        </div>

        {/* Image Upload Gallery */}
        <div style={{ marginBottom: '24px', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--color-gold)', marginBottom: '14px' }}>Product Images & Photos</h4>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Upload Image Files</label>
            <input type="file" multiple accept="image/*" className="form-control" onChange={handleFileUpload} style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="url" placeholder="Or paste image URL (https://...)" className="form-control" style={{ flex: 1 }} value={directUrl} onChange={e => setDirectUrl(e.target.value)} />
            <button type="button" onClick={handleAddDirectUrl} className="btn btn-outline btn-sm">Add URL</button>
          </div>

          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
              {images.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', background: 'var(--bg-card)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <img src={url} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer' }}>&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}>
          Save Product to Vault
        </button>
      </form>
    </div>
  );
};
