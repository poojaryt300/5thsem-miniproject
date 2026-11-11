const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  assignTechnician,
  updateComplaintStatus
} = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create complaint with optional photo upload
router.post('/', authenticate, upload.single('photo'), createComplaint);

// Get current user's complaints (Students & Staff)
router.get('/my', authenticate, getMyComplaints);

// Get all complaints (Admin only)
router.get('/', authenticate, authorize('admin'), getAllComplaints);

// Get single complaint details & timeline (Authorized roles)
router.get('/:id', authenticate, getComplaintById);

// Assign technician to complaint (Admin only)
router.put('/:id/assign', authenticate, authorize('admin'), assignTechnician);

// Update complaint status & repair notes (Technicians and Admin)
router.put('/:id/status', authenticate, authorize('admin', 'technician'), updateComplaintStatus);

module.exports = router;
