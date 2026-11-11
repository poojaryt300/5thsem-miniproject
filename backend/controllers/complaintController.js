const pool = require('../config/db');

// Helper to generate unique complaint code
const generateComplaintCode = async () => {
  const year = new Date().getFullYear();
  let code = '';
  let exists = true;
  while (exists) {
    const random = Math.floor(1000 + Math.random() * 9000);
    code = `CTC-${year}-${random}`;
    const [rows] = await pool.query('SELECT id FROM complaints WHERE complaint_code = ?', [code]);
    if (rows.length === 0) exists = false;
  }
  return code;
};

// @desc Create a new complaint
// @route POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { room_id, equipment_id, problem_type, description, priority } = req.body;
    const userId = req.user.id;

    if (!room_id || !problem_type || !description) {
      return res.status(400).json({ success: false, message: 'Room, problem type, and description are required.' });
    }

    const complaintCode = await generateComplaintCode();
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const complaintPriority = ['Low', 'Medium', 'High', 'Urgent'].includes(priority) ? priority : 'Medium';
    const equipId = equipment_id && equipment_id !== 'null' && equipment_id !== '' ? parseInt(equipment_id, 10) : null;

    const [result] = await pool.query(
      `INSERT INTO complaints 
        (complaint_code, user_id, room_id, equipment_id, problem_type, description, photo_url, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
      [complaintCode, userId, parseInt(room_id, 10), equipId, problem_type, description, photoUrl, complaintPriority]
    );

    const complaintId = result.insertId;

    // Log in complaint_updates
    await pool.query(
      `INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, note)
       VALUES (?, ?, NULL, 'Submitted', ?)`,
      [complaintId, userId, `Complaint created by ${req.user.name} (${req.user.role})`]
    );

    // If equipment specified, update equipment status to needs_maintenance
    if (equipId) {
      await pool.query('UPDATE equipment SET status = "needs_maintenance" WHERE id = ?', [equipId]);
    }

    // Notify all admins about the new complaint
    const [admins] = await pool.query('SELECT id FROM users WHERE role = "admin"');
    for (const admin of admins) {
      await pool.query(
        'INSERT INTO notifications (user_id, complaint_id, message) VALUES (?, ?, ?)',
        [admin.id, complaintId, `New complaint #${complaintCode} reported by ${req.user.name}: ${problem_type} (${complaintPriority} priority).`]
      );
    }

    // Confirmation notification to reporter
    await pool.query(
      'INSERT INTO notifications (user_id, complaint_id, message) VALUES (?, ?, ?)',
      [userId, complaintId, `Your complaint #${complaintCode} has been submitted successfully.`]
    );

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint_id: complaintId,
      complaint_code: complaintCode
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to submit complaint.', error: error.message });
  }
};

// @desc Get complaints submitted by logged-in user (Student or Staff)
// @route GET /api/complaints/my
const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, priority, search } = req.query;

    let query = `
      SELECT 
        c.*,
        r.building,
        r.room_number,
        r.room_type,
        e.equipment_name,
        e.equipment_type,
        t.name AS technician_name,
        t.phone AS technician_phone,
        t.specialization AS technician_specialization
      FROM complaints c
      JOIN rooms r ON c.room_id = r.id
      LEFT JOIN equipment e ON c.equipment_id = e.id
      LEFT JOIN technicians t ON c.technician_id = t.id
      WHERE c.user_id = ?
    `;

    const params = [userId];

    if (status && status !== 'All') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (priority && priority !== 'All') {
      query += ' AND c.priority = ?';
      params.push(priority);
    }

    if (search && search.trim() !== '') {
      query += ' AND (c.complaint_code LIKE ? OR c.description LIKE ? OR c.problem_type LIKE ? OR r.room_number LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY c.created_at DESC';

    const [complaints] = await pool.query(query, params);

    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ success: false, message: 'Error fetching complaints.', error: error.message });
  }
};

// @desc Get all complaints for Admin with advanced filters
// @route GET /api/complaints
const getAllComplaints = async (req, res) => {
  try {
    const { status, priority, building, room_id, equipment_type, search, startDate, endDate } = req.query;

    let query = `
      SELECT 
        c.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        u.role AS reporter_role,
        u.department AS reporter_department,
        u.phone AS reporter_phone,
        r.building,
        r.room_number,
        r.room_type,
        e.equipment_name,
        e.equipment_type,
        t.name AS technician_name,
        t.phone AS technician_phone,
        t.specialization AS technician_specialization
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      JOIN rooms r ON c.room_id = r.id
      LEFT JOIN equipment e ON c.equipment_id = e.id
      LEFT JOIN technicians t ON c.technician_id = t.id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'All') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (priority && priority !== 'All') {
      query += ' AND c.priority = ?';
      params.push(priority);
    }

    if (building && building !== 'All') {
      query += ' AND r.building = ?';
      params.push(building);
    }

    if (room_id && room_id !== 'All') {
      query += ' AND c.room_id = ?';
      params.push(parseInt(room_id, 10));
    }

    if (equipment_type && equipment_type !== 'All') {
      query += ' AND e.equipment_type = ?';
      params.push(equipment_type);
    }

    if (startDate) {
      query += ' AND DATE(c.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(c.created_at) <= ?';
      params.push(endDate);
    }

    if (search && search.trim() !== '') {
      query += ' AND (c.complaint_code LIKE ? OR c.description LIKE ? OR c.problem_type LIKE ? OR u.name LIKE ? OR r.room_number LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s);
    }

    query += ' ORDER BY c.created_at DESC';

    const [complaints] = await pool.query(query, params);

    res.json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    console.error('Error fetching all complaints:', error);
    res.status(500).json({ success: false, message: 'Error fetching complaints.', error: error.message });
  }
};

// @desc Get single complaint details with complete history timeline
// @route GET /api/complaints/:id
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        c.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        u.role AS reporter_role,
        u.department AS reporter_department,
        u.phone AS reporter_phone,
        r.building,
        r.room_number,
        r.room_type,
        r.qr_code,
        e.equipment_name,
        e.equipment_type,
        t.name AS technician_name,
        t.email AS technician_email,
        t.phone AS technician_phone,
        t.specialization AS technician_specialization
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      JOIN rooms r ON c.room_id = r.id
      LEFT JOIN equipment e ON c.equipment_id = e.id
      LEFT JOIN technicians t ON c.technician_id = t.id
      WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const complaint = rows[0];

    // Authorization check: students/staff can only see their own complaints, technicians only their assigned, admin can see all
    if (req.user.role === 'student' || req.user.role === 'staff') {
      if (complaint.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this complaint.' });
      }
    } else if (req.user.role === 'technician') {
      // Find technician record for this user
      const [tech] = await pool.query('SELECT id FROM technicians WHERE user_id = ? OR email = ?', [req.user.id, req.user.email]);
      if (tech.length === 0 || complaint.technician_id !== tech[0].id) {
        return res.status(403).json({ success: false, message: 'This complaint is not assigned to you.' });
      }
    }

    // Fetch complaint timeline history
    const [history] = await pool.query(
      `SELECT 
        cu.*,
        u.name AS updated_by_name,
        u.role AS updated_by_role
       FROM complaint_updates cu
       JOIN users u ON cu.updated_by = u.id
       WHERE cu.complaint_id = ?
       ORDER BY cu.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      complaint: {
        ...complaint,
        history
      }
    });
  } catch (error) {
    console.error('Error fetching complaint details:', error);
    res.status(500).json({ success: false, message: 'Error retrieving complaint.', error: error.message });
  }
};

// @desc Assign technician to a complaint (Admin only)
// @route PUT /api/complaints/:id/assign
const assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id, note } = req.body;

    if (!technician_id) {
      return res.status(400).json({ success: false, message: 'Please select a technician.' });
    }

    // Verify complaint exists
    const [complaintRows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (complaintRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    const complaint = complaintRows[0];

    // Verify technician exists
    const [techRows] = await pool.query('SELECT * FROM technicians WHERE id = ?', [technician_id]);
    if (techRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Technician not found.' });
    }
    const tech = techRows[0];

    const oldStatus = complaint.status;
    const newStatus = 'Assigned';

    // Update complaint
    await pool.query(
      'UPDATE complaints SET technician_id = ?, status = ? WHERE id = ?',
      [technician_id, newStatus, id]
    );

    // Update technician status to busy if available
    await pool.query('UPDATE technicians SET status = "busy" WHERE id = ?', [technician_id]);

    // Insert update history
    const updateNote = note || `Assigned to technician ${tech.name} (${tech.specialization})`;
    await pool.query(
      `INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, note)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.id, oldStatus, newStatus, updateNote]
    );

    // Notify technician if technician has a user_id
    if (tech.user_id) {
      await pool.query(
        'INSERT INTO notifications (user_id, complaint_id, message) VALUES (?, ?, ?)',
        [tech.user_id, id, `You have been assigned complaint #${complaint.complaint_code}: ${complaint.problem_type}.`]
      );
    }

    // Notify the reporter
    await pool.query(
      'INSERT INTO notifications (user_id, complaint_id, message) VALUES (?, ?, ?)',
      [complaint.user_id, id, `Technician ${tech.name} has been assigned to your complaint #${complaint.complaint_code}.`]
    );

    res.json({
      success: true,
      message: `Technician ${tech.name} successfully assigned!`,
      technician: tech
    });
  } catch (error) {
    console.error('Error assigning technician:', error);
    res.status(500).json({ success: false, message: 'Failed to assign technician.', error: error.message });
  }
};

// @desc Update complaint status and repair notes (Technician or Admin)
// @route PUT /api/complaints/:id/status
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, repair_notes } = req.body;

    const validStatuses = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    const complaint = rows[0];

    // If user is technician, verify assignment
    if (req.user.role === 'technician') {
      const [tech] = await pool.query('SELECT id FROM technicians WHERE user_id = ? OR email = ?', [req.user.id, req.user.email]);
      if (tech.length === 0 || complaint.technician_id !== tech[0].id) {
        return res.status(403).json({ success: false, message: 'You can only update status for complaints assigned to you.' });
      }
    }

    const oldStatus = complaint.status;
    const resolvedAt = status === 'Resolved' ? new Date() : (status === 'Closed' ? complaint.resolved_at || new Date() : null);

    const mergedRepairNotes = repair_notes ? repair_notes : complaint.repair_notes;

    await pool.query(
      `UPDATE complaints 
       SET status = ?, repair_notes = ?, resolved_at = COALESCE(?, resolved_at)
       WHERE id = ?`,
      [status, mergedRepairNotes, resolvedAt, id]
    );

    // If resolved, update equipment status to operational if equipment was attached
    if (status === 'Resolved' && complaint.equipment_id) {
      await pool.query('UPDATE equipment SET status = "operational" WHERE id = ?', [complaint.equipment_id]);
    }

    // Add update history
    const logNote = note || (repair_notes ? `Notes: ${repair_notes}` : `Status updated to ${status}`);
    await pool.query(
      `INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, note)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.id, oldStatus, status, logNote]
    );

    // Notify the reporter
    await pool.query(
      'INSERT INTO notifications (user_id, complaint_id, message) VALUES (?, ?, ?)',
      [complaint.user_id, id, `Update on complaint #${complaint.complaint_code}: Status changed from ${oldStatus} to ${status}.`]
    );

    // If updated by technician, notify admin
    if (req.user.role === 'technician') {
      const [admins] = await pool.query('SELECT id FROM users WHERE role = "admin"');
      for (const admin of admins) {
        await pool.query(
          'INSERT INTO notifications (user_id, complaint_id, message) VALUES (?, ?, ?)',
          [admin.id, id, `Technician ${req.user.name} updated complaint #${complaint.complaint_code} to "${status}".`]
        );
      }
    }

    res.json({
      success: true,
      message: `Complaint #${complaint.complaint_code} updated to ${status} successfully.`,
      status,
      repair_notes: mergedRepairNotes
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint status.', error: error.message });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  assignTechnician,
  updateComplaintStatus
};
