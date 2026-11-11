const pool = require('../config/db');

// @desc Get all equipment, optionally filtered by room_id or type
// @route GET /api/equipment
const getEquipment = async (req, res) => {
  try {
    const { room_id, equipment_type, status } = req.query;

    let query = `
      SELECT 
        e.*,
        r.building,
        r.room_number,
        r.room_type,
        COUNT(DISTINCT CASE WHEN c.status IN ('Submitted', 'Assigned', 'In Progress') THEN c.id END) AS active_complaints_count
      FROM equipment e
      JOIN rooms r ON e.room_id = r.id
      LEFT JOIN complaints c ON e.id = c.equipment_id
      WHERE 1=1
    `;

    const params = [];
    if (room_id && room_id !== 'All') {
      query += ' AND e.room_id = ?';
      params.push(parseInt(room_id, 10));
    }
    if (equipment_type && equipment_type !== 'All') {
      query += ' AND e.equipment_type = ?';
      params.push(equipment_type);
    }
    if (status && status !== 'All') {
      query += ' AND e.status = ?';
      params.push(status);
    }

    query += ' GROUP BY e.id ORDER BY r.building ASC, r.room_number ASC, e.equipment_name ASC';

    const [equipmentList] = await pool.query(query, params);

    res.json({ success: true, count: equipmentList.length, equipment: equipmentList });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch equipment.', error: error.message });
  }
};

// @desc Create equipment in a room
// @route POST /api/equipment
const createEquipment = async (req, res) => {
  try {
    const { room_id, equipment_type, equipment_name, status } = req.body;

    if (!room_id || !equipment_type || !equipment_name) {
      return res.status(400).json({ success: false, message: 'Room ID, equipment type, and name are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO equipment (room_id, equipment_type, equipment_name, status) VALUES (?, ?, ?, ?)',
      [parseInt(room_id, 10), equipment_type, equipment_name.trim(), status || 'operational']
    );

    res.status(201).json({
      success: true,
      message: 'Equipment added successfully!',
      equipment: {
        id: result.insertId,
        room_id,
        equipment_type,
        equipment_name,
        status: status || 'operational'
      }
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ success: false, message: 'Failed to add equipment.', error: error.message });
  }
};

// @desc Update equipment
// @route PUT /api/equipment/:id
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_id, equipment_type, equipment_name, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM equipment WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    await pool.query(
      'UPDATE equipment SET room_id = ?, equipment_type = ?, equipment_name = ?, status = ? WHERE id = ?',
      [
        room_id || existing[0].room_id,
        equipment_type || existing[0].equipment_type,
        equipment_name || existing[0].equipment_name,
        status || existing[0].status,
        id
      ]
    );

    res.json({ success: true, message: 'Equipment updated successfully!' });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ success: false, message: 'Failed to update equipment.', error: error.message });
  }
};

// @desc Delete equipment
// @route DELETE /api/equipment/:id
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM equipment WHERE id = ?', [id]);
    res.json({ success: true, message: 'Equipment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete equipment.', error: error.message });
  }
};

module.exports = {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
