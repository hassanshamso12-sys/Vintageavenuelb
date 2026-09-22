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

  openDrawer() {
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
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (res.ok && data.settings) {
      const s = data.settings;
      if (s.theme_palette && s.theme_palette !== 'gold') {
        document.body.classList.add(`theme-${s.theme_palette}`);
      }
      if (s.brand_name) {
        document.querySelectorAll('.brand-logo span').forEach(el => el.textContent = s.brand_name);
      }
      if (s.logo_icon) {
        document.querySelectorAll('.brand-logo i').forEach(el => el.className = `fa-solid ${s.logo_icon}`);
      }
    }
  } catch (e) {
    console.error('Error fetching settings:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  Cart.updateCartBadge();
  applyLiveBrandSettings();

  // Attach drawer open click listeners
  document.querySelectorAll('.cart-icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      Cart.openDrawer();
    });
  });

  const closeBtn = document.getElementById('cart-drawer-close');
  const overlay = document.getElementById('cart-drawer-overlay');

  if (closeBtn) closeBtn.addEventListener('click', () => Cart.closeDrawer());
  if (overlay) overlay.addEventListener('click', () => Cart.closeDrawer());

  // Coupon apply button listener in drawer
  const applyCouponBtn = document.getElementById('drawer-apply-coupon-btn');
  const couponInput = document.getElementById('drawer-coupon-input');
  const couponMsg = document.getElementById('drawer-coupon-msg');

  if (applyCouponBtn && couponInput) {
    applyCouponBtn.addEventListener('click', async () => {
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
    });
  }

  // Load dynamic Categories & Subcategories into Navbar Catalog Dropdown
  async function loadNavbarCategories() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    if (!dropdowns || dropdowns.length === 0) return;

    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      const categories = data.categories || [];

      if (categories.length === 0) return;

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
    } catch (err) {
      console.error('Error fetching navbar categories:', err);
    }
  }

  // Live Site Branding & Custom Logo Loader for Storefront
  async function loadSiteBranding() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        const s = data.settings;
        if (s.theme_palette) {
          document.body.classList.remove('theme-emerald', 'theme-sapphire', 'theme-rose');
          if (s.theme_palette !== 'gold') {
            document.body.classList.add(`theme-${s.theme_palette}`);
          }
        }

        const brandLogoLink = document.querySelector('.brand-logo');
        if (brandLogoLink) {
          const brandText = s.brand_name || 'VINTAGE AVENUE';

          if (s.site_logo_url) {
            brandLogoLink.innerHTML = `<img src="${s.site_logo_url}" alt="${brandText}" class="brand-logo-img"> <span>${brandText}</span>`;
          } else {
            const iconClass = s.logo_icon || 'fa-gem';
            brandLogoLink.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${brandText}</span>`;
          }
        }
      }
    } catch (err) {
      console.error('Failed loading storefront branding settings:', err);
    }
  }

  // Mobile Navigation Drawer & Hamburger Menu Initializer for Storefront
  function initMobileMenu() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (!document.getElementById('mobile-menu-btn')) {
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
              <li><a href="/products.html"><i class="fa-solid fa-store"></i> All Catalog Items</a></li>
              <li><a href="/about.html"><i class="fa-solid fa-book-open"></i> Our Story</a></li>
              <li><a href="/contact.html"><i class="fa-solid fa-envelope"></i> Contact</a></li>
              <li><a href="/admin/login.html" style="color: var(--color-gold);"><i class="fa-solid fa-user-shield"></i> Admin Portal &rarr;</a></li>
            </ul>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', drawerMarkup);
    }

    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-nav-close');
    const overlay = document.getElementById('mobile-nav-overlay');
    const drawer = document.getElementById('mobile-nav-drawer');

    function openMobileNav() {
      if (overlay) overlay.classList.add('active');
      if (drawer) drawer.classList.add('active');
    }

    function closeMobileNav() {
      if (overlay) overlay.classList.remove('active');
      if (drawer) drawer.classList.remove('active');
    }

    if (menuBtn) menuBtn.addEventListener('click', openMobileNav);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);
    if (overlay) overlay.addEventListener('click', closeMobileNav);
  }

  initMobileMenu();
  loadNavbarCategories();
  loadSiteBranding();
});
