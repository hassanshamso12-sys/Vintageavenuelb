const express = require('express');
const { db, dbAsync } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/orders (Protected Admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { deliveryStatus, paymentStatus, search } = req.query;
    let sql = `
      SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, c.address as customer_address,
        (SELECT COUNT(*) FROM OrderItems WHERE order_id = o.id) as item_count
      FROM Orders o
      JOIN Customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (deliveryStatus && deliveryStatus !== 'All') {
      sql += ' AND o.delivery_status = ?';
      params.push(deliveryStatus);
    }

    if (paymentStatus && paymentStatus !== 'All') {
      sql += ' AND o.payment_status = ?';
      params.push(paymentStatus);
    }

    if (search) {
      sql += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR o.id LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY o.created_at DESC';
    const orders = await dbAsync.all(sql, params);
    res.json({ orders, count: orders.length });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error fetching orders.' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
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
      return res.status(404).json({ error: 'Order not found.' });
    }

    const items = await dbAsync.all(
      `SELECT oi.*, p.name as product_name, p.sku as product_sku, p.image_url as product_image
       FROM OrderItems oi
       JOIN Products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({ order, items });
  } catch (err) {
    console.error('Error fetching order detail:', err);
    res.status(500).json({ error: 'Server error fetching order.' });
  }
});

// POST /api/orders (Checkout)
router.post('/', async (req, res) => {
  const { customer, items, paymentMethod, couponCode } = req.body;

  if (!customer || !customer.name || !customer.phone) {
    return res.status(400).json({ error: 'Customer name and phone number are obligatory.' });
  }

  const phoneTrimmed = customer.phone.trim();
  if (phoneTrimmed.length < 5) {
    return res.status(400).json({ error: 'Please enter a valid phone number.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items array cannot be empty.' });
  }

  const validPaymentMethod = paymentMethod === 'WhishMoney' ? 'WhishMoney' : 'COD';
  const customerEmail = customer.email ? customer.email.trim() : '';

  db.serialize(async () => {
    try {
      await dbAsync.exec('BEGIN TRANSACTION');

      // 1. Stock check & pricing
      const verifiedItems = [];
      let subtotal = 0;

      for (const item of items) {
        if (!item.product_id || !item.quantity || item.quantity <= 0) {
          await dbAsync.exec('ROLLBACK');
          return res.status(400).json({ error: 'Each item must have a valid product_id and positive quantity.' });
        }

        const product = await dbAsync.get('SELECT * FROM Products WHERE id = ?', [item.product_id]);
        if (!product) {
          await dbAsync.exec('ROLLBACK');
          return res.status(400).json({ error: `Product with ID ${item.product_id} was not found.` });
        }

        if (product.quantity < item.quantity) {
          await dbAsync.exec('ROLLBACK');
          return res.status(400).json({
            error: `Insufficient stock for '${product.name}'. Requested: ${item.quantity}, Available: ${product.quantity}.`
          });
        }

        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;

        verifiedItems.push({
          product_id: product.id,
          quantity: item.quantity,
          unit_price: product.price
        });
      }

      // 2. Validate Coupon Code if provided
      let discountAmount = 0;
      let appliedCouponCode = null;
      if (couponCode) {
        const coupon = await dbAsync.get('SELECT * FROM Coupons WHERE UPPER(code) = UPPER(?) AND active = 1', [couponCode.trim()]);
        if (coupon && (!coupon.min_order_amount || subtotal >= coupon.min_order_amount)) {
          appliedCouponCode = coupon.code;
          if (coupon.discount_type === 'percentage') {
            discountAmount = (subtotal * coupon.discount_value) / 100;
          } else if (coupon.discount_type === 'fixed') {
            discountAmount = Math.min(coupon.discount_value, subtotal);
          }
        }
      }

      const totalAmount = Math.max(0, subtotal - discountAmount);

      // 3. Find or Create Customer by Phone Number
      let customerId;
      const existingCust = await dbAsync.get('SELECT id FROM Customers WHERE phone = ?', [phoneTrimmed]);
      if (existingCust) {
        customerId = existingCust.id;
        await dbAsync.run(
          `UPDATE Customers SET name = ?, email = ?, address = COALESCE(?, address) WHERE id = ?`,
          [customer.name.trim(), customerEmail, customer.address ? customer.address.trim() : null, customerId]
        );
      } else {
        const newCustRes = await dbAsync.run(
          `INSERT INTO Customers (name, email, phone, address) VALUES (?, ?, ?, ?)`,
          [customer.name.trim(), customerEmail, phoneTrimmed, customer.address ? customer.address.trim() : '']
        );
        customerId = newCustRes.lastID;
      }

      // 4. Create Order with Dual Statuses
      const orderRes = await dbAsync.run(
        `INSERT INTO Orders (customer_id, total_amount, discount_amount, coupon_code, status, delivery_status, payment_status, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [customerId, totalAmount, discountAmount, appliedCouponCode, 'Pending', 'Pending', 'Unpaid', validPaymentMethod]
      );
      const newOrderId = orderRes.lastID;

      // 5. Create OrderItems & Decrement Stock
      for (const item of verifiedItems) {
        await dbAsync.run(
          `INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
          [newOrderId, item.product_id, item.quantity, item.unit_price]
        );

        await dbAsync.run(
          `UPDATE Products SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }

      await dbAsync.exec('COMMIT');

      res.status(201).json({
        message: 'Order created successfully',
        orderId: newOrderId,
        totalAmount: totalAmount,
        discountAmount: discountAmount
      });
    } catch (err) {
      await dbAsync.exec('ROLLBACK');
      console.error('Checkout error:', err);
      res.status(500).json({ error: 'Server error creating order.' });
    }
  });
});

// PATCH /api/orders/:id/statuses (Protected Admin) - Update Delivery & Payment statuses independently
router.patch('/:id/statuses', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const { delivery_status, payment_status } = req.body;

  try {
    const order = await dbAsync.get('SELECT * FROM Orders WHERE id = ?', [orderId]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const prevDelivery = order.delivery_status;
    const newDelivery = delivery_status || prevDelivery;
    const newPayment = payment_status || order.payment_status;

    // Handle soft cancellation restocking logic
    if (newDelivery === 'Cancelled' && prevDelivery !== 'Cancelled') {
      const items = await dbAsync.all('SELECT product_id, quantity FROM OrderItems WHERE order_id = ?', [orderId]);
      for (const item of items) {
        await dbAsync.run('UPDATE Products SET quantity = quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    } else if (prevDelivery === 'Cancelled' && newDelivery !== 'Cancelled') {
      const items = await dbAsync.all('SELECT product_id, quantity FROM OrderItems WHERE order_id = ?', [orderId]);
      for (const item of items) {
        await dbAsync.run('UPDATE Products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    await dbAsync.run(
      'UPDATE Orders SET delivery_status = ?, payment_status = ?, status = ? WHERE id = ?',
      [newDelivery, newPayment, newDelivery, orderId]
    );

    const updatedOrder = await dbAsync.get('SELECT * FROM Orders WHERE id = ?', [orderId]);
    res.json({ message: 'Statuses updated successfully', order: updatedOrder });
  } catch (err) {
    console.error('Error updating statuses:', err);
    res.status(500).json({ error: 'Server error updating statuses.' });
  }
});

// PATCH /api/orders/:id/discount (Protected Admin) - Apply manual discount to received order
router.patch('/:id/discount', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const { discount_amount } = req.body;

  if (discount_amount === undefined || isNaN(parseFloat(discount_amount))) {
    return res.status(400).json({ error: 'Valid discount_amount is required.' });
  }

  try {
    const order = await dbAsync.get('SELECT * FROM Orders WHERE id = ?', [orderId]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const items = await dbAsync.all('SELECT quantity, unit_price FROM OrderItems WHERE order_id = ?', [orderId]);
    const originalSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const newDiscount = Math.min(originalSubtotal, Math.max(0, parseFloat(discount_amount)));
    const newTotal = Math.max(0, originalSubtotal - newDiscount);

    await dbAsync.run(
      'UPDATE Orders SET discount_amount = ?, total_amount = ? WHERE id = ?',
      [newDiscount, newTotal, orderId]
    );

    res.json({
      message: `Applied $${newDiscount.toFixed(2)} discount to Order #${orderId}`,
      newTotalAmount: newTotal
    });
  } catch (err) {
    console.error('Error applying manual discount:', err);
    res.status(500).json({ error: 'Server error applying discount.' });
  }
});

module.exports = router;
