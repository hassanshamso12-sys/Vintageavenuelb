// Admin Order Management JavaScript Handler with Custom In-App Modal & Dual Statuses

document.addEventListener('DOMContentLoaded', async () => {
  const ordersTableBody = document.getElementById('admin-orders-table-body');
  const deliveryStatusFilter = document.getElementById('admin-delivery-status-filter');
  const paymentStatusFilter = document.getElementById('admin-payment-status-filter');
  const searchInput = document.getElementById('admin-order-search');

  // Modal elements
  const modalOverlay = document.getElementById('discount-modal-overlay');
  const modalOrderInfo = document.getElementById('modal-order-info');
  const modalDiscountInput = document.getElementById('modal-discount-input');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalApplyBtn = document.getElementById('modal-apply-btn');

  let activeOrderId = null;

  if (!ordersTableBody) return;

  const authenticated = await AdminAuth.checkAuthOrRedirect();
  if (!authenticated) return;

  function getFallbackOrders() {
    try {
      const stored = localStorage.getItem('va_orders');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    const defaultOrders = [
      { id: 1001, customer_name: "Lubna Armawed", customer_phone: "+961 70 123 456", customer_email: "lubna@vintage.com", total_amount: 435.00, delivery_status: "Processing", payment_status: "Paid", created_at: "2026-09-22T14:30:00Z" },
      { id: 1002, customer_name: "Hassan Shamso", customer_phone: "+961 03 987 654", customer_email: "hassan@vintage.com", total_amount: 1850.00, delivery_status: "Completed", payment_status: "Paid", created_at: "2026-09-21T18:15:00Z" }
    ];
    localStorage.setItem('va_orders', JSON.stringify(defaultOrders));
    return defaultOrders;
  }

  async function fetchOrders() {
    try {
      const deliveryStatus = deliveryStatusFilter ? deliveryStatusFilter.value : 'All';
      const paymentStatus = paymentStatusFilter ? paymentStatusFilter.value : 'All';
      const search = searchInput ? searchInput.value.trim() : '';

      const queryParams = new URLSearchParams();
      if (deliveryStatus && deliveryStatus !== 'All') queryParams.append('deliveryStatus', deliveryStatus);
      if (paymentStatus && paymentStatus !== 'All') queryParams.append('paymentStatus', paymentStatus);
      if (search) queryParams.append('search', search);

      const res = await fetch(`/api/orders?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${AdminAuth.getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        renderOrders(data.orders || []);
        return;
      }
    } catch (err) {
      console.warn('API server unreachable, rendering fallback orders list');
    }

    renderOrders(getFallbackOrders());
  }

  function renderOrders(orders) {
    if (orders.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--color-text-secondary); padding: 40px;">
            No orders found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    ordersTableBody.innerHTML = orders.map(order => `
      <tr>
        <td><strong>#${order.id}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--color-text-primary);">${order.customer_name}</div>
          <div style="font-size: 0.8rem; color: var(--color-gold);"><i class="fa-solid fa-phone"></i> ${order.customer_phone}</div>
          ${order.customer_email ? `<div style="font-size: 0.75rem; color: var(--color-text-muted);">${order.customer_email}</div>` : ''}
        </td>
        <td>
          <div style="font-weight: 600;">${order.payment_method === 'WhishMoney' ? 'Whish Money (Barcode)' : 'COD (Cash)'}</div>
          <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${order.item_count} items</div>
        </td>
        <td>
          <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--color-gold);">$${order.total_amount.toFixed(2)}</div>
          ${order.discount_amount > 0 ? `<div style="font-size: 0.75rem; color: #10b981;">(Discount: -$${order.discount_amount.toFixed(2)})</div>` : ''}
        </td>
        <td>
          <select class="form-control delivery-status-select" data-id="${order.id}" style="padding: 4px 8px; font-size: 0.8rem;">
            <option value="Pending" ${order.delivery_status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Dispatched" ${order.delivery_status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
            <option value="In Transit" ${order.delivery_status === 'In Transit' ? 'selected' : ''}>In Transit</option>
            <option value="Delivered" ${order.delivery_status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${order.delivery_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <select class="form-control payment-status-select" data-id="${order.id}" style="padding: 4px 8px; font-size: 0.8rem;">
            <option value="Unpaid" ${order.payment_status === 'Unpaid' ? 'selected' : ''}>Unpaid</option>
            <option value="Paid" ${order.payment_status === 'Paid' ? 'selected' : ''}>Paid</option>
            <option value="Refunded" ${order.payment_status === 'Refunded' ? 'selected' : ''}>Refunded</option>
          </select>
        </td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <a href="/api/invoices/${order.id}/invoice" target="_blank" class="btn btn-outline btn-sm" title="PDF Invoice Packing List">
              <i class="fa-solid fa-file-pdf"></i> PDF
            </a>
            <button class="btn btn-gold btn-sm open-discount-modal-btn" data-id="${order.id}" data-name="${order.customer_name}" data-total="${order.total_amount}" data-discount="${order.discount_amount}">
              Discount
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Delivery Status change
    document.querySelectorAll('.delivery-status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const orderId = e.target.getAttribute('data-id');
        const delivery_status = e.target.value;

        try {
          const res = await fetch(`/api/orders/${orderId}/statuses`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${AdminAuth.getToken()}`
            },
            body: JSON.stringify({ delivery_status })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(`Order #${orderId} delivery status set to ${delivery_status}`, 'success');
            fetchOrders();
          } else {
            showToast(data.error || 'Failed to update delivery status', 'danger');
          }
        } catch (err) {
          showToast('Network error updating delivery status', 'danger');
        }
      });
    });

    // Payment Status change
    document.querySelectorAll('.payment-status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const orderId = e.target.getAttribute('data-id');
        const payment_status = e.target.value;

        try {
          const res = await fetch(`/api/orders/${orderId}/statuses`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${AdminAuth.getToken()}`
            },
            body: JSON.stringify({ payment_status })
          });
          const data = await res.json();
          if (res.ok) {
            showToast(`Order #${orderId} payment status set to ${payment_status}`, 'success');
            fetchOrders();
          } else {
            showToast(data.error || 'Failed to update payment status', 'danger');
          }
        } catch (err) {
          showToast('Network error updating payment status', 'danger');
        }
      });
    });

    // In-App Custom Discount Modal Trigger
    document.querySelectorAll('.open-discount-modal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const custName = e.currentTarget.getAttribute('data-name');
        const currentTotal = parseFloat(e.currentTarget.getAttribute('data-total') || 0);
        const currentDiscount = parseFloat(e.currentTarget.getAttribute('data-discount') || 0);

        activeOrderId = id;

        if (modalOrderInfo) {
          modalOrderInfo.innerHTML = `
            <strong>Order #${id}</strong> &bull; Client: ${custName}<br>
            Current Total: <strong>$${currentTotal.toFixed(2)}</strong> (Current Discount: $${currentDiscount.toFixed(2)})
          `;
        }

        if (modalDiscountInput) {
          modalDiscountInput.value = currentDiscount;
        }

        if (modalOverlay) {
          modalOverlay.classList.add('active');
        }
      });
    });
  }

  // Close modal
  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('active');
    activeOrderId = null;
  }

  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Apply Discount from In-App Modal
  if (modalApplyBtn) {
    modalApplyBtn.addEventListener('click', async () => {
      if (!activeOrderId) return;
      const discountVal = parseFloat(modalDiscountInput.value || 0);

      try {
        const res = await fetch(`/api/orders/${activeOrderId}/discount`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AdminAuth.getToken()}`
          },
          body: JSON.stringify({ discount_amount: discountVal })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message, 'success');
          closeModal();
          fetchOrders();
        } else {
          showToast(data.error || 'Failed to apply discount', 'danger');
        }
      } catch (err) {
        showToast('Error applying manual discount', 'danger');
      }
    });
  }

  if (deliveryStatusFilter) deliveryStatusFilter.addEventListener('change', fetchOrders);
  if (paymentStatusFilter) paymentStatusFilter.addEventListener('change', fetchOrders);
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(fetchOrders, 300);
    });
  }

  fetchOrders();
});
