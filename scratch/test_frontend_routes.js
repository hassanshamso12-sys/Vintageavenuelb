const http = require('http');

const routes = [
  '/',
  '/index.html',
  '/products.html',
  '/product.html?id=1',
  '/checkout.html',
  '/about.html',
  '/contact.html',
  '/admin/login.html',
  '/admin/dashboard.html',
  '/admin/products.html',
  '/admin/orders.html',
  '/admin/sales.html',
  '/css/style.css',
  '/js/cart.js',
  '/js/products.js',
  '/js/admin.js',
  '/api/health',
  '/api/products',
  '/api/products/1'
];

function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      resolve({ path, statusCode: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', (err) => resolve({ path, error: err.message }));
  });
}

async function run() {
  console.log('--- Testing All Vintage Avenue Frontend & API Routes ---');
  for (const route of routes) {
    const result = await checkRoute(route);
    if (result.statusCode === 200) {
      console.log(`✓ ${result.path.padEnd(25)} -> Status 200 OK (${result.contentType})`);
    } else {
      console.error(`✗ ${result.path.padEnd(25)} -> Status ${result.statusCode || result.error}`);
    }
  }
  console.log('--- Route Verification Completed ---');
  process.exit(0);
}

run();
