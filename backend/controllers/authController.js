const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'campus_techcare_secure_jwt_secret_key_2026_xyz987',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc Register user (Student or Staff)
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const assignedRole = role && ['student', 'staff'].includes(role) ? role : 'student';

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, assignedRole, department || 'General', phone || null]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      department: department || 'General',
      phone: phone || null
    };

    const token = generateToken(newUser);

    // Create a welcome notification
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [newUser.id, `Welcome to Campus TechCare, ${newUser.name}! You can now report equipment issues and track maintenance in real-time.`]
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, department, phone FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    // If technician, check if linked to technicians table
    let technicianDetails = null;
    if (user.role === 'technician') {
      const [techRows] = await pool.query('SELECT * FROM technicians WHERE user_id = ? OR email = ?', [user.id, user.email]);
      if (techRows.length > 0) {
        technicianDetails = techRows[0];
      }
    }

    delete user.password;

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        ...user,
        technician: technicianDetails
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
};

// @desc Get current authenticated user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    let technicianDetails = null;
    if (req.user.role === 'technician') {
      const [techRows] = await pool.query('SELECT * FROM technicians WHERE user_id = ? OR email = ?', [req.user.id, req.user.email]);
      if (techRows.length > 0) {
        technicianDetails = techRows[0];
      }
    }

    res.json({
      success: true,
      user: {
        ...req.user,
        technician: technicianDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile.', error: error.message });
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, department, phone, password } = req.body;
    const userId = req.user.id;

    let updateQuery = 'UPDATE users SET name = ?, department = ?, phone = ?';
    const params = [name || req.user.name, department || req.user.department, phone || req.user.phone];

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(userId);

    await pool.query(updateQuery, params);

    const [updatedRows] = await pool.query('SELECT id, name, email, role, department, phone FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedRows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile.', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
