const db = require('../config/db');

// ─── @route  GET /api/admin/stats ────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [users, services, bookings, reviews] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM services WHERE is_active = TRUE'),
      db.query('SELECT COUNT(*) FROM bookings'),
      db.query('SELECT COUNT(*) FROM reviews'),
    ]);

    const bookingStats = await db.query(
      `SELECT status, COUNT(*) AS count FROM bookings GROUP BY status`
    );

    const recentBookings = await db.query(
      `SELECT b.*, s.title AS service_title, u.name AS customer_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.customer_id = u.id
       ORDER BY b.created_at DESC LIMIT 5`
    );

    const categoryStats = await db.query(
      `SELECT category, COUNT(*) AS count FROM services WHERE is_active = TRUE GROUP BY category ORDER BY count DESC`
    );

    res.status(200).json({
      totals: {
        users: parseInt(users.rows[0].count),
        services: parseInt(services.rows[0].count),
        bookings: parseInt(bookings.rows[0].count),
        reviews: parseInt(reviews.rows[0].count),
      },
      bookingsByStatus: bookingStats.rows,
      recentBookings: recentBookings.rows,
      categoryStats: categoryStats.rows,
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/admin/users ─────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, phone, location, is_verified, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  PATCH /api/admin/users/:id/status ───────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const newStatus = !user.rows[0].is_active;
    const result = await db.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role, is_active',
      [newStatus, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  DELETE /api/admin/users/:id ──────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/admin/services ──────────────────────────────────────────
const getAllServices = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, u.name AS provider_name,
         COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
         COUNT(DISTINCT r.id)::int AS review_count,
         COUNT(DISTINCT b.id)::int AS booking_count
       FROM services s
       JOIN users u ON s.provider_id = u.id
       LEFT JOIN reviews r ON r.service_id = s.id
       LEFT JOIN bookings b ON b.service_id = s.id
       GROUP BY s.id, u.name
       ORDER BY s.created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getAllServices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/admin/bookings ──────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*,
         s.title AS service_title,
         s.price,
         cu.name AS customer_name,
         pu.name AS provider_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users cu ON b.customer_id = cu.id
       JOIN users pu ON s.provider_id = pu.id
       ORDER BY b.created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  DELETE /api/admin/services/:id ──────────────────────────────────
const adminDeleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const check = await db.query('SELECT id FROM services WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Service not found' });
    await db.query('DELETE FROM services WHERE id = $1', [id]);
    res.status(200).json({ message: 'Service deleted by admin' });
  } catch (error) {
    console.error('adminDeleteService error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// ─── @route  GET /api/admin/reviews ──────────────────────────────────────────
const getAllReviews = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         r.*,
         u.name  AS customer_name,
         u.email AS customer_email,
         s.title AS service_title,
         s.id    AS service_id
       FROM reviews r
       JOIN users    u ON r.customer_id = u.id
       JOIN services s ON r.service_id  = s.id
       ORDER BY r.is_flagged DESC, r.created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getAllReviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  PATCH /api/admin/reviews/:id/flag ────────────────────────────────
const flagReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { flag_reason } = req.body;
    const check = await db.query('SELECT id, is_flagged FROM reviews WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    const newFlagged = !check.rows[0].is_flagged;
    const result = await db.query(
      `UPDATE reviews SET is_flagged = $1, flag_reason = $2 WHERE id = $3
       RETURNING id, is_flagged, flag_reason`,
      [newFlagged, flag_reason || null, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('flagReview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  DELETE /api/admin/reviews/:id ───────────────────────────────────

const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.status(200).json({ message: 'Review deleted by admin' });
  } catch (error) {
    console.error('adminDeleteReview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/admin/cancellations ───────────────────────────────────────────
const getCancellations = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         b.id,
         b.cancelled_by,
         b.cancellation_reason,
         b.cancelled_at,
         b.booking_date,
         b.notes,
         b.location,
         s.title AS service_title,
         s.price,
         cu.name  AS customer_name,
         cu.email AS customer_email,
         pu.name  AS provider_name,
         pu.email AS provider_email
       FROM bookings b
       JOIN services s  ON b.service_id  = s.id
       JOIN users    cu ON b.customer_id = cu.id
       JOIN users    pu ON s.provider_id = pu.id
       WHERE b.status = 'cancelled'
       ORDER BY COALESCE(b.cancelled_at, b.updated_at) DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getCancellations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllServices,
  getAllBookings,
  adminDeleteService,
  getAllReviews,
  flagReview,
  adminDeleteReview,
  getCancellations,
};

