const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbAsync } = require('../database/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await dbAsync.get('SELECT * FROM Admins WHERE username = ? OR email = ?', [username.trim(), username.trim()]);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isValidPassword = bcrypt.compareSync(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const admin = await dbAsync.get('SELECT id, username, email, created_at FROM Admins WHERE id = ?', [req.user.id]);
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found.' });
    }
    res.json({ user: admin });
  } catch (err) {
    console.error('Error fetching admin user:', err);
    res.status(500).json({ error: 'Server error fetching user.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful.' });
});

module.exports = router;
