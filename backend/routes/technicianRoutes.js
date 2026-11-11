const express = require('express');
const router = express.Router();
const {
  getTechnicians,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  getMyTasks
} = require('../controllers/technicianController');
const { authenticate, authorize } = require('../middleware/auth');

// Tasks assigned to logged-in technician
router.get('/my-tasks', authenticate, authorize('technician'), getMyTasks);

// Technician management (Admin)
router.get('/', authenticate, getTechnicians);
router.post('/', authenticate, authorize('admin'), createTechnician);
router.put('/:id', authenticate, authorize('admin'), updateTechnician);
router.delete('/:id', authenticate, authorize('admin'), deleteTechnician);

module.exports = router;
