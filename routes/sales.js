const express = require('express');
const { dbAsync } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/sales/metrics (Protected Admin)
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    // Today's Sales (excluding Cancelled)
    const todayResult = await dbAsync.get(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM Orders
      WHERE status != 'Cancelled' AND date(created_at) = date('now', 'localtime')
    `);

    // Monthly Sales (excluding Cancelled)
    const monthlyResult = await dbAsync.get(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM Orders
      WHERE status != 'Cancelled' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')
    `);

    // Total Revenue (excluding Cancelled)
    const totalRevenueResult = await dbAsync.get(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM Orders
      WHERE status != 'Cancelled'
    `);

    // Total Orders count (excluding Cancelled)
    const totalOrdersResult = await dbAsync.get(`
      SELECT COUNT(*) as count
      FROM Orders
      WHERE status != 'Cancelled'
    `);

    // Total Products Sold (units, excluding Cancelled orders)
    const productsSoldResult = await dbAsync.get(`
      SELECT COALESCE(SUM(oi.quantity), 0) as count
      FROM OrderItems oi
      JOIN Orders o ON oi.order_id = o.id
      WHERE o.status != 'Cancelled'
    `);

    // Low stock product count (quantity <= 3)
    const lowStockResult = await dbAsync.get(`
      SELECT COUNT(*) as count
      FROM Products
      WHERE quantity <= 3
    `);

    const totalRevenue = totalRevenueResult.total;
    const totalOrders = totalOrdersResult.count;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      todaySales: todayResult.total,
      monthlySales: monthlyResult.total,
      totalRevenue: totalRevenue,
      totalOrders: totalOrders,
      productsSold: productsSoldResult.count,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      lowStockCount: lowStockResult.count
    });
  } catch (err) {
    console.error('Error fetching sales metrics:', err);
    res.status(500).json({ error: 'Server error fetching sales metrics.' });
  }
});

// GET /api/sales/reporting (Protected Admin)
router.get('/reporting', authenticateToken, async (req, res) => {
  try {
    // Sales by Date (last 30 days)
    const salesByDate = await dbAsync.all(`
      SELECT date(created_at) as sale_date, COUNT(*) as order_count, SUM(total_amount) as daily_revenue
      FROM Orders
      WHERE status != 'Cancelled' AND created_at >= date('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY sale_date ASC
    `);

    // Sales by Product (top performers)
    const salesByProduct = await dbAsync.all(`
      SELECT p.id, p.name, p.category, p.sku, SUM(oi.quantity) as units_sold, SUM(oi.quantity * oi.unit_price) as total_revenue
      FROM OrderItems oi
      JOIN Orders o ON oi.order_id = o.id
      JOIN Products p ON oi.product_id = p.id
      WHERE o.status != 'Cancelled'
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `);

    // Sales by Category
    const salesByCategory = await dbAsync.all(`
      SELECT p.category, SUM(oi.quantity) as units_sold, SUM(oi.quantity * oi.unit_price) as total_revenue
      FROM OrderItems oi
      JOIN Orders o ON oi.order_id = o.id
      JOIN Products p ON oi.product_id = p.id
      WHERE o.status != 'Cancelled'
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `);

    // Low stock alert items list
    const lowStockProducts = await dbAsync.all(`
      SELECT id, name, sku, category, quantity, price
      FROM Products
      WHERE quantity <= 3
      ORDER BY quantity ASC
    `);

    res.json({
      salesByDate,
      salesByProduct,
      salesByCategory,
      lowStockProducts
    });
  } catch (err) {
    console.error('Error fetching sales reporting:', err);
    res.status(500).json({ error: 'Server error fetching sales report.' });
  }
});

module.exports = router;
