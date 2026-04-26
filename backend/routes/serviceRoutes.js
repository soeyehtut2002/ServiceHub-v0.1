const express = require('express');
const router = express.Router();
const {
  getServices,
  getFeaturedServices,
  getServiceById,
  getProviderServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getServices);
router.get('/featured', getFeaturedServices);
router.get('/provider/mine', protect, authorize('provider'), getProviderServices);
router.get('/:id', getServiceById);

router.post('/', protect, authorize('provider'), upload.single('image'), createService);
router.put('/:id', protect, authorize('provider', 'admin'), upload.single('image'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
