import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ToastContainer';
import { useSettings } from '../../context/SettingsContext';
import { generateInvoicePDF } from '../../utils/generateInvoicePDF';

const DEFAULT_ORDERS = [
  { id: 'ORD-982104', customer_name: 'Hassan Shamso', customer_phone: '+961 70 123 456', customer_email: 'hassan@example.com', total_amount: 1850.00, status: 'Completed', tracking_status: 'Delivered', payment_method: 'Whish Money Transfer', order_date: '2026-09-22T14:30:00Z', delivery_method: 'Express Vault Concierge', delivery_fee: 25.00 },
  { id: 'ORD-451209', customer_name: 'Karim Al-Hassan', customer_phone: '+961 03 987 654', customer_email: 'N/A', total_amount: 250.00, status: 'Processing', tracking_status: 'Dispatched / In Transit', payment_method: 'Cash on Delivery', order_date: '2026-09-22T11:15:00Z', delivery_method: 'Standard Courier', delivery_fee: 10.00 },
  { id: 'ORD-110293', customer_name: 'Nour El-Din', customer_phone: '+961 71 456 789', customer_email: 'nour@example.com', total_amount: 1200.00, status: 'Pending', tracking_status: 'Processing', payment_method: 'Whish Money Transfer', order_date: '2026-09-21T18:45:00Z', delivery_method: 'Standard Courier', delivery_fee: 0.00 }
];

export const AdminOrdersPage = () => {
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data && data.orders && data.orders.length > 0) {
          setOrders(data.orders);
          return;
        }
      }
    } catch (e) {}

    const saved = localStorage.getItem('va_orders');
    setOrders(saved ? JSON.parse(saved) : DEFAULT_ORDERS);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem('va_orders', JSON.stringify(updated));

    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});

    showToast(`Order ${orderId} payment status updated to '${newStatus}'!`, 'success');
  };

  const handleTrackingChange = (orderId, newTrackingStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, tracking_status: newTrackingStatus } : o);
    setOrders(updated);
    localStorage.setItem('va_orders', JSON.stringify(updated));

    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracking_status: newTrackingStatus })
    }).catch(() => {});

    showToast(`Order ${orderId} delivery tracking status updated to '${newTrackingStatus}'!`, 'success');
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)' }}>
            Order Management & Delivery Tracking
          </h1>
          <p className="section-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
            Track client orders, payment verification, fulfillment status, and generate official PDF invoices
          </p>
        </div>
      </div>

      <div className="data-table-container" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Client Details</th>
              <th>Total Amount ($)</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Delivery Tracking Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                  No orders recorded yet.
                </td>
              </tr>
            ) : (
              orders.map(o => (
                <tr key={o.id}>
                  <td><code>{o.id}</code></td>
                  <td>
                    <strong>{o.customer_name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      📞 {o.customer_phone || 'N/A'} {o.customer_email && o.customer_email !== 'N/A' ? `• ✉️ ${o.customer_email}` : ''}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                    ${Number(o.total_amount).toFixed(2)}
                  </td>
                  <td>
                    <span>{o.payment_method || 'Cash on Delivery'}</span>
                    {o.delivery_method && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        📦 {o.delivery_method}
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '6px 10px', fontSize: '0.82rem', width: '130px', fontWeight: 600 }}
                      value={o.status || 'Pending'}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.82rem',
                        width: '180px',
                        fontWeight: 600,
                        borderColor: o.tracking_status === 'Delivered' ? '#10b981' : (o.tracking_status === 'Returned' ? '#ef4444' : 'var(--border-color)')
                      }}
                      value={o.tracking_status || 'Processing'}
                      onChange={e => handleTrackingChange(o.id, e.target.value)}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Dispatched / In Transit">Dispatched / In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Returned">Returned</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => generateInvoicePDF(o, settings)}
                      className="btn btn-outline btn-sm"
                      title="Download PDF Invoice"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i> Invoice PDF
                    </button>
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
