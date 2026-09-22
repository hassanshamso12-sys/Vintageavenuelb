// Single Product Detail Page Handler with Firebase Storage Multi-Image Gallery

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 0;">
        <h3 style="color: var(--color-gold);">Product Not Specified</h3>
        <p><a href="/products.html" class="btn btn-outline" style="margin-top: 16px;">Return to Catalog</a></p>
      </div>
    `;
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`);
    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 0;">
          <h3 style="color: var(--color-gold);">Product Not Found</h3>
          <p style="color: var(--color-text-secondary);">${data.error}</p>
          <a href="/products.html" class="btn btn-outline" style="margin-top: 20px;">Return to Catalog</a>
        </div>
      `;
      return;
    }

    const product = data.product;
    const defaultImage = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80';

    let imagesList = [defaultImage];
    if (product.image_url) {
      try {
        if (product.image_url.startsWith('[')) {
          imagesList = JSON.parse(product.image_url);
        } else {
          imagesList = [product.image_url];
        }
      } catch (e) {
        imagesList = [product.image_url];
      }
    }
    if (imagesList.length === 0) imagesList = [defaultImage];

    const mainImageUrl = imagesList[0];

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; align-items: start;">
        <div>
          <!-- Main Display Image (Firebase Storage Preview) -->
          <div style="position: relative; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 16px;">
            <img id="gallery-main-img" src="${mainImageUrl}" alt="${product.name}" style="width: 100%; height: 450px; object-fit: cover;" onerror="this.src='${defaultImage}'">
            <span class="badge-era" style="top: 16px; left: 16px;">${product.era || 'Vintage'}</span>
          </div>

          <!-- Thumbnail Strip Gallery -->
          ${imagesList.length > 1 ? `
            <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">
              ${imagesList.map((url, idx) => `
                <img src="${url}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-url="${url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--color-gold)' : 'transparent'};" onerror="this.src='${defaultImage}'">
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div>
          <div style="color: var(--color-gold); text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px;">
            ${product.category} &bull; SKU: ${product.sku}
          </div>
          <h1 style="font-size: 2.8rem; font-weight: 700; margin-bottom: 16px; line-height: 1.2;">${product.name}</h1>
          <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 700; color: var(--color-gold); margin-bottom: 24px;">
            $${product.price.toFixed(2)}
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; gap: 24px; font-size: 0.9rem;">
              <div><strong style="color: var(--color-text-primary);">Condition:</strong> ${product.condition || 'Mint Vintage'}</div>
              <div><strong style="color: var(--color-text-primary);">Availability:</strong> ${product.quantity > 0 ? `<span style="color: #10b981;">In Stock (${product.quantity} units)</span>` : `<span style="color: #ef4444;">Sold Out</span>`}</div>
            </div>
          </div>
          <p style="color: var(--color-text-secondary); font-size: 1.05rem; line-height: 1.8; margin-bottom: 32px;">
            ${product.description || 'No detailed description available.'}
          </p>
          <div style="display: flex; gap: 16px; align-items: center;">
            ${product.quantity > 0 ? `
              <div style="display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: var(--radius-sm); overflow: hidden;">
                <button id="qty-minus" style="background: var(--bg-secondary); border: none; color: var(--color-text-primary); padding: 12px 18px; cursor: pointer;">-</button>
                <input id="qty-input" type="number" value="1" min="1" max="${product.quantity}" style="width: 50px; text-align: center; background: transparent; border: none; color: var(--color-text-primary); font-weight: 600;">
                <button id="qty-plus" style="background: var(--bg-secondary); border: none; color: var(--color-text-primary); padding: 12px 18px; cursor: pointer;">+</button>
              </div>
              <button id="add-to-cart-btn" class="btn btn-gold" style="padding: 14px 32px; font-size: 1rem;">
                Add to Shopping Cart
              </button>
            ` : `
              <button class="btn btn-outline" disabled style="opacity: 0.5; cursor: not-allowed;">Currently Out of Stock</button>
            `}
          </div>
        </div>
      </div>
    `;

    // Interactive Thumbnail Switcher
    const mainImg = document.getElementById('gallery-main-img');
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        const url = e.target.getAttribute('data-url');
        if (mainImg && url) {
          mainImg.src = url;
          document.querySelectorAll('.gallery-thumb').forEach(t => t.style.borderColor = 'transparent');
          e.target.style.borderColor = 'var(--color-gold)';
        }
      });
    });

    const qtyInput = document.getElementById('qty-input');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const addBtn = document.getElementById('add-to-cart-btn');

    if (qtyMinus && qtyPlus && qtyInput) {
      qtyMinus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10);
        if (val > 1) qtyInput.value = val - 1;
      });
      qtyPlus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10);
        if (val < product.quantity) qtyInput.value = val + 1;
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        Cart.addItem({
          ...product,
          image_url: mainImageUrl
        }, qty);
      });
    }

  } catch (err) {
    console.error('Error fetching product:', err);
    container.innerHTML = `<div class="error-msg">Failed to load product details.</div>`;
  }
});
