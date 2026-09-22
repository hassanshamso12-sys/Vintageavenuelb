/**
 * Vintage Avenue - Printable PDF Invoice Generator
 * Opens a print-formatted window styled with Vintage Avenue luxury branding
 * allowing instant PDF saving or printing.
 */

export const generateInvoicePDF = (order, settings = {}) => {
  const brandName = settings.brand_name || 'VINTAGE AVENUE';
  const logoUrl = settings.site_logo_url || '';
  const announcement = settings.announcement_text || '';

  const orderDate = order.order_date
    ? new Date(order.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('en-US');

  const items = order.items && Array.isArray(order.items) ? order.items : [];

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${order.id} | ${brandName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #111827;
          background: #ffffff;
          padding: 40px;
          line-height: 1.6;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 24px;
          border-bottom: 2px solid #d4af37;
          margin-bottom: 32px;
        }

        .brand-title {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          font-weight: 800;
          color: #d4af37;
          letter-spacing: 2px;
        }

        .brand-logo-img {
          max-height: 50px;
          margin-bottom: 8px;
        }

        .invoice-badge {
          font-family: 'Cinzel', serif;
          font-size: 1.5rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #111827;
          text-align: right;
        }

        .invoice-meta {
          font-size: 0.85rem;
          color: #6b7280;
          text-align: right;
          margin-top: 4px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 36px;
        }

        .details-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 20px;
          border-radius: 8px;
        }

        .box-title {
          font-family: 'Cinzel', serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 6px;
        }

        .info-row {
          font-size: 0.9rem;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
        }

        .info-label { color: #6b7280; }
        .info-value { font-weight: 600; color: #111827; }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }

        .items-table th {
          font-family: 'Cinzel', serif;
          background: #111827;
          color: #ffffff;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 1px;
          padding: 12px 16px;
          text-align: left;
        }

        .items-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.9rem;
        }

        .items-table tr:nth-child(even) {
          background: #f9fafb;
        }

        .totals-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }

        .totals-table {
          width: 320px;
          border-collapse: collapse;
        }

        .totals-table td {
          padding: 8px 12px;
          font-size: 0.95rem;
        }

        .grand-total-row {
          font-family: 'Cinzel', serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: #d4af37;
          border-top: 2px solid #d4af37;
        }

        .invoice-footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 24px;
          text-align: center;
          font-size: 0.85rem;
          color: #6b7280;
        }

        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div className="no-print" style="text-align: right; margin-bottom: 20px;">
        <button onclick="window.print()" style="background: #d4af37; color: #000; border: none; padding: 10px 20px; font-weight: 700; cursor: pointer; border-radius: 6px;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div class="invoice-header">
        <div>
          ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" class="brand-logo-img" />` : ''}
          <div class="brand-title">${brandName}</div>
          <div style="font-size: 0.8rem; color: #6b7280;">Authenticated Vintage & Luxury Retail</div>
        </div>
        <div>
          <div class="invoice-badge">INVOICE</div>
          <div class="invoice-meta">Order ID: <strong>${order.id}</strong></div>
          <div class="invoice-meta">Date: ${orderDate}</div>
        </div>
      </div>

      <div class="details-grid">
        <div class="details-box">
          <div class="box-title">Client Information</div>
          <div class="info-row"><span class="info-label">Name:</span> <span class="info-value">${order.customer_name || 'Valued Client'}</span></div>
          <div class="info-row"><span class="info-label">Phone:</span> <span class="info-value">${order.customer_phone || 'N/A'}</span></div>
          <div class="info-row"><span class="info-label">Email:</span> <span class="info-value">${order.customer_email || 'N/A'}</span></div>
          <div class="info-row"><span class="info-label">Address:</span> <span class="info-value">${order.delivery_address || 'N/A'}</span></div>
        </div>

        <div class="details-box">
          <div class="box-title">Order & Dispatch Status</div>
          <div class="info-row"><span class="info-label">Payment Method:</span> <span class="info-value">${order.payment_method || 'Cash on Delivery'}</span></div>
          <div class="info-row"><span class="info-label">Payment Status:</span> <span class="info-value">${order.status || 'Pending'}</span></div>
          <div class="info-row"><span class="info-label">Tracking / Delivery:</span> <span class="info-value">${order.tracking_status || order.delivery_status || 'Processing'}</span></div>
          <div class="info-row"><span class="info-label">Delivery Service:</span> <span class="info-value">${order.delivery_method || 'Standard Courier'}</span></div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item Artifact</th>
            <th>Category</th>
            <th>Price</th>
            <th>Qty</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.length === 0 ? `
            <tr>
              <td colspan="5" style="text-align: center; color: #6b7280;">Item list unavailable</td>
            </tr>
          ` : items.map(item => `
            <tr>
              <td>
                <strong>${item.name}</strong>
                ${item.sku ? `<div style="font-size: 0.75rem; color: #6b7280;">SKU: ${item.sku}</div>` : ''}
              </td>
              <td>${item.category || 'Vault Item'}</td>
              <td>$${Number(item.price).toFixed(2)}</td>
              <td>${item.quantity}</td>
              <td style="text-align: right; font-weight: 600;">$${(Number(item.price) * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-container">
        <table class="totals-table">
          <tr>
            <td style="color: #6b7280;">Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">$${Number(order.subtotal || order.total_amount).toFixed(2)}</td>
          </tr>
          ${order.discount && order.discount > 0 ? `
            <tr>
              <td style="color: #10b981;">Discount (${order.coupon_code || 'Promo'}):</td>
              <td style="text-align: right; color: #10b981; font-weight: 600;">-$${Number(order.discount).toFixed(2)}</td>
            </tr>
          ` : ''}
          ${order.delivery_fee !== undefined ? `
            <tr>
              <td style="color: #6b7280;">Delivery Fee (${order.delivery_method || 'Standard'}):</td>
              <td style="text-align: right; font-weight: 600;">$${Number(order.delivery_fee).toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr class="grand-total-row">
            <td>Grand Total:</td>
            <td style="text-align: right;">$${Number(order.total_amount).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div class="invoice-footer">
        <p>Thank you for choosing <strong>${brandName}</strong>.</p>
        <p style="margin-top: 4px;">For concierge assistance or inquiries, please contact our VIP client team.</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (printWindow) {
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();
  }
};
