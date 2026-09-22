const express = require('express');
const { dbAsync } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/products/generate-sku
router.get('/generate-sku', (req, res) => {
  const category = req.query.category || 'GEN';
  const catCode = category.substring(0, 3).toUpperCase();
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.floor(100 + Math.random() * 900);
  const sku = `VA-${catCode}-${dateStr}-${rand}`;
  res.json({ sku });
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, search, minPrice, maxPrice, era, condition, sort, lowStockOnly } = req.query;

    let sql = 'SELECT * FROM Products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (subcategory && subcategory !== 'All') {
      sql += ' AND subcategory = ?';
      params.push(subcategory);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ? OR subcategory LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (era) {
      sql += ' AND era = ?';
      params.push(era);
    }

    if (condition) {
      sql += ' AND condition = ?';
      params.push(condition);
    }

    if (lowStockOnly === 'true') {
      sql += ' AND quantity <= 3';
    }

    if (sort === 'price_asc') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'name_asc') {
      sql += ' ORDER BY name ASC';
    } else if (sort === 'stock_asc') {
      sql += ' ORDER BY quantity ASC';
    } else {
      sql += ' ORDER BY created_at DESC';
    }

    const products = await dbAsync.all(sql, params);
    
    // Check if user is authenticated admin; if not, sanitize out cost_price
    const authHeader = req.headers['authorization'];
    const isAdmin = authHeader && authHeader.split(' ')[1];

    const sanitizedProducts = products.map(p => {
      if (!isAdmin) {
        delete p.cost_price;
      }
      return p;
    });

    res.json({ products: sanitizedProducts, count: sanitizedProducts.length });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error fetching products.' });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await dbAsync.all('SELECT DISTINCT category FROM Products ORDER BY category ASC');
    res.json({ categories: categories.map(c => c.category) });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await dbAsync.get('SELECT * FROM Products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      delete product.cost_price;
    }

    res.json({ product });
  } catch (err) {
    console.error('Error fetching product detail:', err);
    res.status(500).json({ error: 'Server error fetching product.' });
  }
});

// POST /api/products (Protected Admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, category, subcategory, price, cost_price, quantity, sku, era, condition, image_url } = req.body;

    if (!name || !category || price === undefined || quantity === undefined || !sku) {
      return res.status(400).json({ error: 'Missing required fields: name, category, price, quantity, sku.' });
    }

    const numericPrice = parseFloat(price);
    const numericCostPrice = parseFloat(cost_price || 0);
    const numericQuantity = parseInt(quantity, 10);

    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number.' });
    }

    if (isNaN(numericQuantity) || numericQuantity < 0) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer.' });
    }

    const existingSku = await dbAsync.get('SELECT id FROM Products WHERE sku = ?', [sku.trim()]);
    if (existingSku) {
      return res.status(400).json({ error: `Product with SKU '${sku.trim()}' already exists.` });
    }

    const result = await dbAsync.run(
      `INSERT INTO Products (name, description, category, subcategory, price, cost_price, quantity, sku, era, condition, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        description ? description.trim() : '',
        category.trim(),
        subcategory ? subcategory.trim() : '',
        numericPrice,
        numericCostPrice,
        numericQuantity,
        sku.trim(),
        era ? era.trim() : 'Vintage',
        condition ? condition.trim() : 'Good',
        image_url ? image_url.trim() : ''
      ]
    );

    const newProduct = await dbAsync.get('SELECT * FROM Products WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error creating product.' });
  }
});

// PUT /api/products/:id (Protected Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await dbAsync.get('SELECT * FROM Products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const { name, description, category, subcategory, price, cost_price, quantity, sku, era, condition, image_url } = req.body;

    const numericPrice = price !== undefined ? parseFloat(price) : existingProduct.price;
    const numericCostPrice = cost_price !== undefined ? parseFloat(cost_price) : existingProduct.cost_price;
    const numericQuantity = quantity !== undefined ? parseInt(quantity, 10) : existingProduct.quantity;

    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number.' });
    }

    if (isNaN(numericQuantity) || numericQuantity < 0) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer.' });
    }

    if (sku && sku.trim() !== existingProduct.sku) {
      const skuCheck = await dbAsync.get('SELECT id FROM Products WHERE sku = ? AND id != ?', [sku.trim(), productId]);
      if (skuCheck) {
        return res.status(400).json({ error: `Product SKU '${sku.trim()}' is already in use by another item.` });
      }
    }

    await dbAsync.run(
      `UPDATE Products 
       SET name = ?, description = ?, category = ?, subcategory = ?, price = ?, cost_price = ?, quantity = ?, sku = ?, era = ?, condition = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name ? name.trim() : existingProduct.name,
        description !== undefined ? description.trim() : existingProduct.description,
        category ? category.trim() : existingProduct.category,
        subcategory !== undefined ? subcategory.trim() : existingProduct.subcategory,
        numericPrice,
        numericCostPrice,
        numericQuantity,
        sku ? sku.trim() : existingProduct.sku,
        era !== undefined ? era.trim() : existingProduct.era,
        condition !== undefined ? condition.trim() : existingProduct.condition,
        image_url !== undefined ? image_url.trim() : existingProduct.image_url,
        productId
      ]
    );

    const updatedProduct = await dbAsync.get('SELECT * FROM Products WHERE id = ?', [productId]);
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Server error updating product.' });
  }
});

// DELETE /api/products/:id (Protected Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await dbAsync.get('SELECT * FROM Products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const orderItemRef = await dbAsync.get('SELECT id FROM OrderItems WHERE product_id = ? LIMIT 1', [productId]);
    if (orderItemRef) {
      return res.status(400).json({
        error: 'Cannot delete product associated with existing orders. Set quantity to 0 to archive.'
      });
    }

    await dbAsync.run('DELETE FROM Products WHERE id = ?', [productId]);
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error deleting product.' });
  }
});

module.exports = router;
