// Slide-Over Drawer Cart & Shared State Module

const Cart = {
  appliedCoupon: null, // { code, discountType, discountValue, calculatedDiscount }

  getCart() {
    try {
      return JSON.parse(localStorage.getItem('va_cart') || '[]');
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem('va_cart', JSON.stringify(cart));
    this.updateCartBadge();
    this.renderDrawerCart();
  },

  addItem(product, quantity = 1) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > product.quantity) {
        showToast(`Cannot add more. Only ${product.quantity} items available in stock.`, 'warning');
        return false;
      }
      cart[existingIndex].quantity = newQty;
    } else {
      if (quantity > product.quantity) {
        showToast(`Cannot add. Only ${product.quantity} items available in stock.`, 'warning');
        return false;
      }
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        sku: product.sku,
        stock: product.quantity,
        quantity: quantity
      });
    }

    this.saveCart(cart);
    showToast(`Added '${product.name}' to cart!`, 'success');
    this.openDrawer();
    return true;
  },

  updateQuantity(productId, quantity) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
        return;
      }
      if (quantity > item.stock) {
        showToast(`Maximum available stock for this item is ${item.stock}.`, 'warning');
        return;
      }
      item.quantity = quantity;
      this.saveCart(cart);
    }
  },

  removeItem(productId) {
    let cart = this.getCart();
    cart = cart.filter(i => i.id !== productId);
    this.saveCart(cart);
    showToast('Item removed from cart.', 'info');
  },

  clearCart() {
    localStorage.removeItem('va_cart');
    this.appliedCoupon = null;
    this.updateCartBadge();
    this.renderDrawerCart();
  },

  getTotalCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotalPrice() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getDiscountAmount() {
    if (!this.appliedCoupon) return 0;
    const subtotal = this.getSubtotalPrice();
    if (this.appliedCoupon.discountType === 'percentage') {
      return (subtotal * this.appliedCoupon.discountValue) / 100;
    } else if (this.appliedCoupon.discountType === 'fixed') {
      return Math.min(this.appliedCoupon.discountValue, subtotal);
    }
    return 0;
  },

  getFinalTotal() {
    return Math.max(0, this.getSubtotalPrice() - this.getDiscountAmount());
  },

  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.getTotalCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  ensureDrawerMarkup() {
    if (!document.getElementById('cart-drawer')) {
      const drawerMarkup = `
        <div id="cart-drawer-overlay" class="cart-drawer-overlay"></div>
        <div id="cart-drawer" class="cart-drawer">
          <div class="cart-drawer-header">
            <h3 class="cart-drawer-title"><i class="fa-solid fa-bag-shopping" style="color: var(--color-gold); margin-right: 8px;"></i> Shopping Bag</h3>
            <button id="cart-drawer-close" class="cart-drawer-close">&times;</button>
          </div>
          <div id="cart-drawer-items" class="cart-drawer-body">
            <!-- Loaded dynamically -->
          </div>
          <div class="cart-drawer-footer">
            <div style="margin-bottom: 16px;">
              <div style="display: flex; gap: 8px; margin-bottom: 6px;">
                <input type="text" id="drawer-coupon-input" class="form-control" placeholder="Promo code" style="flex-grow: 1; padding: 8px 12px; font-size: 0.85rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-secondary); color: var(--color-text-primary);">
                <button id="drawer-apply-coupon-btn" class="btn btn-outline btn-sm" style="padding: 8px 12px; font-size: 0.8rem; background: transparent; border: 1px solid var(--color-gold); color: var(--color-gold); border-radius: var(--radius-sm); cursor: pointer;">Apply</button>
              </div>
              <div id="drawer-coupon-msg" style="font-size: 0.8rem;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--color-text-secondary); font-size: 0.9rem;">
              <span>Subtotal</span>
              <span id="drawer-subtotal">$0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #10b981; font-size: 0.9rem;">
              <span>Discount</span>
              <span id="drawer-discount">-$0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; color: var(--color-text-primary); font-size: 1.1rem; font-weight: 700; border-top: 1px solid var(--border-color); padding-top: 10px;">
              <span>Total</span>
              <span id="drawer-total" style="color: var(--color-gold);">$0.00</span>
            </div>
            <a href="/checkout.html" class="btn btn-gold" style="display: block; width: 100%; text-align: center; padding: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; background: var(--color-gold); color: #000; border-radius: var(--radius-sm); font-family: var(--font-heading);">
              Proceed to Checkout &rarr;
            </a>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', drawerMarkup);
    }
  },

  openDrawer() {
    this.ensureDrawerMarkup();
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
      this.renderDrawerCart();
      drawer.classList.add('active');
      overlay.classList.add('active');
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
    }
  },

  renderDrawerCart() {
    this.ensureDrawerMarkup();
    const container = document.getElementById('cart-drawer-items');
    const subtotalEl = document.getElementById('drawer-subtotal');
    const discountEl = document.getElementById('drawer-discount');
    const totalEl = document.getElementById('drawer-total');
    const couponInput = document.getElementById('drawer-coupon-input');
    const couponMsg = document.getElementById('drawer-coupon-msg');

    if (!container) return;

    const cart = this.getCart();

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 0; color: var(--color-text-secondary);">
          <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; color: var(--color-text-muted); margin-bottom: 16px;"></i>
          <p>Your shopping bag is empty.</p>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '$0.00';
      if (discountEl) discountEl.textContent = '-$0.00';
      if (totalEl) totalEl.textContent = '$0.00';
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80';

    container.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <img src="${item.image_url || defaultImg}" alt="${item.name}" class="cart-item-img" onerror="this.src='${defaultImg}'">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-qty">
            <button onclick="Cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
            <span style="font-weight: 600; font-size: 0.9rem;">${item.quantity}</span>
            <button onclick="Cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            <button onclick="Cart.removeItem(${item.id})" style="margin-left: auto; color: #ef4444; border: none; background: transparent; cursor: pointer;" title="Remove Item">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    const subtotal = this.getSubtotalPrice();
    const discount = this.getDiscountAmount();
    const finalTotal = this.getFinalTotal();

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${finalTotal.toFixed(2)}`;

    if (this.appliedCoupon && couponMsg) {
      couponMsg.style.color = '#10b981';
      couponMsg.textContent = `Applied Code '${this.appliedCoupon.code}' (-$${discount.toFixed(2)})`;
    }
  }
};

// Global Toast Notification Helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Fetch live brand settings & theme customization
async function applyLiveBrandSettings() {
  try {
    let s = JSON.parse(localStorage.getItem('va_settings') || '{}');

    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.settings) {
          s = { ...s, ...data.settings };
          localStorage.setItem('va_settings', JSON.stringify(s));
        }
      }
    } catch (e) {
      // ignore fetch failure on static hosting
    }

    if (s.theme_palette) {
      document.body.classList.remove('theme-emerald', 'theme-sapphire', 'theme-rose');
      if (s.theme_palette !== 'gold') {
        document.body.classList.add(`theme-${s.theme_palette}`);
      }
    }

    // Brand Logo & Icon
    const brandLogoLinks = document.querySelectorAll('.brand-logo');
    brandLogoLinks.forEach(brandLogoLink => {
      const brandText = s.brand_name || 'VINTAGE AVENUE';
      if (s.site_logo_url) {
        brandLogoLink.innerHTML = `<img src="${s.site_logo_url}" alt="${brandText}" class="brand-logo-img"> <span>${brandText}</span>`;
      } else {
        const iconClass = s.logo_icon || 'fa-gem';
        brandLogoLink.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${brandText}</span>`;
      }
    });

    // Dynamic CMS Text Content for [data-cms] elements
    document.querySelectorAll('[data-cms]').forEach(el => {
      const key = el.getAttribute('data-cms');
      if (s[key] !== undefined && s[key] !== null && s[key] !== '') {
        el.textContent = s[key];
      }
    });

    // Announcement Bar
    if (s.announcement_text && s.announcement_text.trim() !== '') {
      let bar = document.getElementById('announcement-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'announcement-bar';
        bar.className = 'announcement-bar';
        document.body.insertBefore(bar, document.body.firstChild);
      }
      bar.textContent = s.announcement_text;
    }
  } catch (e) {
    console.error('Failed loading storefront settings:', e);
  }
}

// Mobile Navigation Drawer & Hamburger Menu Initializer
function initMobileMenu() {
  const navActions = document.querySelector('.nav-actions');
  if (navActions && !document.getElementById('mobile-menu-btn')) {
    const btn = document.createElement('button');
    btn.id = 'mobile-menu-btn';
    btn.className = 'mobile-menu-btn';
    btn.setAttribute('aria-label', 'Toggle Navigation');
    btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    navActions.appendChild(btn);
  }

  if (!document.getElementById('mobile-nav-drawer')) {
    const drawerMarkup = `
      <div id="mobile-nav-overlay" class="mobile-nav-overlay"></div>
      <div id="mobile-nav-drawer" class="mobile-nav-drawer">
        <div class="mobile-nav-header">
          <a href="/index.html" class="brand-logo">
            <i class="fa-solid fa-gem"></i>
            <span>VINTAGE AVENUE</span>
          </a>
          <button id="mobile-nav-close" class="mobile-nav-close">&times;</button>
        </div>
        <div class="mobile-nav-body">
          <ul class="mobile-nav-links">
            <li><a href="/index.html"><i class="fa-solid fa-house"></i> Home</a></li>
            <li><a href="/products.html"><i class="fa-solid fa-store"></i> Catalog & Vault</a></li>
            <li><a href="/about.html"><i class="fa-solid fa-book-open"></i> Our Story</a></li>
            <li><a href="/contact.html"><i class="fa-solid fa-envelope"></i> Contact</a></li>
          </ul>

          <div style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-gold); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
              <i class="fa-solid fa-list"></i> Collections & Categories
            </div>
            <ul id="mobile-drawer-categories-list" style="list-style: none; display: flex; flex-direction: column; gap: 6px;">
              <!-- Dynamically loaded -->
            </ul>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerMarkup);
  }
}

// Load dynamic Categories & Subcategories into Navbar Catalog Dropdown & Mobile Drawer
async function loadNavbarCategories() {
  const DEFAULT_CATS = [
    { name: "Apparel", subcategories: [{ name: "Jackets" }, { name: "Dresses" }, { name: "Outerwear" }] },
    { name: "Timepieces", subcategories: [{ name: "Mechanical" }, { name: "Quartz" }, { name: "Pocket Watches" }] },
    { name: "Jewelry", subcategories: [{ name: "Rings" }, { name: "Necklaces" }, { name: "Bracelets" }] },
    { name: "Accessories", subcategories: [{ name: "Scarves" }, { name: "Handbags" }, { name: "Sunglasses" }] },
    { name: "Collectibles", subcategories: [{ name: "Clocks" }, { name: "Artifacts" }, { name: "Sculptures" }] }
  ];

  let categories = [];
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      categories = data.categories || DEFAULT_CATS;
    } else {
      categories = DEFAULT_CATS;
    }
  } catch (err) {
    categories = DEFAULT_CATS;
  }

  if (categories.length === 0) return;

  // Populate desktop nav dropdowns
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (dropdowns.length > 0) {
    let html = `<a href="/products.html" style="font-weight: 700; border-bottom: 1px solid var(--border-color); margin-bottom: 6px; padding-bottom: 8px;"><i class="fa-solid fa-store" style="margin-right: 6px;"></i> All Items</a>`;

    categories.forEach(cat => {
      html += `<a href="/products.html?category=${encodeURIComponent(cat.name)}" class="dropdown-cat-title">${cat.name}</a>`;
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach(sub => {
          html += `<a href="/products.html?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}" class="dropdown-sub-item">&bull; ${sub.name}</a>`;
        });
      }
    });

    dropdowns.forEach(dropdown => {
      dropdown.innerHTML = html;
    });
  }

  // Populate mobile drawer categories accordion
  const mobileCatList = document.getElementById('mobile-drawer-categories-list');
  if (mobileCatList) {
    let mobileHtml = `
      <li>
        <a href="/products.html" style="background: var(--bg-card);"><i class="fa-solid fa-layer-group" style="color: var(--color-gold);"></i> All Products</a>
      </li>
    `;

    categories.forEach(cat => {
      mobileHtml += `
        <li style="margin-bottom: 4px;">
          <a href="/products.html?category=${encodeURIComponent(cat.name)}" style="font-size: 0.88rem; justify-content: space-between; background: var(--bg-card);">
            <span><i class="fa-solid fa-tag" style="font-size: 0.8rem; color: var(--color-gold);"></i> ${cat.name}</span>
            <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem;"></i>
          </a>
      `;
      if (cat.subcategories && cat.subcategories.length > 0) {
        mobileHtml += `<div style="padding-left: 20px; display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">`;
        cat.subcategories.forEach(sub => {
          mobileHtml += `
            <a href="/products.html?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}" style="font-size: 0.8rem; padding: 6px 12px; background: transparent; border: none; color: var(--color-text-secondary);">
              &bull; ${sub.name}
            </a>
          `;
        });
        mobileHtml += `</div>`;
      }
      mobileHtml += `</li>`;
    });

    mobileCatList.innerHTML = mobileHtml;
  }
}

// Global Delegated Event Handlers for Drawers, Buttons & Navbar Dropdowns
document.addEventListener('click', (e) => {
  // Mobile Hamburger Toggle
  const mobileBtn = e.target.closest('#mobile-menu-btn') || e.target.closest('.mobile-menu-btn');
  if (mobileBtn) {
    e.preventDefault();
    initMobileMenu();
    const overlay = document.getElementById('mobile-nav-overlay');
    const drawer = document.getElementById('mobile-nav-drawer');
    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');
    return;
  }

  // Mobile Drawer Close
  if (e.target.closest('#mobile-nav-close') || e.target.closest('#mobile-nav-overlay')) {
    const overlay = document.getElementById('mobile-nav-overlay');
    const drawer = document.getElementById('mobile-nav-drawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
    return;
  }

  // Cart Bag Icon & Drawer Trigger
  const cartBtn = e.target.closest('.cart-icon-btn') || e.target.closest('[data-action="open-cart"]');
  if (cartBtn) {
    e.preventDefault();
    Cart.openDrawer();
    return;
  }

  // Cart Drawer Close
  if (e.target.closest('#cart-drawer-close') || e.target.closest('#cart-drawer-overlay')) {
    Cart.closeDrawer();
    return;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  Cart.ensureDrawerMarkup();
  Cart.updateCartBadge();
  applyLiveBrandSettings();
  initMobileMenu();
  loadNavbarCategories();

  // Attach drawer coupon listener
  document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'drawer-apply-coupon-btn') {
      const couponInput = document.getElementById('drawer-coupon-input');
      const couponMsg = document.getElementById('drawer-coupon-msg');
      if (!couponInput) return;

      const code = couponInput.value.trim();
      if (!code) {
        showToast('Please enter a coupon code.', 'warning');
        return;
      }

      const subtotal = Cart.getSubtotalPrice();
      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, orderAmount: subtotal })
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          Cart.appliedCoupon = data;
          showToast(`Coupon '${data.code}' applied!`, 'success');
          Cart.renderDrawerCart();
        } else {
          if (couponMsg) {
            couponMsg.style.color = '#ef4444';
            couponMsg.textContent = data.error || 'Invalid coupon code.';
          }
          showToast(data.error || 'Invalid coupon code.', 'danger');
        }
      } catch (err) {
        showToast('Error validating coupon.', 'danger');
      }
    }
  });

  // Handle Catalog Dropdown Toggling on Desktop & Mobile
  const dropdownItems = document.querySelectorAll('.has-dropdown');
  dropdownItems.forEach(item => {
    const link = item.querySelector('a');
    const dropdown = item.querySelector('.nav-dropdown');
    if (!link) return;

    link.addEventListener('click', (e) => {
      const isChevron = e.target.classList.contains('fa-chevron-down') || e.target.closest('.fa-chevron-down');
      const isActive = item.classList.contains('active') || (dropdown && dropdown.classList.contains('show'));

      if (isChevron || !isActive) {
        e.preventDefault();
        e.stopPropagation();
        dropdownItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherDD = other.querySelector('.nav-dropdown');
            if (otherDD) otherDD.classList.remove('show');
          }
        });

        item.classList.toggle('active');
        if (dropdown) dropdown.classList.toggle('show');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      dropdownItems.forEach(item => {
        item.classList.remove('active');
        const dropdown = item.querySelector('.nav-dropdown');
        if (dropdown) dropdown.classList.remove('show');
      });
    }
  });
});

