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

  // Load Categories and Subcategories Tree for storefront filter
  async function loadCategoryFilters() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      categoryTree = data.categories || [];

      if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="All">All Categories</option>' +
          categoryTree.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

        if (initialCategory && initialCategory !== 'All') {
          categoryFilter.value = initialCategory;
        }
      }

      updateSubcategoryDropdown(categoryFilter ? categoryFilter.value : 'All', initialSubcategory);
    } catch (err) {
      console.error('Failed to load category filters:', err);
    }
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
      const data = await res.json();

      if (res.ok) {
        allProducts = data.products;
        renderProducts(allProducts);
      } else {
        productGrid.innerHTML = `<div class="error-msg">Error loading products: ${data.error}</div>`;
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      productGrid.innerHTML = `<div class="error-msg">Failed to connect to API server.</div>`;
    }
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
