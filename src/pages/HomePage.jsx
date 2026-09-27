import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { syncCatalogProducts } from '../utils/dataSync';

export const HomePage = () => {
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const prodList = await syncCatalogProducts();
      setProducts(prodList);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          <span className="hero-tag">{settings.hero_tag || '• Rare & Timeless Elegance •'}</span>
          <h1 className="hero-title">{settings.hero_title || 'Curated Vintage Masterpieces'}</h1>
          <p className="hero-desc" style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
            {settings.hero_desc || 'Discover our handpicked vault of authenticated vintage apparel, rare mechanical timepieces, and historical luxury accessories.'}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-gold">
              {settings.hero_btn_primary || 'Explore Collection'}
            </Link>
            <Link to="/about" className="btn btn-outline">
              {settings.hero_btn_secondary || 'Our Process'}
            </Link>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section style={{ padding: '60px 0', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', textAlign: 'center' }}>
          <div>
            <i className="fa-solid fa-gem" style={{ fontSize: '2.2rem', color: 'var(--color-gold)', marginBottom: '16px' }}></i>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Authenticated Vault</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Every item in our collection is rigorously verified by master horologists and vintage experts.</p>
          </div>
          <div>
            <i className="fa-solid fa-plane-shield" style={{ fontSize: '2.2rem', color: 'var(--color-gold)', marginBottom: '16px' }}></i>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Insured Courier Dispatch</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Fully tracked and insured express courier delivery straight to your doorstep.</p>
          </div>
          <div>
            <i className="fa-solid fa-crown" style={{ fontSize: '2.2rem', color: 'var(--color-gold)', marginBottom: '16px' }}></i>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>24/7 VIP Concierge</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Dedicated personal client advisors available for bespoke inquiries and sourcing requests.</p>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--color-gold)' }}>{settings.featured_title || 'Featured Arrivals'}</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>{settings.featured_subtitle || 'Authenticated vintage pieces recently added to our vault'}</p>
            </div>
            <Link to="/products" className="btn btn-outline">
              {settings.featured_btn_text || 'View All Artifacts →'}
            </Link>
          </div>

          <div className="product-grid">
            {products.slice(0, 4).map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className="product-card" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                <div className="product-image-wrap">
                  <img src={product.image_url || (product.images ? product.images[0] : '/uploads/placeholder.jpg')} alt={product.name} />
                  <span className="badge-era">{product.era || 'Vintage'}</span>
                  <span className={`badge-stock ${product.quantity === 0 ? 'out-of-stock' : (product.quantity <= 3 ? 'low-stock' : 'in-stock')}`}>
                    {product.quantity > 0 ? `${product.quantity} units` : 'Vaulted'}
                  </span>
                </div>

                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-bottom">
                    <span className="product-price">${Number(product.price).toFixed(2)}</span>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                      className="btn btn-gold btn-sm"
                      disabled={product.quantity === 0}
                    >
                      <i className="fa-solid fa-plus"></i> Add To Bag
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
