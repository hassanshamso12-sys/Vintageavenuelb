const express = require('express');
const { dbAsync } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - Public API returning hierarchical category tree
router.get('/', async (req, res) => {
  try {
    const categories = await dbAsync.all('SELECT * FROM Categories ORDER BY name ASC');
    const subcategories = await dbAsync.all('SELECT * FROM Subcategories ORDER BY name ASC');

    const tree = categories.map(cat => {
      const subs = subcategories.filter(sub => sub.category_id === cat.id);
      return {
        ...cat,
        subcategories: subs
      };
    });

    res.json({ categories: tree });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
});

// POST /api/categories (Protected Admin) - Create Main Category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const existing = await dbAsync.get('SELECT id FROM Categories WHERE name = ?', [trimmedName]);
    if (existing) {
      return res.status(400).json({ error: `Category '${trimmedName}' already exists.` });
    }

    const result = await dbAsync.run(
      'INSERT INTO Categories (name, slug) VALUES (?, ?)',
      [trimmedName, slug]
    );

    const newCat = await dbAsync.get('SELECT * FROM Categories WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Category created successfully', category: newCat });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Server error creating category.' });
  }
});

// PUT /api/categories/:id (Protected Admin) - Update Main Category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const catId = req.params.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await dbAsync.run(
      'UPDATE Categories SET name = ?, slug = ? WHERE id = ?',
      [trimmedName, slug, catId]
    );

    res.json({ message: 'Category updated successfully.' });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Server error updating category.' });
  }
});

// DELETE /api/categories/:id (Protected Admin) - Delete Main Category & Subcategories
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const catId = req.params.id;
    await dbAsync.run('DELETE FROM Categories WHERE id = ?', [catId]);
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Server error deleting category.' });
  }
});

// POST /api/categories/:id/subcategories (Protected Admin) - Create Subcategory under Category
router.post('/:id/subcategories', authenticateToken, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Subcategory name is required.' });
    }

    const category = await dbAsync.get('SELECT id FROM Categories WHERE id = ?', [categoryId]);
    if (!category) {
      return res.status(404).json({ error: 'Parent Category not found.' });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const result = await dbAsync.run(
      'INSERT INTO Subcategories (category_id, name, slug) VALUES (?, ?, ?)',
      [categoryId, trimmedName, slug]
    );

    const newSub = await dbAsync.get('SELECT * FROM Subcategories WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Subcategory created successfully', subcategory: newSub });
  } catch (err) {
    console.error('Error creating subcategory:', err);
    res.status(500).json({ error: 'Server error creating subcategory.' });
  }
});

// DELETE /api/subcategories/:id (Protected Admin) - Delete Subcategory
router.delete('/subcategories/:id', authenticateToken, async (req, res) => {
  try {
    const subId = req.params.id;
    await dbAsync.run('DELETE FROM Subcategories WHERE id = ?', [subId]);
    res.json({ message: 'Subcategory deleted successfully.' });
  } catch (err) {
    console.error('Error deleting subcategory:', err);
    res.status(500).json({ error: 'Server error deleting subcategory.' });
  }
});

module.exports = router;
