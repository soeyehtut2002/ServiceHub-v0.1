const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ─── Helper ──────────────────────────────────────────────────────────────────
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const validRole = ['customer', 'provider'].includes(role) ? role : 'customer';

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, phone, location, created_at`,
      [name, email, password_hash, validRole, phone || null, location || null]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(201).json({ message: 'Registration successful', user, token });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar_url: user.avatar_url,
        bio: user.bio,
        is_verified: user.is_verified,
      },
      token,
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, phone, location, avatar_url, bio, is_verified, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  PUT /api/auth/profile ───────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio } = req.body;

    const result = await db.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           location = COALESCE($3, location),
           bio = COALESCE($4, bio),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, email, role, phone, location, avatar_url, bio, is_verified`,
      [name, phone, location, bio, req.user.id]
    );

    res.status(200).json({ message: 'Profile updated', user: result.rows[0] });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, getMe, updateProfile };
