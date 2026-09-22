const express = require('express');
const { dbAsync } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/coupons/validate (Public for checkout/cart)
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required.' });
    }

    const coupon = await dbAsync.get('SELECT * FROM Coupons WHERE UPPER(code) = UPPER(?) AND active = 1', [code.trim()]);
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon code.' });
    }

    const amount = parseFloat(orderAmount || 0);
    if (coupon.min_order_amount && amount < coupon.min_order_amount) {
      return res.status(400).json({
        error: `Minimum order amount for code '${coupon.code}' is $${coupon.min_order_amount.toFixed(2)}.`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (amount * coupon.discount_value) / 100;
    } else if (coupon.discount_type === 'fixed') {
      discount = Math.min(coupon.discount_value, amount);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      calculatedDiscount: parseFloat(discount.toFixed(2))
    });
  } catch (err) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ error: 'Server error validating coupon.' });
  }
});

// GET /api/coupons (Protected Admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const coupons = await dbAsync.all('SELECT * FROM Coupons ORDER BY created_at DESC');
    res.json({ coupons });
  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ error: 'Server error fetching coupons.' });
  }
});

// POST /api/coupons (Protected Admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount } = req.body;

    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ error: 'Code, discount_type, and discount_value are required.' });
    }

    const uppercaseCode = code.trim().toUpperCase();
    const existing = await dbAsync.get('SELECT id FROM Coupons WHERE code = ?', [uppercaseCode]);
    if (existing) {
      return res.status(400).json({ error: `Coupon code '${uppercaseCode}' already exists.` });
    }

    await dbAsync.run(
      'INSERT INTO Coupons (code, discount_type, discount_value, min_order_amount, active) VALUES (?, ?, ?, ?, 1)',
      [uppercaseCode, discount_type, parseFloat(discount_value), parseFloat(min_order_amount || 0)]
    );

    res.status(201).json({ message: 'Coupon created successfully.' });
  } catch (err) {
    console.error('Error creating coupon:', err);
    res.status(500).json({ error: 'Server error creating coupon.' });
  }
});

// DELETE /api/coupons/:id (Protected Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await dbAsync.run('DELETE FROM Coupons WHERE id = ?', [req.params.id]);
    res.json({ message: 'Coupon deleted successfully.' });
  } catch (err) {
    console.error('Error deleting coupon:', err);
    res.status(500).json({ error: 'Server error deleting coupon.' });
  }
});

module.exports = router;
