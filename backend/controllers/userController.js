const pool = require('../config/db');

// @desc Get all users for admin management
// @route GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.department,
        u.phone,
        u.created_at,
        COUNT(DISTINCT c.id) AS total_complaints_reported
      FROM users u
      LEFT JOIN complaints c ON u.id = c.user_id
      WHERE 1=1
    `;

    const params = [];
    if (role && role !== 'All') {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (search && search.trim() !== '') {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.department LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC';

    const [users] = await pool.query(query, params);

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users.', error: error.message });
  }
};

// @desc Delete user (Admin only)
// @route DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user.', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser
};
