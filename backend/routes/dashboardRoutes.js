const express = require('express');
const router = express.Router();
const {
  getStats,
  getEquipmentStats,
  getRoomStats,
  getMonthlyStats
} = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, getStats);
router.get('/equipment', authenticate, authorize('admin'), getEquipmentStats);
router.get('/rooms', authenticate, authorize('admin'), getRoomStats);
router.get('/monthly', authenticate, authorize('admin'), getMonthlyStats);

module.exports = router;
