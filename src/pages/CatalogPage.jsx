import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const DEFAULT_PRODUCTS = [
  { id: 1, name: "1976 Vintage Moto Leather Jacket", category: "Apparel & Clothing", subcategory: "Vintage Jackets", price: 250.00, quantity: 3, era: "1970s", condition: "Mint", sku: "APP-7601", description: "Iconic hand-distressed Italian leather motorcycle jacket with original brass zippers.", image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=60" },
  { id: 2, name: "1968 Omega Seamaster Automatic", category: "Rare Watches", subcategory: "Automatic Chronographs", price: 1850.00, quantity: 1, era: "1960s", condition: "Excellent", sku: "TIM-6802", description: "Authentic Swiss-made Omega Seamaster with original stainless steel bracelet.", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60" },
  { id: 3, name: "Victorian Emerald & Diamond Ring", category: "Luxury Accessories", subcategory: "Jewelry & Rings", price: 1200.00, quantity: 2, era: "Victorian", condition: "Pristine", sku: "JWL-9903", description: "Exquisite 18K gold Victorian cluster ring featuring a natural Colombian emerald.", image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=60" },
  { id: 4, name: "Mid-Century Brass Desk Clock", category: "Luxury Accessories", subcategory: "Collectibles", price: 320.00, quantity: 4, era: "1950s", condition: "Great", sku: "COL-5004", description: "Mid-century modern Swiss brass mechanical desk clock with 8-day power reserve.", image_url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=60" }
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Apparel & Clothing', subcategories: [{ name: 'Vintage Jackets' }, { name: 'Luxury Hoodies' }] },
  { id: 'cat-2', name: 'Rare Watches', subcategories: [{ name: 'Automatic Chronographs' }] },
  { id: 'cat-3', name: 'Luxury Accessories', subcategories: [{ name: 'Leather Bags' }, { name: 'Jewelry & Rings' }, { name: 'Collectibles' }] }
];

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const categoryParam = searchParams.get('category') || 'All';
  const subcategoryParam = searchParams.get('subcategory') || 'All';
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data && data.categories && data.categories.length > 0) {
            setCategories(data.categories);
            return;
          }
        }
      } catch (e) {}
      const savedCats = localStorage.getItem('va_categories');
      setCategories(savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES);
    };

    const loadProducts = async () => {
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
      const savedProds = localStorage.getItem('va_products');
      setProducts(savedProds ? JSON.parse(savedProds) : DEFAULT_PRODUCTS);
    };

    loadCategories();
    loadProducts();
  }, []);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val === 'All') {
      newParams.delete('category');
      newParams.delete('subcategory');
    } else {
      newParams.set('category', val);
      newParams.delete('subcategory');
    }
    setSearchParams(newParams);
  };

  const handleSubcategoryChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val === 'All') {
      newParams.delete('subcategory');
    } else {
      newParams.set('subcategory', val);
    }
    setSearchParams(newParams);
  };

  const currentCatObj = categories.find(c => c.name === categoryParam);

  const filteredProducts = products.filter(p => {
    if (categoryParam !== 'All' && p.category !== categoryParam) return false;
    if (subcategoryParam !== 'All' && p.subcategory !== subcategoryParam) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
      const skuMatch = p.sku ? p.sku.toLowerCase().includes(q) : false;
      if (!nameMatch && !descMatch && !skuMatch) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)' }}>
            The Vault Collection
          </h1>
          <p className="section-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
            Explore authenticated vintage garments, fine mechanical watches, and rare artifacts.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search vault artifacts, SKUs, or eras..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select className="form-control" value={categoryParam} onChange={handleCategoryChange}>
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c.id || c.name} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select className="form-control" value={subcategoryParam} onChange={handleSubcategoryChange}>
            <option value="All">All Subcategories</option>
            {currentCatObj && currentCatObj.subcategories && currentCatObj.subcategories.map(s => (
              <option key={s.id || s.name} value={s.name}>{s.name}</option>
            ))}
          </select>

          <select className="form-control" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="featured">Sort by: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-secondary)' }}>
          <i className="fa-solid fa-gem" style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.4 }}></i>
          <p>No products found matching your current filter criteria.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
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
      )}
    </div>
  );
};
