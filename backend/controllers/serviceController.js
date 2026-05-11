const db = require('../config/db');

// ─── @route  GET /api/services ───────────────────────────────────────────────
const getServices = async (req, res) => {
  try {
    const { keyword, category, location, min_price, max_price, min_rating, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT
        s.*,
        u.name AS provider_name,
        u.is_verified AS provider_verified,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
        COUNT(DISTINCT r.id)::int AS review_count
      FROM services s
      JOIN users u ON s.provider_id = u.id
      LEFT JOIN reviews r ON r.service_id = s.id
      WHERE s.is_active = TRUE
    `;

    const values = [];
    let idx = 1;

    if (keyword) {
      query += ` AND (s.title ILIKE $${idx} OR s.description ILIKE $${idx})`;
      values.push(`%${keyword}%`);
      idx++;
    }
    if (category) {
      query += ` AND s.category = $${idx}`;
      values.push(category);
      idx++;
    }
    if (location) {
      query += ` AND s.location ILIKE $${idx}`;
      values.push(`%${location}%`);
      idx++;
    }
    if (min_price) {
      query += ` AND s.price >= $${idx}`;
      values.push(parseFloat(min_price));
      idx++;
    }
    if (max_price) {
      query += ` AND s.price <= $${idx}`;
      values.push(parseFloat(max_price));
      idx++;
    }

    query += ` GROUP BY s.id, u.name, u.is_verified`;

    if (min_rating) {
      query += ` HAVING COALESCE(ROUND(AVG(r.rating), 1), 0) >= $${idx}`;
      values.push(parseFloat(min_rating));
      idx++;
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    values.push(parseInt(limit), offset);

    const result = await db.query(query, values);

    // Total count for pagination (re-use same filters, minus LIMIT/OFFSET)
    let countQuery = `SELECT COUNT(DISTINCT s.id) FROM services s WHERE s.is_active = TRUE`;
    const countValues = [];
    let cIdx = 1;
    if (keyword) { countQuery += ` AND (s.title ILIKE $${cIdx} OR s.description ILIKE $${cIdx})`; countValues.push(`%${keyword}%`); cIdx++; }
    if (category) { countQuery += ` AND s.category = $${cIdx}`; countValues.push(category); cIdx++; }
    if (location) { countQuery += ` AND s.location ILIKE $${cIdx}`; countValues.push(`%${location}%`); cIdx++; }
    if (min_price) { countQuery += ` AND s.price >= $${cIdx}`; countValues.push(parseFloat(min_price)); cIdx++; }
    if (max_price) { countQuery += ` AND s.price <= $${cIdx}`; countValues.push(parseFloat(max_price)); cIdx++; }
    const countResult = await db.query(countQuery, countValues);

    res.status(200).json({
      services: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('getServices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/services/featured ─────────────────────────────────────
const getFeaturedServices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.*,
        u.name AS provider_name,
        u.is_verified AS provider_verified,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
        COUNT(DISTINCT r.id)::int AS review_count
      FROM services s
      JOIN users u ON s.provider_id = u.id
      LEFT JOIN reviews r ON r.service_id = s.id
      WHERE s.is_active = TRUE
      GROUP BY s.id, u.name, u.is_verified
      ORDER BY avg_rating DESC, review_count DESC
      LIMIT 6
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getFeaturedServices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/services/:id ───────────────────────────────────────────
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT
         s.*,
         u.name         AS provider_name,
         u.email        AS provider_email,
         u.phone        AS provider_phone,
         u.avatar_url   AS provider_avatar,
         u.bio          AS provider_bio,
         u.account_type AS provider_account_type,
         u.is_verified  AS provider_verified,
         u.location     AS provider_location,
         COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
         COUNT(DISTINCT r.id)::int AS review_count
       FROM services s
       JOIN users u ON s.provider_id = u.id
       LEFT JOIN reviews r ON r.service_id = s.id
       WHERE s.id = $1 AND s.is_active = TRUE
       GROUP BY s.id, u.name, u.email, u.phone, u.avatar_url, u.bio,
                u.account_type, u.is_verified, u.location`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('getServiceById error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/services/provider/mine ─────────────────────────────────
const getProviderServices = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         s.*,
         COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
         COUNT(DISTINCT r.id)::int AS review_count,
         COUNT(DISTINCT b.id)::int AS booking_count
       FROM services s
       LEFT JOIN reviews r ON r.service_id = s.id
       LEFT JOIN bookings b ON b.service_id = s.id
       WHERE s.provider_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getProviderServices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  POST /api/services ──────────────────────────────────────────────
const createService = async (req, res) => {
  try {
    const { title, description, category, location, price, duration_hours, team_count } = req.body;

    if (!title || !description || !category || !location || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const dur  = Math.max(1, Math.min(12, parseInt(duration_hours) || 1));  // clamp 1-12 hrs
    const teams = Math.max(1, Math.min(50, parseInt(team_count)    || 1));  // clamp 1-50 teams
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await db.query(
      `INSERT INTO services (provider_id, title, description, category, location, price, image_url, duration_hours, team_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.user.id, title, description, category, location, parseFloat(price), image_url, dur, teams]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('createService error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  PUT /api/services/:id ───────────────────────────────────────────
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, price, is_active, duration_hours, team_count } = req.body;

    const check = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    if (check.rows[0].provider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const dur   = duration_hours ? Math.max(1, Math.min(12, parseInt(duration_hours))) : null;
    const teams = team_count     ? Math.max(1, Math.min(50, parseInt(team_count)))     : null;
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : check.rows[0].image_url;

    const result = await db.query(
      `UPDATE services
       SET title          = COALESCE($1,  title),
           description    = COALESCE($2,  description),
           category       = COALESCE($3,  category),
           location       = COALESCE($4,  location),
           price          = COALESCE($5,  price),
           image_url      = $6,
           is_active      = COALESCE($7,  is_active),
           duration_hours = COALESCE($8,  duration_hours),
           team_count     = COALESCE($9,  team_count),
           updated_at     = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [title, description, category, location, price ? parseFloat(price) : null,
       image_url, is_active ?? null, dur, teams, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('updateService error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  DELETE /api/services/:id ────────────────────────────────────────
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    if (check.rows[0].provider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.query('DELETE FROM services WHERE id = $1', [id]);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('deleteService error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── @route  PATCH /api/services/:id/availability  (provider) ─────────────────
const setAvailability = async (req, res) => {
  try {
    const { id }               = req.params;
    const { availability_status } = req.body;

    const validStatuses = ['available', 'fully_booked', 'paused'];
    if (!validStatuses.includes(availability_status)) {
      return res.status(400).json({ error: 'Invalid availability_status. Use: available, fully_booked, paused' });
    }

    const check = await db.query('SELECT * FROM services WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    if (check.rows[0].provider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await db.query(
      `UPDATE services SET availability_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [availability_status, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('setAvailability error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getServices,
  getFeaturedServices,
  getServiceById,
  getProviderServices,
  createService,
  updateService,
  deleteService,
  setAvailability,
};
