import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ToastContainer';

const DEFAULT_ORDERS = [
  { id: 'ORD-982104', customer_name: 'Hassan Shamso', customer_phone: '+961 70 123 456', total_amount: 1850.00, status: 'Completed', payment_method: 'Whish Money', order_date: '2026-09-22T14:30:00Z' },
  { id: 'ORD-451209', customer_name: 'Karim Al-Hassan', customer_phone: '+961 03 987 654', total_amount: 250.00, status: 'Processing', payment_method: 'Cash on Delivery', order_date: '2026-09-22T11:15:00Z' },
  { id: 'ORD-110293', customer_name: 'Nour El-Din', customer_phone: '+961 71 456 789', total_amount: 1200.00, status: 'Pending', payment_method: 'Whish Money', order_date: '2026-09-21T18:45:00Z' }
];

export const AdminOrdersPage = () => {
  const { showToast } = useToast();
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

    showToast(`Order ${orderId} updated to ${newStatus}!`, 'success');
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)' }}>
            Order Management & Fulfillments
          </h1>
          <p className="section-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
            Track client orders, payment verification, and dispatch delivery status
          </p>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Client Name</th>
              <th>Phone Number</th>
              <th>Total Amount ($)</th>
              <th>Payment Method</th>
              <th>Status</th>
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
                  <td><strong>{o.customer_name}</strong></td>
                  <td>{o.customer_phone || 'N/A'}</td>
                  <td style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                    ${Number(o.total_amount).toFixed(2)}
                  </td>
                  <td>{o.payment_method || 'COD'}</td>
                  <td>
                    <span className={`badge-status ${o.status}`}>{o.status}</span>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      value={o.status}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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
