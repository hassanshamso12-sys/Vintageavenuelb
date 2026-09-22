import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ToastContainer';

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Apparel & Clothing', slug: 'apparel', subcategories: [{ id: 'sub-1', name: 'Vintage Jackets' }, { id: 'sub-2', name: 'Luxury Hoodies' }, { id: 'sub-3', name: 'Retro Shirts' }] },
  { id: 'cat-2', name: 'Rare Watches', slug: 'watches', subcategories: [{ id: 'sub-4', name: 'Automatic Chronographs' }, { id: 'sub-5', name: 'Gold Vintage Watches' }] },
  { id: 'cat-3', name: 'Luxury Accessories', slug: 'accessories', subcategories: [{ id: 'sub-6', name: 'Leather Bags' }, { id: 'sub-7', name: 'Jewelry & Rings' }, { id: 'sub-8', name: 'Collectibles' }] }
];

export const AdminCategoriesPage = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [catNameInput, setCatNameInput] = useState('');
  const [parentCatObj, setParentCatObj] = useState(null);
  const [subNameInput, setSubNameInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

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

    const saved = localStorage.getItem('va_categories');
    setCategories(saved ? JSON.parse(saved) : DEFAULT_CATEGORIES);
  };

  const saveCategoriesToStorage = (newCats) => {
    setCategories(newCats);
    localStorage.setItem('va_categories', JSON.stringify(newCats));
  };

  const handleSaveMainCategory = (e) => {
    e.preventDefault();
    if (!catNameInput.trim()) return;

    if (editCatId) {
      const updated = categories.map(c => c.id === editCatId ? { ...c, name: catNameInput.trim() } : c);
      saveCategoriesToStorage(updated);
      showToast('Category updated!', 'success');
    } else {
      const newCat = {
        id: 'cat-' + Date.now(),
        name: catNameInput.trim(),
        slug: catNameInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
        subcategories: []
      };
      saveCategoriesToStorage([...categories, newCat]);
      showToast('Category created!', 'success');
    }

    setShowCatModal(false);
    setCatNameInput('');
    setEditCatId(null);
  };

  const handleAddSubcategory = (e) => {
    e.preventDefault();
    if (!subNameInput.trim() || !parentCatObj) return;

    const newSub = { id: 'sub-' + Date.now(), name: subNameInput.trim() };
    const updated = categories.map(c => {
      if (c.id === parentCatObj.id) {
        return { ...c, subcategories: [...(c.subcategories || []), newSub] };
      }
      return c;
    });

    saveCategoriesToStorage(updated);
    showToast('Subcategory added!', 'success');
    setShowSubModal(false);
    setSubNameInput('');
  };

  const handleDeleteCategory = (id, name) => {
    if (window.confirm(`Delete category '${name}' and all subcategories?`)) {
      const updated = categories.filter(c => c.id !== id);
      saveCategoriesToStorage(updated);
      showToast('Category deleted', 'success');
    }
  };

  const handleDeleteSubcategory = (catId, subId) => {
    const updated = categories.map(c => {
      if (c.id === catId) {
        return { ...c, subcategories: c.subcategories.filter(s => s.id !== subId) };
      }
      return c;
    });
    saveCategoriesToStorage(updated);
    showToast('Subcategory removed', 'success');
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)' }}>
            Category & Subcategory Hierarchy
          </h1>
          <p className="section-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
            Organize products into main categories and subcategories for the storefront catalog dropdown
          </p>
        </div>
        <button onClick={() => { setEditCatId(null); setCatNameInput(''); setShowCatModal(true); }} className="btn btn-gold">
          <i className="fa-solid fa-plus"></i> Add Main Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-folder"></i> {cat.name}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => { setEditCatId(cat.id); setCatNameInput(cat.name); setShowCatModal(true); }} className="btn btn-outline btn-sm">Edit</button>
                <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="btn btn-danger btn-sm">Delete</button>
                <button onClick={() => { setParentCatObj(cat); setSubNameInput(''); setShowSubModal(true); }} className="btn btn-gold btn-sm">+ Sub</button>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Subcategories ({cat.subcategories ? cat.subcategories.length : 0}):
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(!cat.subcategories || cat.subcategories.length === 0) ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>No subcategories added yet.</span>
              ) : (
                cat.subcategories.map(sub => (
                  <div key={sub.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{sub.name}</span>
                    <i className="fa-solid fa-xmark" onClick={() => handleDeleteSubcategory(cat.id, sub.id)} style={{ cursor: 'pointer', color: '#ef4444' }}></i>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Category Modal */}
      {showCatModal && (
        <div className="modal-overlay active" onClick={() => setShowCatModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-gold)', marginBottom: '16px' }}>
              {editCatId ? 'Edit Category' : 'Add Main Category'}
            </h3>
            <form onSubmit={handleSaveMainCategory}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Category Name *</label>
                <input type="text" required className="form-control" style={{ width: '100%' }} value={catNameInput} onChange={e => setCatNameInput(e.target.value)} placeholder="e.g., Apparel, Watches, Accessories" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCatModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-gold">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubModal && (
        <div className="modal-overlay active" onClick={() => setShowSubModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-gold)', marginBottom: '16px' }}>
              Add Subcategory
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Parent: <strong>{parentCatObj?.name}</strong>
            </p>
            <form onSubmit={handleAddSubcategory}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>Subcategory Name *</label>
                <input type="text" required className="form-control" style={{ width: '100%' }} value={subNameInput} onChange={e => setSubNameInput(e.target.value)} placeholder="e.g., Vintage Jackets" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowSubModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-gold">Add Subcategory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
