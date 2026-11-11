const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// @desc Get all technicians with current workload
// @route GET /api/technicians
const getTechnicians = async (req, res) => {
  try {
    const { specialization, status } = req.query;

    let query = `
      SELECT 
        t.*,
        u.id AS user_account_id,
        COUNT(DISTINCT CASE WHEN c.status IN ('Assigned', 'In Progress') THEN c.id END) AS active_tasks_count,
        COUNT(DISTINCT CASE WHEN c.status = 'Resolved' THEN c.id END) AS completed_tasks_count,
        COUNT(DISTINCT c.id) AS total_assigned_tasks
      FROM technicians t
      LEFT JOIN users u ON t.user_id = u.id OR t.email = u.email
      LEFT JOIN complaints c ON t.id = c.technician_id
      WHERE 1=1
    `;

    const params = [];
    if (specialization && specialization !== 'All') {
      query += ' AND t.specialization = ?';
      params.push(specialization);
    }
    if (status && status !== 'All') {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' GROUP BY t.id ORDER BY t.name ASC';

    const [technicians] = await pool.query(query, params);

    res.json({ success: true, count: technicians.length, technicians });
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch technicians.', error: error.message });
  }
};

// @desc Create new technician and optional login account
// @route POST /api/technicians
const createTechnician = async (req, res) => {
  try {
    const { name, email, phone, specialization, status, create_login, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    // Check if technician email exists
    const [existing] = await pool.query('SELECT id FROM technicians WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A technician with this email already exists.' });
    }

    let userId = null;

    // If create_login is requested or default password provided, create/link user
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUser.length > 0) {
      userId = existingUser[0].id;
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || 'Tech@123', salt);
      const [userResult] = await pool.query(
        'INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, "technician", ?, ?)',
        [name.trim(), email.trim().toLowerCase(), hashedPassword, specialization || 'Campus Maintenance', phone || null]
      );
      userId = userResult.insertId;
    }

    const [techResult] = await pool.query(
      'INSERT INTO technicians (user_id, name, email, phone, specialization, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name.trim(), email.trim().toLowerCase(), phone || null, specialization || 'General Maintenance', status || 'available']
    );

    res.status(201).json({
      success: true,
      message: 'Technician created successfully!',
      technician: {
        id: techResult.insertId,
        user_id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone,
        specialization: specialization || 'General Maintenance',
        status: status || 'available'
      }
    });
  } catch (error) {
    console.error('Error creating technician:', error);
    res.status(500).json({ success: false, message: 'Failed to create technician.', error: error.message });
  }
};

// @desc Update technician
// @route PUT /api/technicians/:id
const updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM technicians WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Technician not found.' });
    }

    await pool.query(
      'UPDATE technicians SET name = ?, email = ?, phone = ?, specialization = ?, status = ? WHERE id = ?',
      [
        name || existing[0].name,
        email || existing[0].email,
        phone || existing[0].phone,
        specialization || existing[0].specialization,
        status || existing[0].status,
        id
      ]
    );

    // If technician has a user_id, keep user profile updated in sync
    if (existing[0].user_id) {
      await pool.query(
        'UPDATE users SET name = ?, phone = ?, department = ? WHERE id = ?',
        [name || existing[0].name, phone || existing[0].phone, specialization || existing[0].specialization, existing[0].user_id]
      );
    }

    res.json({ success: true, message: 'Technician details updated successfully!' });
  } catch (error) {
    console.error('Error updating technician:', error);
    res.status(500).json({ success: false, message: 'Failed to update technician.', error: error.message });
  }
};

// @desc Delete technician
// @route DELETE /api/technicians/:id
const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if technician has active complaints
    const [active] = await pool.query(
      'SELECT COUNT(*) as count FROM complaints WHERE technician_id = ? AND status IN ("Assigned", "In Progress")',
      [id]
    );

    if (active[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete technician: ${active[0].count} complaint(s) are actively assigned. Reassign them first.`
      });
    }

    await pool.query('DELETE FROM technicians WHERE id = ?', [id]);
    res.json({ success: true, message: 'Technician deleted successfully.' });
  } catch (error) {
    console.error('Error deleting technician:', error);
    res.status(500).json({ success: false, message: 'Failed to delete technician.', error: error.message });
  }
};

// @desc Get tasks assigned to logged-in technician
// @route GET /api/technicians/my-tasks
const getMyTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    // Find technician record by user_id or email
    const [techRows] = await pool.query('SELECT * FROM technicians WHERE user_id = ? OR email = ?', [req.user.id, req.user.email]);
    if (techRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Technician profile not found for this user account.' });
    }

    const tech = techRows[0];

    let query = `
      SELECT 
        c.*,
        u.name AS reporter_name,
        u.email AS reporter_email,
        u.phone AS reporter_phone,
        u.role AS reporter_role,
        r.building,
        r.room_number,
        r.room_type,
        e.equipment_name,
        e.equipment_type
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      JOIN rooms r ON c.room_id = r.id
      LEFT JOIN equipment e ON c.equipment_id = e.id
      WHERE c.technician_id = ?
    `;

    const params = [tech.id];

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

    query += ' ORDER BY FIELD(c.priority, "Urgent", "High", "Medium", "Low"), c.created_at DESC';

    const [tasks] = await pool.query(query, params);

    // Compute task counts
    const pendingTasks = tasks.filter(t => t.status === 'Assigned').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const resolvedTasks = tasks.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

    res.json({
      success: true,
      technician: tech,
      stats: {
        total: tasks.length,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        resolved: resolvedTasks
      },
      tasks
    });
  } catch (error) {
    console.error('Error fetching technician tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch technician tasks.', error: error.message });
  }
};

module.exports = {
  getTechnicians,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  getMyTasks
};
