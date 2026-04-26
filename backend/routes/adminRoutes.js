const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllServices,
  getAllBookings,
  adminDeleteService,
  adminDeleteReview,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/services', getAllServices);
router.delete('/services/:id', adminDeleteService);
router.get('/bookings', getAllBookings);
router.delete('/reviews/:id', adminDeleteReview);

module.exports = router;
