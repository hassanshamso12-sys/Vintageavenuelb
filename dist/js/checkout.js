// Checkout Page Handler with Dual Payment & Auto PDF Invoice Generator

document.addEventListener('DOMContentLoaded', async () => {
  const checkoutItemsContainer = document.getElementById('checkout-items');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const discountEl = document.getElementById('checkout-discount');
  const totalEl = document.getElementById('checkout-total');
  const checkoutForm = document.getElementById('checkout-form');
  const submitBtn = document.getElementById('place-order-btn');

  const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
  const whishBox = document.getElementById('whish-barcode-box');
  const whishImgWrap = document.getElementById('whish-img-wrap');

  // Load Whish barcode image URL from site settings
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (res.ok && data.settings && data.settings.whish_barcode_url) {
      if (whishImgWrap) {
        whishImgWrap.innerHTML = `
          <img src="${data.settings.whish_barcode_url}" alt="Whish Barcode" style="max-width: 100%; height: auto; border-radius: 4px;">
        `;
      }
    }
  } catch (e) {
    console.error('Error fetching settings for barcode:', e);
  }

  // Toggle Whish barcode box visibility
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (whishBox) {
        whishBox.style.display = e.target.value === 'WhishMoney' ? 'block' : 'none';
      }
    });
  });

  function renderCheckoutSummary() {
    const cart = Cart.getCart();

    if (!checkoutItemsContainer) return;

    if (cart.length === 0) {
      checkoutItemsContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--color-text-secondary);">
          Your cart is currently empty. <br>
          <a href="/products.html" class="btn btn-outline btn-sm" style="margin-top: 12px;">Browse Collection</a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '$0.00';
      if (discountEl) discountEl.textContent = '-$0.00';
      if (totalEl) totalEl.textContent = '$0.00';
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    checkoutItemsContainer.innerHTML = cart.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
        <div>
          <div style="font-weight: 600; color: var(--color-text-primary);">${item.name}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-secondary);">${item.quantity} x $${item.price.toFixed(2)}</div>
        </div>
        <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--color-gold);">
          $${(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    `).join('');

    const subtotal = Cart.getSubtotalPrice();
    const discount = Cart.getDiscountAmount();
    const total = Cart.getFinalTotal();

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    if (submitBtn) submitBtn.disabled = false;
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const cart = Cart.getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty!', 'warning');
        return;
      }

      const name = document.getElementById('cust-name').value.trim();
      const phone = document.getElementById('cust-phone').value.trim();
      const email = document.getElementById('cust-email') ? document.getElementById('cust-email').value.trim() : '';
      const address = document.getElementById('cust-address') ? document.getElementById('cust-address').value.trim() : '';

      const selectedPaymentRadio = document.querySelector('input[name="payment-method"]:checked');
      const paymentMethod = selectedPaymentRadio ? selectedPaymentRadio.value : 'COD';

      if (!name || !phone) {
        showToast('Please enter your full name and obligatory phone number.', 'warning');
        return;
      }

      const payload = {
        customer: { name, phone, email, address },
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod,
        couponCode: Cart.appliedCoupon ? Cart.appliedCoupon.code : null
      };

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Processing Order...';
        }

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
          Cart.clearCart();
          showToast('Order placed successfully!', 'success');

          // Confirmation View with Download PDF Invoice Button
          const container = document.getElementById('checkout-main-wrap');
          if (container) {
            container.innerHTML = `
              <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 60px 40px; text-align: center; max-width: 650px; margin: 40px auto;">
                <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #10b981; font-size: 2rem;">
                  ✓
                </div>
                <h2 style="font-size: 2.4rem; font-weight: 700; color: var(--color-gold); margin-bottom: 12px;">Order Confirmed!</h2>
                <p style="color: var(--color-text-secondary); font-size: 1.1rem; margin-bottom: 24px;">
                  Thank you for your purchase, <strong>${name}</strong>. Your order reference ID is <strong>#${data.orderId}</strong>.
                </p>
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 20px; margin-bottom: 32px; text-align: left;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: var(--color-text-muted);">Payment Method</span>
                    <strong>${paymentMethod === 'WhishMoney' ? 'Whish Money (Barcode)' : 'Cash on Delivery (COD)'}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; color: var(--color-gold); border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <span>Total Paid</span>
                    <span>$${data.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div style="display: flex; gap: 16px; justify-content: center;">
                  <a href="/api/invoices/${data.orderId}/invoice" target="_blank" class="btn btn-outline">
                    <i class="fa-solid fa-file-pdf"></i> Download PDF Invoice
                  </a>
                  <a href="/products.html" class="btn btn-gold">Continue Shopping</a>
                </div>
              </div>
            `;
          }
        } else {
          showToast(data.error || 'Failed to process order.', 'danger');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order Now';
          }
        }
      } catch (err) {
        console.error('Order submission error:', err);
        showToast('Network error processing checkout. Please try again.', 'danger');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Place Order Now';
        }
      }
    });
  }

  renderCheckoutSummary();
});
