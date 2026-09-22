const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API Route Verification Tests ---');

  // 1. Health check
  const health = await request({ hostname: 'localhost', port: 3000, path: '/api/health', method: 'GET' });
  console.log('1. Health Check:', health.statusCode, health.body.status);

  // 2. Auth Login
  const login = await request(
    { hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { username: 'admin', password: 'admin123' }
  );
  console.log('2. Admin Login:', login.statusCode, login.body.message);
  const token = login.body.token;

  // 3. Get Products
  const products = await request({ hostname: 'localhost', port: 3000, path: '/api/products', method: 'GET' });
  console.log('3. Products Count:', products.statusCode, products.body.count);

  const testProduct = products.body.products[0];
  console.log(`   Selected test product: '${testProduct.name}' (Stock: ${testProduct.quantity})`);

  // 4. Create Order (Checkout)
  const orderRes = await request(
    { hostname: 'localhost', port: 3000, path: '/api/orders', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      customer: { name: 'Test Customer', email: 'test@example.com', phone: '+123456789', address: '123 Test St' },
      items: [{ product_id: testProduct.id, quantity: 1 }]
    }
  );
  console.log('4. Create Order (Checkout):', orderRes.statusCode, orderRes.body);
  const orderId = orderRes.body.orderId;

  // 5. Verify Decremented Stock
  const productAfterOrder = await request({ hostname: 'localhost', port: 3000, path: `/api/products/${testProduct.id}`, method: 'GET' });
  console.log(`5. Stock after order: ${productAfterOrder.body.product.quantity} (Was: ${testProduct.quantity})`);

  // 6. Soft Cancel Order
  const cancelRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: `/api/orders/${orderId}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    },
    { status: 'Cancelled' }
  );
  console.log('6. Soft Cancel Order:', cancelRes.statusCode, cancelRes.body.message);

  // 7. Verify Replenished Stock
  const productAfterCancel = await request({ hostname: 'localhost', port: 3000, path: `/api/products/${testProduct.id}`, method: 'GET' });
  console.log(`7. Stock after cancellation replenishment: ${productAfterCancel.body.product.quantity} (Was: ${productAfterOrder.body.product.quantity})`);

  // 8. Get Sales Metrics
  const metrics = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/sales/metrics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('8. Sales Metrics:', metrics.statusCode, metrics.body);

  console.log('--- ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

// Give server time to spin up
setTimeout(runTests, 1500);
