const db = require('../config/db');

// ─── @route  POST /api/bookings ───────────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const { service_id, booking_date, notes } = req.body;

    if (!service_id || !booking_date) {
      return res.status(400).json({ error: 'service_id and booking_date are required' });
    }

    // Verify service exists and is active
    const service = await db.query('SELECT * FROM services WHERE id = $1 AND is_active = TRUE', [service_id]);
    if (service.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Prevent provider from booking their own service
    if (service.rows[0].provider_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot book your own service' });
    }

    const result = await db.query(
      `INSERT INTO bookings (customer_id, service_id, booking_date, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, service_id, booking_date, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/bookings/my ─────────────────────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         b.*,
         s.title AS service_title,
         s.image_url,
         s.price,
         s.category,
         u.name AS provider_name,
         u.phone AS provider_phone
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON s.provider_id = u.id
       WHERE b.customer_id = $1
       ORDER BY b.booking_date DESC`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getMyBookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  GET /api/bookings/provider ──────────────────────────────────────
const getProviderBookings = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         b.*,
         s.title AS service_title,
         s.price,
         s.category,
         u.name AS customer_name,
         u.email AS customer_email,
         u.phone AS customer_phone
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.customer_id = u.id
       WHERE s.provider_id = $1
       ORDER BY b.booking_date ASC`,
      [req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getProviderBookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  PATCH /api/bookings/:id/status ──────────────────────────────────
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Verify the booking belongs to a service owned by the requesting provider
    const check = await db.query(
      `SELECT b.* FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.id = $1 AND s.provider_id = $2`,
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }

    const result = await db.query(
      `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── @route  PATCH /api/bookings/:id/cancel ──────────────────────────────────
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const check = await db.query(
      `SELECT * FROM bookings WHERE id = $1 AND customer_id = $2`,
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (check.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed booking' });
    }

    const result = await db.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createBooking, getMyBookings, getProviderBookings, updateBookingStatus, cancelBooking };
