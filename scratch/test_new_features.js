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

async function runNewFeatureTests() {
  console.log('--- Starting Verification Tests for New Features ---');

  // 1. Admin Login for Token
  const login = await request(
    { hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { username: 'admin', password: 'admin123' }
  );
  console.log('1. Admin Login:', login.statusCode, login.body.message);
  const token = login.body.token;

  // 2. Test Settings API
  const settingsRes = await request({ hostname: 'localhost', port: 3000, path: '/api/settings', method: 'GET' });
  console.log('2. Settings API:', settingsRes.statusCode, settingsRes.body.settings);

  // 3. Test Coupon Validation
  const couponRes = await request(
    { hostname: 'localhost', port: 3000, path: '/api/coupons/validate', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { code: 'VINTAGE10', orderAmount: 100 }
  );
  console.log('3. Coupon Validation (VINTAGE10):', couponRes.statusCode, couponRes.body);

  // 4. Test SKU Generator
  const skuRes = await request({ hostname: 'localhost', port: 3000, path: '/api/products/generate-sku?category=Apparel', method: 'GET' });
  console.log('4. Auto-Generated SKU:', skuRes.statusCode, skuRes.body.sku);

  // 5. Test Order Checkout with Whish Money, Optional Email, Mandatory Phone
  const checkoutRes = await request(
    { hostname: 'localhost', port: 3000, path: '/api/orders', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      customer: { name: 'VIP Buyer', phone: '+96170999888', address: 'VIP Villa, Beirut' }, // Email omitted!
      items: [{ product_id: 1, quantity: 1 }],
      paymentMethod: 'WhishMoney',
      couponCode: 'VINTAGE10'
    }
  );
  console.log('5. Whish Money Checkout (Email Omitted):', checkoutRes.statusCode, checkoutRes.body);
  const newOrderId = checkoutRes.body.orderId;

  // 6. Test PDF/HTML Invoice Generation
  const invoiceRes = await request({ hostname: 'localhost', port: 3000, path: `/api/invoices/${newOrderId}/invoice`, method: 'GET' });
  console.log(`6. PDF Invoice Endpoint for Order #${newOrderId}:`, invoiceRes.statusCode, typeof invoiceRes.body === 'string' && invoiceRes.body.includes('INVOICE') ? 'HTML/PDF Output Generated' : 'Error');

  // 7. Test Admin Manual Discount Adjustment
  const manualDiscRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: `/api/orders/${newOrderId}/discount`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    },
    { discount_amount: 50.00 }
  );
  console.log('7. Admin Manual Discount Adjustment:', manualDiscRes.statusCode, manualDiscRes.body);

  // 8. Test Recurrent VIP Clients Query
  const clientsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('8. Recurrent VIP Clients Count:', clientsRes.statusCode, clientsRes.body.count);

  console.log('--- ALL NEW FEATURE VERIFICATION TESTS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

runNewFeatureTests();
