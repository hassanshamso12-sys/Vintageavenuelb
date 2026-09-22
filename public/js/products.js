// Products Catalog JavaScript Module

document.addEventListener('DOMContentLoaded', async () => {
  const productGrid = document.getElementById('product-grid');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const subcategoryFilter = document.getElementById('subcategory-filter');
  const sortFilter = document.getElementById('sort-filter');
  const resultsCount = document.getElementById('results-count');

  if (!productGrid) return;

  let allProducts = [];
  let categoryTree = [];

  // Read URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  let initialCategory = urlParams.get('category') || 'All';
  let initialSubcategory = urlParams.get('subcategory') || 'All';

  // Seed fallback products for static hosting
  const DEFAULT_PRODUCTS = [
    { id: 1, name: "1976 Vintage Moto Leather Jacket", category: "Apparel", subcategory: "Jackets", price: 250.00, quantity: 3, era: "1970s", condition: "Mint", sku: "APP-7601", description: "Iconic hand-distressed Italian leather motorcycle jacket with original brass hardware.", image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80" },
    { id: 2, name: "1968 Omega Seamaster Automatic", category: "Timepieces", subcategory: "Mechanical", price: 1850.00, quantity: 1, era: "1960s", condition: "Excellent", sku: "TIM-6802", description: "Authentic Swiss-made Omega Seamaster in solid stainless steel with original patina dial.", image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80" },
    { id: 3, name: "Victorian Emerald & Diamond Ring", category: "Jewelry", subcategory: "Rings", price: 1200.00, quantity: 2, era: "Victorian", condition: "Pristine", sku: "JWL-9903", description: "Exquisite 18K gold Victorian cluster ring featuring a natural Colombian emerald.", image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80" },
    { id: 4, name: "Mid-Century Brass Desk Clock", category: "Collectibles", subcategory: "Clocks", price: 320.00, quantity: 4, era: "1950s", condition: "Great", sku: "COL-5004", description: "Mid-century modern Swiss brass mechanical desk clock with exposed gear movement.", image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80" }
  ];

  const DEFAULT_CATEGORIES = [
    { name: "Apparel", subcategories: [{ name: "Jackets" }, { name: "Dresses" }, { name: "Outerwear" }] },
    { name: "Timepieces", subcategories: [{ name: "Mechanical" }, { name: "Quartz" }, { name: "Pocket Watches" }] },
    { name: "Jewelry", subcategories: [{ name: "Rings" }, { name: "Necklaces" }, { name: "Bracelets" }] },
    { name: "Accessories", subcategories: [{ name: "Scarves" }, { name: "Handbags" }, { name: "Sunglasses" }] },
    { name: "Collectibles", subcategories: [{ name: "Clocks" }, { name: "Artifacts" }, { name: "Sculptures" }] }
  ];

  // Load Categories and Subcategories Tree for storefront filter
  async function loadCategoryFilters() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        categoryTree = data.categories || [];
      } else {
        categoryTree = DEFAULT_CATEGORIES;
      }
    } catch (err) {
      categoryTree = DEFAULT_CATEGORIES;
    }

    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="All">All Categories</option>' +
        categoryTree.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

      if (initialCategory && initialCategory !== 'All') {
        categoryFilter.value = initialCategory;
      }
    }

    updateSubcategoryDropdown(categoryFilter ? categoryFilter.value : 'All', initialSubcategory);
  }

  function updateSubcategoryDropdown(selectedCategory, selectSub = 'All') {
    if (!subcategoryFilter) return;

    const catObj = categoryTree.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
    if (catObj && catObj.subcategories && catObj.subcategories.length > 0) {
      subcategoryFilter.style.display = 'inline-block';
      subcategoryFilter.innerHTML = '<option value="All">All Subcategories</option>' +
        catObj.subcategories.map(s => `<option value="${s.name}">${s.name}</option>`).join('');

      if (selectSub && selectSub !== 'All') {
        const foundSub = catObj.subcategories.find(s => s.name.toLowerCase() === selectSub.toLowerCase());
        if (foundSub) subcategoryFilter.value = foundSub.name;
      }
    } else {
      subcategoryFilter.innerHTML = '<option value="All">All Subcategories</option>';
      if (selectedCategory !== 'All') {
        subcategoryFilter.style.display = 'none';
      } else {
        subcategoryFilter.style.display = 'inline-block';
      }
    }
  }

  // Helper to extract primary image URL if stored as JSON array or single string
  function getPrimaryImageUrl(imgField) {
    const defaultImg = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80';
    if (!imgField) return defaultImg;
    try {
      if (imgField.startsWith('[')) {
        const arr = JSON.parse(imgField);
        return arr.length > 0 ? arr[0] : defaultImg;
      }
    } catch (e) {}
    return imgField;
  }

  // Fetch products from API
  async function fetchProducts() {
    try {
      const category = categoryFilter ? categoryFilter.value : 'All';
      const subcategory = subcategoryFilter ? subcategoryFilter.value : 'All';
      const search = searchInput ? searchInput.value.trim() : '';
      const sort = sortFilter ? sortFilter.value : '';

      const queryParams = new URLSearchParams();
      if (category && category !== 'All') queryParams.append('category', category);
      if (subcategory && subcategory !== 'All') queryParams.append('subcategory', subcategory);
      if (search) queryParams.append('search', search);
      if (sort) queryParams.append('sort', sort);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        allProducts = data.products;
      } else {
        allProducts = filterFallbackProducts(DEFAULT_PRODUCTS, category, subcategory, search, sort);
      }
    } catch (err) {
      const category = categoryFilter ? categoryFilter.value : 'All';
      const subcategory = subcategoryFilter ? subcategoryFilter.value : 'All';
      const search = searchInput ? searchInput.value.trim() : '';
      const sort = sortFilter ? sortFilter.value : '';
      allProducts = filterFallbackProducts(DEFAULT_PRODUCTS, category, subcategory, search, sort);
    }
    renderProducts(allProducts);
  }

  function filterFallbackProducts(list, cat, sub, search, sort) {
    let filtered = [...list];
    if (cat && cat !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }
    if (sub && sub !== 'All') {
      filtered = filtered.filter(p => p.subcategory && p.subcategory.toLowerCase() === sub.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.era && p.era.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q)));
    }
    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'name_asc') filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }

  // Render product cards
  function renderProducts(products) {
    if (resultsCount) {
      resultsCount.textContent = `${products.length} Items`;
    }

    if (products.length === 0) {
      productGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
          <h3 style="color: var(--color-gold); margin-bottom: 8px;">No Vintage Items Found</h3>
          <p style="color: var(--color-text-secondary);">Try adjusting your search query or category filters.</p>
        </div>
      `;
      return;
    }

    productGrid.innerHTML = products.map(product => {
      let stockBadgeClass = 'in-stock';
      let stockText = `${product.quantity} in stock`;

      if (product.quantity === 0) {
        stockBadgeClass = 'out-of-stock';
        stockText = 'Out of Stock';
      } else if (product.quantity <= 3) {
        stockBadgeClass = 'low-stock';
        stockText = `Low Stock (${product.quantity})`;
      }

      const imageUrl = getPrimaryImageUrl(product.image_url);
      const defaultImage = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80';

      return `
        <div class="product-card">
          <div class="product-image-wrap">
            <img src="${imageUrl}" alt="${product.name}" onerror="this.src='${defaultImage}'">
            <span class="badge-era">${product.era || 'Vintage'}</span>
            <span class="badge-stock ${stockBadgeClass}">${stockText}</span>
          </div>
          <div class="product-info">
            <div class="product-category">
              ${product.category} ${product.subcategory ? `&bull; <span style="color: var(--color-gold);">${product.subcategory}</span>` : ''} &bull; ${product.condition || 'Mint'}
            </div>
            <h3 class="product-name">
              <a href="/product.html?id=${product.id}">${product.name}</a>
            </h3>
            <p class="product-description">${product.description || ''}</p>
            <div class="product-bottom">
              <div class="product-price">$${product.price.toFixed(2)}</div>
              ${product.quantity > 0 ? `
                <button class="btn btn-gold btn-sm add-cart-btn" data-id="${product.id}">
                  Add to Cart
                </button>
              ` : `
                <button class="btn btn-outline btn-sm" disabled style="opacity: 0.5; cursor: not-allowed;">
                  Sold Out
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners for Add to Cart buttons
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prodId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        const product = allProducts.find(p => p.id === prodId);
        if (product) {
          Cart.addItem({
            ...product,
            image_url: getPrimaryImageUrl(product.image_url)
          }, 1);
        }
      });
    });
  }

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fetchProducts, 300);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      updateSubcategoryDropdown(categoryFilter.value, 'All');
      fetchProducts();
    });
  }

  if (subcategoryFilter) {
    subcategoryFilter.addEventListener('change', fetchProducts);
  }

  if (sortFilter) sortFilter.addEventListener('change', fetchProducts);

  await loadCategoryFilters();
  fetchProducts();
});
