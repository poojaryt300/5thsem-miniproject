const express = require('express');
const router = express.Router();
const {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getEquipment);
router.post('/', authenticate, authorize('admin'), createEquipment);
router.put('/:id', authenticate, authorize('admin'), updateEquipment);
router.delete('/:id', authenticate, authorize('admin'), deleteEquipment);

module.exports = router;
