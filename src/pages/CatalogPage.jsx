import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { syncCatalogProducts, syncCatalogCategories, normalizeCategory } from '../utils/dataSync';

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
    const initData = async () => {
      const catList = await syncCatalogCategories();
      setCategories(catList);
      const prodList = await syncCatalogProducts();
      setProducts(prodList);
    };
    initData();
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

  const currentCatObj = categories.find(c => normalizeCategory(c.name) === normalizeCategory(categoryParam));

  const filteredProducts = products.filter(p => {
    if (categoryParam !== 'All' && normalizeCategory(p.category) !== normalizeCategory(categoryParam)) return false;
    if (subcategoryParam !== 'All' && p.subcategory && p.subcategory.toLowerCase() !== subcategoryParam.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
      const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
      const skuMatch = p.sku ? p.sku.toLowerCase().includes(q) : false;
      const eraMatch = p.era ? p.era.toLowerCase().includes(q) : false;
      if (!nameMatch && !descMatch && !skuMatch && !eraMatch) return false;
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
