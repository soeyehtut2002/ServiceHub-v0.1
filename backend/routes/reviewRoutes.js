const express = require('express');
const router = express.Router();
const { createReview, getServiceReviews, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('customer'), createReview);
router.get('/service/:id', getServiceReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
