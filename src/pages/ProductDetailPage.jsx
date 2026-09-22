import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ToastContainer';

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "1976 Vintage Moto Leather Jacket",
    category: "Apparel & Clothing",
    subcategory: "Vintage Jackets",
    price: 250.00,
    quantity: 3,
    era: "1970s",
    condition: "Mint",
    sku: "APP-7601",
    description: "Iconic hand-distressed Italian leather motorcycle jacket with original brass zippers, silk quilted lining, and authentic 1970s patina.",
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=60",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&auto=format&fit=crop&q=60"
    ]
  },
  {
    id: 2,
    name: "1968 Omega Seamaster Automatic",
    category: "Rare Watches",
    subcategory: "Automatic Chronographs",
    price: 1850.00,
    quantity: 1,
    era: "1960s",
    condition: "Excellent",
    sku: "TIM-6802",
    description: "Authentic Swiss-made Omega Seamaster with original stainless steel bracelet, pristine silver sunburst dial, and fully serviced automatic movement.",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=60"
    ]
  },
  {
    id: 3,
    name: "Victorian Emerald & Diamond Ring",
    category: "Luxury Accessories",
    subcategory: "Jewelry & Rings",
    price: 1200.00,
    quantity: 2,
    era: "Victorian",
    condition: "Pristine",
    sku: "JWL-9903",
    description: "Exquisite 18K yellow gold Victorian cluster ring featuring a natural Colombian emerald surrounded by antique rose-cut diamonds.",
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=60",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=60"
    ]
  },
  {
    id: 4,
    name: "Mid-Century Brass Desk Clock",
    category: "Luxury Accessories",
    subcategory: "Collectibles",
    price: 320.00,
    quantity: 4,
    era: "1950s",
    condition: "Great",
    sku: "COL-5004",
    description: "Mid-century modern Swiss brass mechanical desk clock with 8-day power reserve, heavy solid brass casing, and flawless ticking mechanism.",
    image_url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=60",
    images: [
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=60"
    ]
  }
];

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState('');
  const [qtyInput, setQtyInput] = useState(1);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isMagnified, setIsMagnified] = useState(false);

  useEffect(() => {
    let allProds = DEFAULT_PRODUCTS;
    try {
      const saved = localStorage.getItem('va_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          allProds = parsed;
        }
      }
    } catch (e) {}

    const found = allProds.find(p => String(p.id) === String(id));
    if (found) {
      setProduct(found);
      const initialPhoto = (found.images && found.images.length > 0) 
        ? found.images[0] 
        : (found.image_url || '/uploads/placeholder.jpg');
      setSelectedImg(initialPhoto);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <i className="fa-solid fa-gem" style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '16px' }}></i>
        <h2 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Vault Artifact Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>The requested vintage piece is currently unavailable or has been archived.</p>
        <Link to="/products" className="btn btn-gold">Explore Vault Catalog</Link>
      </div>
    );
  }

  const allImages = (product.images && Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [product.image_url || '/uploads/placeholder.jpg'];

  const currentPhoto = selectedImg || allImages[0];
  const currentIndex = allImages.indexOf(currentPhoto);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImg(allImages[prevIdx]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % allImages.length;
    setSelectedImg(allImages[nextIdx]);
  };

  const handleAddToCart = () => {
    addToCart(product, qtyInput);
    showToast(`Added ${product.name} (${qtyInput}) to your bag!`, 'success');
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/products" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-arrow-left"></i> Back to Catalog Collection
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'start' }}>
        {/* Gallery Section */}
        <div>
          <div style={{
            position: 'relative',
            background: '#0d0f15',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-sm)',
            height: '460px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <img
              src={currentPhoto}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block',
                transition: 'transform 0.3s ease',
                cursor: 'zoom-in'
              }}
              onClick={() => setShowZoomModal(true)}
            />

            {product.era && (
              <span className="badge-era" style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5 }}>{product.era}</span>
            )}
            <span className={`badge-stock ${product.quantity === 0 ? 'out-of-stock' : (product.quantity <= 3 ? 'low-stock' : 'in-stock')}`} style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 5 }}>
              {product.quantity > 0 ? `${product.quantity} units available` : 'Vaulted'}
            </span>

            {/* Magnifier Button */}
            <button
              onClick={() => setShowZoomModal(true)}
              className="btn btn-gold btn-sm"
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                zIndex: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              <i className="fa-solid fa-magnifying-glass-plus"></i> Magnify Image
            </button>
          </div>

          {/* Thumbnails row */}
          {allImages.length > 1 && (
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                Multiple Angles ({allImages.length} photos):
              </div>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: (currentPhoto === img) ? '2px solid var(--color-gold)' : '1px solid var(--border-color)',
                      opacity: (currentPhoto === img) ? 1 : 0.6,
                      boxShadow: (currentPhoto === img) ? '0 0 12px rgba(212, 175, 55, 0.4)' : 'none',
                      transition: 'all 0.2s ease',
                      background: '#0d0f15'
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info & Spec Details */}
        <div>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-gold)', letterSpacing: '1.2px', marginBottom: '8px', fontWeight: 600 }}>
            {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
          </div>

          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-text-primary)', marginBottom: '16px', lineHeight: 1.25 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-gold)' }}>
              ${Number(product.price).toFixed(2)}
            </span>
            {product.condition && (
              <span style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--color-gold)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                Condition: {product.condition}
              </span>
            )}
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '28px' }}>
            <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Historical Provenance & Specifications
            </h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '20px' }}>
              {product.description || 'Verified vintage artifact from our curated luxury collection.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <div><strong style={{ color: 'var(--color-text-primary)' }}>SKU Code:</strong> {product.sku || 'N/A'}</div>
              <div><strong style={{ color: 'var(--color-text-primary)' }}>Era / Period:</strong> {product.era || 'Vintage'}</div>
              <div><strong style={{ color: 'var(--color-text-primary)' }}>Condition Grade:</strong> {product.condition || 'Mint'}</div>
              <div><strong style={{ color: 'var(--color-text-primary)' }}>Vault Inventory:</strong> {product.quantity > 0 ? `${product.quantity} In Stock` : 'Vaulted'}</div>
            </div>
          </div>

          {/* Add to Bag Controls */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
            {product.quantity > 0 && (
              <div style={{ width: '100px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Qty</label>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={qtyInput}
                  onChange={e => setQtyInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="form-control"
                  style={{ width: '100%', textAlign: 'center', padding: '12px' }}
                />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'transparent', marginBottom: '4px' }}>Action</label>
              <button
                onClick={handleAddToCart}
                className="btn btn-gold"
                style={{ width: '100%', padding: '14px 24px', fontSize: '1.05rem', fontWeight: 700 }}
                disabled={product.quantity === 0}
              >
                <i className="fa-solid fa-bag-shopping" style={{ marginRight: '8px' }}></i>
                {product.quantity > 0 ? 'Add To Bag' : 'Vaulted / Out of Stock'}
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <div>
              <i className="fa-solid fa-certificate" style={{ color: 'var(--color-gold)', fontSize: '1.5rem', marginBottom: '8px' }}></i>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600 }}>100% Authenticity Verified</div>
            </div>
            <div>
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-gold)', fontSize: '1.5rem', marginBottom: '8px' }}></i>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Insured Courier Transit</div>
            </div>
            <div>
              <i className="fa-solid fa-crown" style={{ color: 'var(--color-gold)', fontSize: '1.5rem', marginBottom: '8px' }}></i>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600 }}>24/7 VIP Concierge Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Image Magnifier Modal */}
      {showZoomModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => { setShowZoomModal(false); setIsMagnified(false); }}
        >
          {/* Top Controls Toolbar */}
          <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '16px', alignItems: 'center', zIndex: 100000 }}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsMagnified(!isMagnified); }}
              className="btn btn-outline btn-sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.5)' }}
            >
              <i className={`fa-solid ${isMagnified ? 'fa-magnifying-glass-minus' : 'fa-magnifying-glass-plus'}`}></i> {isMagnified ? 'Reset 1x' : 'Zoom 2x'}
            </button>
            <button
              onClick={() => { setShowZoomModal(false); setIsMagnified(false); }}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '2.4rem', cursor: 'pointer', lineHeight: 1 }}
            >
              &times;
            </button>
          </div>

          {/* Prev Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={handlePrevImage}
              style={{ position: 'absolute', left: '24px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000 }}
            >
              ‹
            </button>
          )}

          {/* Image Container */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxHeight: '85vh',
              maxWidth: '90vw',
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isMagnified ? 'zoom-out' : 'zoom-in'
            }}
          >
            <img
              src={currentPhoto}
              alt={product.name}
              onClick={() => setIsMagnified(!isMagnified)}
              style={{
                maxHeight: isMagnified ? 'none' : '82vh',
                maxWidth: isMagnified ? 'none' : '88vw',
                transform: isMagnified ? 'scale(1.8)' : 'scale(1)',
                transformOrigin: 'center center',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'block',
                borderRadius: '8px'
              }}
            />
          </div>

          {/* Next Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={handleNextImage}
              style={{ position: 'absolute', right: '24px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000 }}
            >
              ›
            </button>
          )}

          <div style={{ position: 'absolute', bottom: '24px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Photo {currentIndex + 1} of {allImages.length} • Click image to toggle 2x zoom magnification
          </div>
        </div>
      )}
    </div>
  );
};
