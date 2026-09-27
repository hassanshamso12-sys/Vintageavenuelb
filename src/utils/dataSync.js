// Vintage Avenue Unified Cross-Device Data & Catalog Sync Manager

export const UNIFIED_DEFAULT_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Apparel & Clothing',
    slug: 'apparel',
    subcategories: [
      { id: 'sub-1', name: 'Vintage Jackets' },
      { id: 'sub-2', name: 'Luxury Hoodies' },
      { id: 'sub-3', name: 'Denim & Jeans' },
      { id: 'sub-4', name: 'Knitwear & Sweaters' }
    ]
  },
  {
    id: 'cat-2',
    name: 'Rare Watches',
    slug: 'watches',
    subcategories: [
      { id: 'sub-5', name: 'Automatic Chronographs' },
      { id: 'sub-6', name: 'Gold Vintage Watches' },
      { id: 'sub-7', name: 'Pocket Watches' }
    ]
  },
  {
    id: 'cat-3',
    name: 'Luxury Accessories',
    slug: 'accessories',
    subcategories: [
      { id: 'sub-8', name: 'Jewelry & Rings' },
      { id: 'sub-9', name: 'Collectibles' },
      { id: 'sub-10', name: 'Leather Bags' },
      { id: 'sub-11', name: 'Scarves & Ties' }
    ]
  }
];

export const UNIFIED_DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "1976 Vintage Moto Leather Jacket",
    category: "Apparel & Clothing",
    subcategory: "Vintage Jackets",
    price: 349.99,
    cost_price: 180.00,
    quantity: 3,
    era: "1970s",
    condition: "Mint Vintage",
    sku: "VA-APP-1976-001",
    description: "Iconic hand-distressed Italian leather motorcycle jacket with original brass zippers, silk quilted lining, and authentic 1970s patina.",
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 2,
    name: "1968 Omega Seamaster Automatic",
    category: "Rare Watches",
    subcategory: "Automatic Chronographs",
    price: 1850.00,
    cost_price: 950.00,
    quantity: 1,
    era: "1960s",
    condition: "Excellent",
    sku: "VA-TMP-1968-002",
    description: "Authentic Swiss-made Omega Seamaster with original stainless steel bracelet, pristine silver sunburst dial, and fully serviced automatic movement.",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 3,
    name: "Victorian Emerald & Diamond Ring",
    category: "Luxury Accessories",
    subcategory: "Jewelry & Rings",
    price: 1200.00,
    cost_price: 600.00,
    quantity: 2,
    era: "Victorian",
    condition: "Pristine",
    sku: "VA-JWL-VIC-003",
    description: "Exquisite 18K yellow gold Victorian cluster ring featuring a natural Colombian emerald surrounded by antique rose-cut diamonds.",
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 4,
    name: "Mid-Century Brass Desk Clock",
    category: "Luxury Accessories",
    subcategory: "Collectibles",
    price: 320.00,
    cost_price: 140.00,
    quantity: 4,
    era: "1950s",
    condition: "Great",
    sku: "VA-COL-1960-004",
    description: "Mid-century modern Swiss brass mechanical desk clock with 8-day power reserve, heavy solid brass casing, and flawless ticking mechanism.",
    image_url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 5,
    name: "Victorian 18K Gold Pearl Necklace",
    category: "Luxury Accessories",
    subcategory: "Jewelry & Rings",
    price: 890.00,
    cost_price: 450.00,
    quantity: 1,
    era: "Victorian",
    condition: "Restored Excellent",
    sku: "VA-JWL-VIC-005",
    description: "Exquisite late 19th-century Victorian hand-strung freshwater pearl necklace with 18K gold clasp.",
    image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 6,
    name: "Vintage Silk Paisley Scarf",
    category: "Luxury Accessories",
    subcategory: "Scarves & Ties",
    price: 115.00,
    cost_price: 40.00,
    quantity: 8,
    era: "1990s",
    condition: "Unused Vintage NOS",
    sku: "VA-ACC-1990-006",
    description: "Italian 100% pure Mulberry silk scarf with intricate hand-rolled edges.",
    image_url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 7,
    name: "Y2K Acid Wash Denim Jacket",
    category: "Apparel & Clothing",
    subcategory: "Denim & Jeans",
    price: 185.00,
    cost_price: 75.00,
    quantity: 5,
    era: "Y2K",
    condition: "Very Good",
    sku: "VA-APP-Y2K-007",
    description: "Classic late 90s/early 2000s heavyweight acid wash denim jacket with silver buttons.",
    image_url: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&auto=format&fit=crop&q=80"
    ]
  }
];

/**
 * Normalizes category names to handle variations gracefully (e.g. 'Apparel' vs 'Apparel & Clothing').
 */
export const normalizeCategory = (cat) => {
  if (!cat) return 'All';
  const c = String(cat).trim().toLowerCase();
  if (c.includes('apparel') || c.includes('clothing')) return 'Apparel & Clothing';
  if (c.includes('watch') || c.includes('timepiece')) return 'Rare Watches';
  if (c.includes('accessor') || c.includes('jewelry') || c.includes('collect')) return 'Luxury Accessories';
  return cat;
};

/**
 * Fetches products from remote API/Cloud, merges with local storage and default seed items,
 * and saves the unified catalog to localStorage.
 */
export const syncCatalogProducts = async () => {
  let remoteProducts = [];
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (data && data.products && Array.isArray(data.products)) {
        remoteProducts = data.products;
      }
    }
  } catch (e) {}

  let localProducts = [];
  try {
    const saved = localStorage.getItem('va_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) localProducts = parsed;
    }
  } catch (e) {}

  let deletedIds = new Set();
  try {
    const deletedSaved = localStorage.getItem('va_deleted_products');
    if (deletedSaved) {
      const parsedDel = JSON.parse(deletedSaved);
      if (Array.isArray(parsedDel)) deletedIds = new Set(parsedDel.map(String));
    }
  } catch (e) {}

  const mergedMap = new Map();

  // 1. Seed base default products
  UNIFIED_DEFAULT_PRODUCTS.forEach(p => {
    if (!deletedIds.has(String(p.id))) {
      mergedMap.set(String(p.id), { ...p });
    }
  });

  // 2. Layer local storage items (which contain local edits / newly created items)
  localProducts.forEach(p => {
    if (p && p.id && !deletedIds.has(String(p.id))) {
      const existing = mergedMap.get(String(p.id)) || {};
      mergedMap.set(String(p.id), { ...existing, ...p });
    }
  });

  // 3. Layer remote server API items
  remoteProducts.forEach(p => {
    if (p && p.id && !deletedIds.has(String(p.id))) {
      const existing = mergedMap.get(String(p.id)) || {};
      mergedMap.set(String(p.id), { ...existing, ...p, category: normalizeCategory(p.category || existing.category) });
    }
  });

  const unifiedList = Array.from(mergedMap.values());
  localStorage.setItem('va_products', JSON.stringify(unifiedList));
  return unifiedList;
};

/**
 * Synchronizes categories tree between remote server, local storage, and unified defaults.
 */
export const syncCatalogCategories = async () => {
  let remoteCategories = [];
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      if (data && data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
        remoteCategories = data.categories;
      }
    }
  } catch (e) {}

  let localCategories = [];
  try {
    const saved = localStorage.getItem('va_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) localCategories = parsed;
    }
  } catch (e) {}

  let finalCategories = UNIFIED_DEFAULT_CATEGORIES;
  if (remoteCategories.length > 0) {
    finalCategories = remoteCategories;
  } else if (localCategories.length > 0) {
    finalCategories = localCategories;
  }

  localStorage.setItem('va_categories', JSON.stringify(finalCategories));
  return finalCategories;
};

/**
 * Adds a new product to unified data store (localStorage + API sync)
 */
export const saveProductToSync = async (product) => {
  const currentProds = await syncCatalogProducts();
  const updatedList = [product, ...currentProds.filter(p => String(p.id) !== String(product.id))];
  localStorage.setItem('va_products', JSON.stringify(updatedList));

  // Sync to backend API if online
  try {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
  } catch (e) {}

  return updatedList;
};

/**
 * Updates an existing product in unified data store (localStorage + API sync)
 */
export const updateProductInSync = async (id, updatedFields) => {
  const currentProds = await syncCatalogProducts();
  const updatedList = currentProds.map(p => String(p.id) === String(id) ? { ...p, ...updatedFields } : p);
  localStorage.setItem('va_products', JSON.stringify(updatedList));

  try {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });
  } catch (e) {}

  return updatedList;
};

/**
 * Deletes a product from unified data store (localStorage + API sync + deletion tracking)
 */
export const deleteProductFromSync = async (id) => {
  let deletedIds = [];
  try {
    const saved = localStorage.getItem('va_deleted_products');
    if (saved) deletedIds = JSON.parse(saved);
  } catch (e) {}

  if (!deletedIds.includes(String(id))) {
    deletedIds.push(String(id));
    localStorage.setItem('va_deleted_products', JSON.stringify(deletedIds));
  }

  let localProds = [];
  try {
    const saved = localStorage.getItem('va_products');
    if (saved) localProds = JSON.parse(saved);
  } catch (e) {}

  const updatedList = localProds.filter(p => String(p.id) !== String(id));
  localStorage.setItem('va_products', JSON.stringify(updatedList));

  try {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  } catch (e) {}

  return updatedList;
};
