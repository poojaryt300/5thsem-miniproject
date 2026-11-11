const pool = require('../config/db');

// @desc Get overview statistics
// @route GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const dateParams = [];
    if (startDate) {
      dateFilter += ' AND DATE(created_at) >= ?';
      dateParams.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND DATE(created_at) <= ?';
      dateParams.push(endDate);
    }

    // Complaints counts
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) AS total_complaints,
        COUNT(CASE WHEN status = 'Submitted' THEN 1 END) AS pending_complaints,
        COUNT(CASE WHEN status = 'Assigned' THEN 1 END) AS assigned_complaints,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END) AS in_progress_complaints,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) AS resolved_complaints,
        COUNT(CASE WHEN status = 'Closed' THEN 1 END) AS closed_complaints,
        COUNT(CASE WHEN priority IN ('High', 'Urgent') THEN 1 END) AS high_priority_complaints,
        COUNT(CASE WHEN priority = 'Urgent' THEN 1 END) AS urgent_complaints
      FROM complaints
      WHERE 1=1 ${dateFilter}
    `, dateParams);

    // Total technicians
    const [techCount] = await pool.query('SELECT COUNT(*) AS total_technicians, COUNT(CASE WHEN status="available" THEN 1 END) AS available_technicians FROM technicians');

    // Total rooms & equipment
    const [roomCount] = await pool.query('SELECT COUNT(*) AS total_rooms FROM rooms');
    const [equipCount] = await pool.query('SELECT COUNT(*) AS total_equipment, COUNT(CASE WHEN status="operational" THEN 1 END) AS operational_equipment FROM equipment');

    // Average resolution time in hours
    const [resTime] = await pool.query(`
      SELECT 
        ROUND(AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)), 1) AS avg_resolution_hours
      FROM complaints
      WHERE status IN ('Resolved', 'Closed') AND resolved_at IS NOT NULL ${dateFilter}
    `, dateParams);

    // Overdue complaints (> 48 hours and still pending/assigned)
    const [overdue] = await pool.query(`
      SELECT COUNT(*) AS overdue_count
      FROM complaints
      WHERE status IN ('Submitted', 'Assigned') AND created_at < DATE_SUB(NOW(), INTERVAL 48 HOUR)
    `);

    res.json({
      success: true,
      stats: {
        total: counts[0].total_complaints || 0,
        pending: counts[0].pending_complaints || 0,
        assigned: counts[0].assigned_complaints || 0,
        inProgress: counts[0].in_progress_complaints || 0,
        resolved: counts[0].resolved_complaints || 0,
        closed: counts[0].closed_complaints || 0,
        highPriority: counts[0].high_priority_complaints || 0,
        urgent: counts[0].urgent_complaints || 0,
        totalTechnicians: techCount[0].total_technicians || 0,
        availableTechnicians: techCount[0].available_technicians || 0,
        totalRooms: roomCount[0].total_rooms || 0,
        totalEquipment: equipCount[0].total_equipment || 0,
        operationalEquipment: equipCount[0].operational_equipment || 0,
        avgResolutionHours: resTime[0].avg_resolution_hours || 0,
        overdueComplaints: overdue[0].overdue_count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats.', error: error.message });
  }
};

// @desc Get equipment-wise complaints breakdown
// @route GET /api/dashboard/equipment
const getEquipmentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];
    if (startDate) {
      dateFilter += ' AND DATE(c.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND DATE(c.created_at) <= ?';
      params.push(endDate);
    }

    const [rows] = await pool.query(`
      SELECT 
        COALESCE(e.equipment_type, 'Other') AS equipment_type,
        COUNT(c.id) AS count,
        COUNT(CASE WHEN c.status = 'Resolved' THEN 1 END) AS resolved_count,
        COUNT(CASE WHEN c.status != 'Resolved' THEN 1 END) AS open_count
      FROM complaints c
      LEFT JOIN equipment e ON c.equipment_id = e.id
      WHERE 1=1 ${dateFilter}
      GROUP BY COALESCE(e.equipment_type, 'Other')
      ORDER BY count DESC
    `, params);

    res.json({ success: true, equipmentStats: rows });
  } catch (error) {
    console.error('Error fetching equipment stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch equipment stats.', error: error.message });
  }
};

// @desc Get room and building wise complaints
// @route GET /api/dashboard/rooms
const getRoomStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];
    if (startDate) {
      dateFilter += ' AND DATE(c.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND DATE(c.created_at) <= ?';
      params.push(endDate);
    }

    // By Building
    const [buildingRows] = await pool.query(`
      SELECT 
        r.building,
        COUNT(c.id) AS total_complaints,
        COUNT(CASE WHEN c.status = 'Resolved' THEN 1 END) AS resolved,
        COUNT(CASE WHEN c.status != 'Resolved' THEN 1 END) AS pending
      FROM complaints c
      JOIN rooms r ON c.room_id = r.id
      WHERE 1=1 ${dateFilter}
      GROUP BY r.building
      ORDER BY total_complaints DESC
    `, params);

    // Top rooms with most complaints
    const [roomRows] = await pool.query(`
      SELECT 
        r.room_number,
        r.building,
        r.room_type,
        COUNT(c.id) AS complaints_count
      FROM complaints c
      JOIN rooms r ON c.room_id = r.id
      WHERE 1=1 ${dateFilter}
      GROUP BY r.id
      ORDER BY complaints_count DESC
      LIMIT 10
    `, params);

    res.json({
      success: true,
      buildingStats: buildingRows,
      topRooms: roomRows
    });
  } catch (error) {
    console.error('Error fetching room stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch room stats.', error: error.message });
  }
};

// @desc Get monthly complaints analytics
// @route GET /api/dashboard/monthly
const getMonthlyStats = async (req, res) => {
  try {
    // Generate monthly series for last 6 months
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') AS month,
        DATE_FORMAT(created_at, '%Y-%m') AS month_key,
        COUNT(*) AS total,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) AS resolved,
        COUNT(CASE WHEN status != 'Resolved' THEN 1 END) AS pending
      FROM complaints
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month_key, month
      ORDER BY month_key ASC
    `);

    // Status distribution
    const [statusDist] = await pool.query(`
      SELECT 
        status,
        COUNT(*) AS count
      FROM complaints
      GROUP BY status
    `);

    // Priority distribution
    const [priorityDist] = await pool.query(`
      SELECT 
        priority,
        COUNT(*) AS count
      FROM complaints
      GROUP BY priority
    `);

    res.json({
      success: true,
      monthly: rows,
      statusDistribution: statusDist,
      priorityDistribution: priorityDist
    });
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch monthly stats.', error: error.message });
  }
};

module.exports = {
  getStats,
  getEquipmentStats,
  getRoomStats,
  getMonthlyStats
};
