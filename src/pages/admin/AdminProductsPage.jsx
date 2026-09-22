import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/ToastContainer';

const DEFAULT_PRODUCTS = [
  { id: 1, name: "1976 Vintage Moto Leather Jacket", category: "Apparel & Clothing", subcategory: "Vintage Jackets", price: 250.00, quantity: 3, era: "1970s", condition: "Mint", sku: "APP-7601", description: "Iconic hand-distressed Italian leather motorcycle jacket." },
  { id: 2, name: "1968 Omega Seamaster Automatic", category: "Rare Watches", subcategory: "Automatic Chronographs", price: 1850.00, quantity: 1, era: "1960s", condition: "Excellent", sku: "TIM-6802", description: "Authentic Swiss-made Omega Seamaster." },
  { id: 3, name: "Victorian Emerald & Diamond Ring", category: "Luxury Accessories", subcategory: "Jewelry & Rings", price: 1200.00, quantity: 2, era: "Victorian", condition: "Pristine", sku: "JWL-9903", description: "Exquisite 18K gold Victorian cluster ring." },
  { id: 4, name: "Mid-Century Brass Desk Clock", category: "Luxury Accessories", subcategory: "Collectibles", price: 320.00, quantity: 4, era: "1950s", condition: "Great", sku: "COL-5004", description: "Mid-century modern Swiss brass mechanical desk clock." }
];

export const AdminProductsPage = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    loadProducts();
  }, []);

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

    const local = localStorage.getItem('va_products');
    setProducts(local ? JSON.parse(local) : DEFAULT_PRODUCTS);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete product '${name}'?`)) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('va_products', JSON.stringify(updated));

      fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
      showToast(`Product '${name}' deleted!`, 'success');
    }
  };

  const filtered = products.filter(p => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)' }}>
            Vault Product Inventory
          </h1>
          <p className="section-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
            Manage catalog items, pricing, SKUs, eras, and stock quantities
          </p>
        </div>
        <Link to="/admin/products/new" className="btn btn-gold">
          <i className="fa-solid fa-plus"></i> Add New Product
        </Link>
      </div>

      <div className="filter-toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search products by title or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="form-control" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Apparel & Clothing">Apparel & Clothing</option>
          <option value="Rare Watches">Rare Watches</option>
          <option value="Luxury Accessories">Luxury Accessories</option>
        </select>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Era / Condition</th>
              <th>Price ($)</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id}>
                  <td><code>{p.sku}</code></td>
                  <td><strong>{p.name}</strong></td>
                  <td>
                    <strong>{p.category}</strong>
                    {p.subcategory && <><br /><small style={{ color: 'var(--color-gold)' }}>• {p.subcategory}</small></>}
                  </td>
                  <td>{p.era || 'Vintage'} • {p.condition || 'Mint'}</td>
                  <td style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                    ${Number(p.price).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge-stock ${p.quantity === 0 ? 'out-of-stock' : (p.quantity <= 3 ? 'low-stock' : 'in-stock')}`}>
                      {p.quantity} units
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/admin/products/edit/${p.id}`} className="btn btn-outline btn-sm">Edit</Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
