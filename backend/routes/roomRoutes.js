const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getBuildings
} = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/buildings', authenticate, getBuildings);
router.get('/', authenticate, getRooms);
router.get('/:id', authenticate, getRoomById);
router.post('/', authenticate, authorize('admin'), createRoom);
router.put('/:id', authenticate, authorize('admin'), updateRoom);
router.delete('/:id', authenticate, authorize('admin'), deleteRoom);

module.exports = router;
