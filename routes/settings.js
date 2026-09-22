const express = require('express');
const { dbAsync } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings (Public - for live site branding)
router.get('/', async (req, res) => {
  try {
    const rows = await dbAsync.all('SELECT key, value FROM Settings');
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json({ settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Server error fetching settings.' });
  }
});

// POST /api/settings (Protected Admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body; // Key-value object
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload.' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await dbAsync.run(
        'INSERT OR REPLACE INTO Settings (key, value) VALUES (?, ?)',
        [key, String(value)]
      );
    }

    res.json({ message: 'Settings updated successfully.' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Server error updating settings.' });
  }
});

module.exports = router;
