const express = require('express');
const { dbAsync } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/customers (Protected Admin) - List customers with recurrent client tracking
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, recurrentOnly } = req.query;
    let sql = `
      SELECT c.*,
        COUNT(o.id) as order_count,
        COALESCE(SUM(CASE WHEN o.delivery_status != 'Cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM Customers c
      LEFT JOIN Orders o ON c.id = o.customer_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' GROUP BY c.id';

    if (recurrentOnly === 'true') {
      sql += ' HAVING order_count > 1';
    }

    sql += ' ORDER BY total_spent DESC, c.created_at DESC';
    const customers = await dbAsync.all(sql, params);

    const mapped = customers.map(c => ({
      ...c,
      is_recurrent: c.order_count > 1
    }));

    res.json({ customers: mapped, count: mapped.length });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Server error fetching customers.' });
  }
});

// GET /api/customers/:id (Protected Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await dbAsync.get('SELECT * FROM Customers WHERE id = ?', [req.params.id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const orders = await dbAsync.all('SELECT * FROM Orders WHERE customer_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json({ customer, orders });
  } catch (err) {
    console.error('Error fetching customer detail:', err);
    res.status(500).json({ error: 'Server error fetching customer.' });
  }
});

module.exports = router;
