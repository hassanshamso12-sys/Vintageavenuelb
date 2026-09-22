import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';

const DEFAULT_PRODUCTS = [
  { id: 1, name: "1976 Vintage Moto Leather Jacket", category: "Apparel & Clothing", subcategory: "Vintage Jackets", price: 250.00, quantity: 3, era: "1970s", condition: "Mint", sku: "APP-7601", description: "Iconic hand-distressed Italian leather motorcycle jacket with original brass zippers.", image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=60" },
  { id: 2, name: "1968 Omega Seamaster Automatic", category: "Rare Watches", subcategory: "Automatic Chronographs", price: 1850.00, quantity: 1, era: "1960s", condition: "Excellent", sku: "TIM-6802", description: "Authentic Swiss-made Omega Seamaster with original stainless steel bracelet.", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60" },
  { id: 3, name: "Victorian Emerald & Diamond Ring", category: "Luxury Accessories", subcategory: "Jewelry & Rings", price: 1200.00, quantity: 2, era: "Victorian", condition: "Pristine", sku: "JWL-9903", description: "Exquisite 18K gold Victorian cluster ring featuring a natural Colombian emerald.", image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=60" },
  { id: 4, name: "Mid-Century Brass Desk Clock", category: "Luxury Accessories", subcategory: "Collectibles", price: 320.00, quantity: 4, era: "1950s", condition: "Great", sku: "COL-5004", description: "Mid-century modern Swiss brass mechanical desk clock with 8-day power reserve.", image_url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=60" }
];

export const HomePage = () => {
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data && data.products && data.products.length > 0) {
            setProducts(data.products);
            return;
          }
        }
      } catch (e) {}

      const local = localStorage.getItem('va_products');
      setProducts(local ? JSON.parse(local) : DEFAULT_PRODUCTS);
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
            <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Insured Worldwide Delivery</h4>
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
