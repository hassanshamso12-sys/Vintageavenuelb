const express = require('express');
const { dbAsync } = require('../database/db');

const router = express.Router();

// GET /api/orders/:id/invoice
router.get('/:id/invoice', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await dbAsync.get(
      `SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, c.address as customer_address
       FROM Orders o
       JOIN Customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (!order) {
      return res.status(404).send('Order not found');
    }

    const items = await dbAsync.all(
      `SELECT oi.*, p.name as product_name, p.sku as product_sku
       FROM OrderItems oi
       JOIN Products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const invoiceHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${order.id} - Vintage Avenue</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; margin: 0; padding: 40px; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 20px; }
          .brand { font-size: 24px; font-weight: bold; color: #0b0c10; letter-spacing: 1px; }
          .brand span { color: #d4af37; }
          .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th { background: #f8f9fa; border-bottom: 2px solid #ddd; text-align: left; padding: 12px; }
          .table td { padding: 12px; border-bottom: 1px solid #eee; }
          .total-row { font-size: 16px; font-weight: bold; text-align: right; }
          .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; display: inline-block; }
          .badge-paid { background: #e6f4ea; color: #137333; }
          .badge-unpaid { background: #fce8e6; color: #c5221f; }
          .print-btn { background: #d4af37; color: #000; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; border-radius: 4px; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div style="text-align: right; margin-bottom: 10px;">
            <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
          </div>
          <div class="header">
            <div class="brand">VINTAGE <span>AVENUE</span></div>
            <div>
              <h2 style="margin: 0; color: #d4af37;">INVOICE / PACKING LIST</h2>
              <div style="font-size: 14px; color: #666;">Invoice #${order.id}</div>
              <div style="font-size: 12px; color: #888;">Date: ${new Date(order.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="details">
            <div>
              <strong>Billed / Shipped To:</strong><br>
              ${order.customer_name}<br>
              Phone: ${order.customer_phone}<br>
              ${order.customer_email ? `Email: ${order.customer_email}<br>` : ''}
              ${order.customer_address ? `Address: ${order.customer_address}` : ''}
            </div>
            <div style="text-align: right;">
              <strong>Order Details:</strong><br>
              Payment Method: ${order.payment_method}<br>
              Payment Status: <span class="badge ${order.payment_status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${order.payment_status}</span><br>
              Delivery Status: ${order.delivery_status}
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td><code>${item.product_sku}</code></td>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unit_price.toFixed(2)}</td>
                  <td style="text-align: right;">$${(item.quantity * item.unit_price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-row">
            ${order.discount_amount > 0 ? `<div>Discount Applied: -$${order.discount_amount.toFixed(2)}</div>` : ''}
            <div style="font-size: 20px; color: #0b0c10; margin-top: 6px;">Total Amount: $${order.total_amount.toFixed(2)}</div>
          </div>

          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #888; font-size: 12px;">
            Thank you for shopping at Vintage Avenue. Authentic heritage guaranteed.
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHtml);
  } catch (err) {
    console.error('Error generating invoice:', err);
    res.status(500).send('Error generating invoice HTML/PDF.');
  }
});

module.exports = router;
