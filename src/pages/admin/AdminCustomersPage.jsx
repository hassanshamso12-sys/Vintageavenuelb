import React from 'react';

const DEFAULT_CUSTOMERS = [
  { id: 1, name: "Hassan Shamso", email: "hassan@vintageavenue.com", phone: "+961 70 123 456", total_orders: 5, total_spent: 4250.00, vip_level: "Diamond VIP" },
  { id: 2, name: "Karim Al-Hassan", email: "karim@example.com", phone: "+961 03 987 654", total_orders: 3, total_spent: 1850.00, vip_level: "Gold VIP" },
  { id: 3, name: "Nour El-Din", email: "nour@example.com", phone: "+961 71 456 789", total_orders: 2, total_spent: 1200.00, vip_level: "VIP Member" }
];

export const AdminCustomersPage = () => {
  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)' }}>
            Recurrent VIP Collector Directory
          </h1>
          <p className="section-subtitle" style={{ color: 'var(--color-text-secondary)' }}>
            Client portfolio, order frequency, total spent metrics, and VIP tier statuses
          </p>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Contact Email</th>
              <th>Phone</th>
              <th>Total Orders</th>
              <th>Lifetime Spend ($)</th>
              <th>VIP Tier</th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_CUSTOMERS.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.total_orders} orders</td>
                <td style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                  ${c.total_spent.toFixed(2)}
                </td>
                <td>
                  <span style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--color-gold)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {c.vip_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
