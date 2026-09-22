const { dbAsync } = require('./db');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  console.log('Initializing Vintage Avenue database schema and migrations...');

  await dbAsync.exec('PRAGMA foreign_keys = ON;');

  // Core Tables DDL
  await dbAsync.exec(`
    CREATE TABLE IF NOT EXISTS Admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      subcategory TEXT,
      price REAL NOT NULL CHECK(price >= 0),
      cost_price REAL DEFAULT 0.00 CHECK(cost_price >= 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
      sku TEXT UNIQUE NOT NULL,
      era TEXT,
      condition TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT UNIQUE NOT NULL,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      total_amount REAL NOT NULL CHECK(total_amount >= 0),
      discount_amount REAL DEFAULT 0.00 CHECK(discount_amount >= 0),
      coupon_code TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      delivery_status TEXT NOT NULL DEFAULT 'Pending' CHECK(delivery_status IN ('Pending', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled')),
      payment_status TEXT NOT NULL DEFAULT 'Unpaid' CHECK(payment_status IN ('Unpaid', 'Paid', 'Refunded')),
      payment_method TEXT NOT NULL DEFAULT 'COD' CHECK(payment_method IN ('COD', 'WhishMoney')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS OrderItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      unit_price REAL NOT NULL CHECK(unit_price >= 0),
      FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS Coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
      discount_value REAL NOT NULL CHECK(discount_value > 0),
      min_order_amount REAL DEFAULT 0.00 CHECK(min_order_amount >= 0),
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Run schema migrations for existing tables if columns are missing
  try {
    const productCols = await dbAsync.all("PRAGMA table_info(Products)");
    if (!productCols.some(c => c.name === 'cost_price')) {
      await dbAsync.exec("ALTER TABLE Products ADD COLUMN cost_price REAL DEFAULT 0.00;");
    }
    if (!productCols.some(c => c.name === 'subcategory')) {
      await dbAsync.exec("ALTER TABLE Products ADD COLUMN subcategory TEXT;");
    }

    const orderCols = await dbAsync.all("PRAGMA table_info(Orders)");
    if (!orderCols.some(c => c.name === 'delivery_status')) {
      await dbAsync.exec("ALTER TABLE Orders ADD COLUMN delivery_status TEXT NOT NULL DEFAULT 'Pending';");
    }
    if (!orderCols.some(c => c.name === 'payment_status')) {
      await dbAsync.exec("ALTER TABLE Orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'Unpaid';");
    }
    if (!orderCols.some(c => c.name === 'payment_method')) {
      await dbAsync.exec("ALTER TABLE Orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'COD';");
    }
    if (!orderCols.some(c => c.name === 'discount_amount')) {
      await dbAsync.exec("ALTER TABLE Orders ADD COLUMN discount_amount REAL DEFAULT 0.00;");
    }
    if (!orderCols.some(c => c.name === 'coupon_code')) {
      await dbAsync.exec("ALTER TABLE Orders ADD COLUMN coupon_code TEXT;");
    }
  } catch (err) {
    console.log('Migration check info:', err.message);
  }

  // Create Indices
  await dbAsync.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_category ON Products(category);
    CREATE INDEX IF NOT EXISTS idx_products_subcategory ON Products(subcategory);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON Orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON Orders(delivery_status);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON Orders(payment_status);
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON Customers(phone);
    CREATE INDEX IF NOT EXISTS idx_subcategories_category ON Subcategories(category_id);
  `);

  // Seed / Update Admin user
  const adminEmail = 'lubnaarmawed@gmail.com';
  const adminPassHash = bcrypt.hashSync('Tamara2000$', 10);

  const existingAdmin = await dbAsync.get('SELECT * FROM Admins WHERE email = ? OR username = ?', [adminEmail, 'admin']);
  if (!existingAdmin) {
    await dbAsync.run(
      'INSERT INTO Admins (username, password_hash, email) VALUES (?, ?, ?)',
      [adminEmail, adminPassHash, adminEmail]
    );
  } else {
    await dbAsync.run(
      'UPDATE Admins SET username = ?, email = ?, password_hash = ? WHERE id = ?',
      [adminEmail, adminEmail, adminPassHash, existingAdmin.id]
    );
  }
  console.log('Admin user credentials updated: lubnaarmawed@gmail.com');

  // Seed Categories & Subcategories if empty
  const catCount = await dbAsync.get('SELECT COUNT(*) as count FROM Categories');
  if (catCount.count === 0) {
    const seedCategories = [
      {
        name: 'Apparel',
        slug: 'apparel',
        subcategories: ['Jackets & Coats', 'Denim & Jeans', 'Dresses & Gowns', 'Knitwear & Sweaters']
      },
      {
        name: 'Timepieces',
        slug: 'timepieces',
        subcategories: ['Chronographs', 'Automatic Watches', 'Pocket Watches', 'Dress Watches']
      },
      {
        name: 'Jewelry',
        slug: 'jewelry',
        subcategories: ['Necklaces & Pendants', 'Rings & Bands', 'Earrings', 'Bracelets & Cuffs']
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        subcategories: ['Scarves & Ties', 'Leather Goods', 'Eyewear', 'Hats & Gloves']
      },
      {
        name: 'Collectibles',
        slug: 'collectibles',
        subcategories: ['Clocks & Instruments', 'Vinyl & Audio', 'Art & Objects', 'Barware & Smoking']
      }
    ];

    for (const cat of seedCategories) {
      const res = await dbAsync.run(
        'INSERT INTO Categories (name, slug) VALUES (?, ?)',
        [cat.name, cat.slug]
      );
      const catId = res.lastID;

      for (const subName of cat.subcategories) {
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await dbAsync.run(
          'INSERT INTO Subcategories (category_id, name, slug) VALUES (?, ?, ?)',
          [catId, subName, subSlug]
        );
      }
    }
    console.log('Seeded default Categories and Subcategories tree.');
  }

  // Seed default Coupons if empty
  const couponCount = await dbAsync.get('SELECT COUNT(*) as count FROM Coupons');
  if (couponCount.count === 0) {
    await dbAsync.run(
      'INSERT INTO Coupons (code, discount_type, discount_value, min_order_amount, active) VALUES (?, ?, ?, ?, ?)',
      ['VINTAGE10', 'percentage', 10, 50, 1]
    );
    await dbAsync.run(
      'INSERT INTO Coupons (code, discount_type, discount_value, min_order_amount, active) VALUES (?, ?, ?, ?, ?)',
      ['LUXURY25', 'fixed', 25, 100, 1]
    );
    console.log('Seeded sample coupons (VINTAGE10, LUXURY25).');
  }

  // Seed default Settings if empty
  const settingsCount = await dbAsync.get('SELECT COUNT(*) as count FROM Settings');
  if (settingsCount.count === 0) {
    const defaultSettings = [
      { key: 'brand_name', value: 'VINTAGE AVENUE' },
      { key: 'logo_icon', value: 'fa-gem' },
      { key: 'theme_palette', value: 'gold' },
      { key: 'whish_barcode_url', value: '' }
    ];
    for (const s of defaultSettings) {
      await dbAsync.run('INSERT OR REPLACE INTO Settings (key, value) VALUES (?, ?)', [s.key, s.value]);
    }
    console.log('Seeded default visual identity settings.');
  }

  // Seed sample Products if empty
  const productCount = await dbAsync.get('SELECT COUNT(*) as count FROM Products');
  if (productCount.count === 0) {
    const sampleProducts = [
      {
        name: '1970s Distressed Biker Leather Jacket',
        description: 'Authentic 1970s vintage dark brown leather jacket with brass zippers and silk lining.',
        category: 'Apparel',
        subcategory: 'Jackets & Coats',
        price: 349.99,
        cost_price: 180.00,
        quantity: 3,
        sku: 'VA-APP-1970-001',
        era: '1970s',
        condition: 'Mint Vintage',
        image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'Victorian 18K Gold Pearl Necklace',
        description: 'Exquisite late 19th-century Victorian hand-strung freshwater pearl necklace with 18K gold clasp.',
        category: 'Jewelry',
        subcategory: 'Necklaces & Pendants',
        price: 890.00,
        cost_price: 450.00,
        quantity: 1,
        sku: 'VA-JWL-VIC-002',
        era: 'Victorian',
        condition: 'Restored Excellent',
        image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: '1960s Mid-Century Brass Chrono Table Clock',
        description: 'Rare Swiss-movement mid-century brass desktop clock with sunburst motif.',
        category: 'Collectibles',
        subcategory: 'Clocks & Instruments',
        price: 275.50,
        cost_price: 110.00,
        quantity: 4,
        sku: 'VA-COL-1960-003',
        era: '1960s',
        condition: 'Original Working Condition',
        image_url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: '1980s Automatic Heritage Chronograph Watch',
        description: 'Collector vintage automatic stainless steel chronograph watch with genuine leather strap.',
        category: 'Timepieces',
        subcategory: 'Chronographs',
        price: 1250.00,
        cost_price: 680.00,
        quantity: 2,
        sku: 'VA-TMP-1980-004',
        era: '1980s',
        condition: 'Serviced Pristine',
        image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'Vintage Silk Paisley Pocket Square & Scarf',
        description: 'Italian 100% pure Mulberry silk scarf with intricate hand-rolled edges.',
        category: 'Accessories',
        subcategory: 'Scarves & Ties',
        price: 115.00,
        cost_price: 40.00,
        quantity: 8,
        sku: 'VA-ACC-1990-005',
        era: '1990s',
        condition: 'Unused Vintage NOS',
        image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80'
      },
      {
        name: 'Y2K Acid Wash Oversized Denim Jacket',
        description: 'Classic late 90s/early 2000s heavyweight acid wash denim jacket with silver buttons.',
        category: 'Apparel',
        subcategory: 'Denim & Jeans',
        price: 185.00,
        cost_price: 75.00,
        quantity: 5,
        sku: 'VA-APP-Y2K-006',
        era: 'Y2K',
        condition: 'Very Good',
        image_url: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&auto=format&fit=crop&q=80'
      }
    ];

    for (const p of sampleProducts) {
      await dbAsync.run(
        `INSERT INTO Products (name, description, category, subcategory, price, cost_price, quantity, sku, era, condition, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.description, p.category, p.subcategory, p.price, p.cost_price, p.quantity, p.sku, p.era, p.condition, p.image_url]
      );
    }
    console.log(`Seeded ${sampleProducts.length} sample products with subcategories.`);
  }

  console.log('Database initialization and migrations completed successfully!');
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };
