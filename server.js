const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database/init');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const salesRoutes = require('./routes/sales');
const uploadRoutes = require('./routes/upload');
const couponRoutes = require('./routes/coupons');
const settingRoutes = require('./routes/settings');
const invoiceRoutes = require('./routes/invoices');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/categories', categoryRoutes);

// Health check / API status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Vintage Avenue API',
    timestamp: new Date().toISOString()
  });
});

// Fallback for HTML routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize Database & Start Express Server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Vintage Avenue Server running on http://localhost:${PORT}`);
      console.log(` Static Files served from: ${path.join(__dirname, 'public')}`);
      console.log(` REST API Base URL: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to database initialization failure:', err);
    process.exit(1);
  });
