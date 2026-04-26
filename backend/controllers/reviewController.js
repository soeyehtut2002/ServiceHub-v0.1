const db = require('../config/db');

// ─── @route  POST /api/reviews ────────────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { service_id, booking_id, rating, comment } = req.body;

    if (!service_id || !rating) {
      return res.status(400).json({ error: 'service_id and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Ensure booking exists and belongs to this user for the service
    if (booking_id) {
      const bookingCheck = await db.query(
        `SELECT * FROM bookings WHERE id = $1 AND customer_id = $2 AND service_id = $3 AND status = 'completed'`,
        [booking_id, req.user.id, service_id]
      );
      if (bookingCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You can only review services from completed bookings' });
      }
    }

    // Check for duplicate review
    const dup = await db.query(
      'SELECT id FROM reviews WHERE customer_id = $1 AND service_id = $2',
      [req.user.id, service_id]
    );
    if (dup.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this service' });
    }

    const result = await db.query(
      `INSERT INTO reviews (customer_id, service_id, booking_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, service_id, booking_id || null, parseInt(rating), comment || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('createReview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/reviews/service/:id ────────────────────────────────────
const getServiceReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT
         r.*,
         u.name AS customer_name,
         u.avatar_url AS customer_avatar
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.service_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    const avgResult = await db.query(
      `SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating, COUNT(*) AS total FROM reviews WHERE service_id = $1`,
      [id]
    );

    res.status(200).json({
      reviews: result.rows,
      avg_rating: parseFloat(avgResult.rows[0].avg_rating),
      total: parseInt(avgResult.rows[0].total),
    });
  } catch (error) {
    console.error('getServiceReviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  DELETE /api/reviews/:id ─────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await db.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Allow own deletion or admin
    if (check.rows[0].customer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createReview, getServiceReviews, deleteReview };
