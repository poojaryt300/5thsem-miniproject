const QRCode = require('qrcode');
const pool = require('../config/db');

// @desc Get all rooms
// @route GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const { building, room_type } = req.query;

    let query = `
      SELECT 
        r.*,
        COUNT(DISTINCT e.id) AS equipment_count,
        COUNT(DISTINCT CASE WHEN c.status IN ('Submitted', 'Assigned', 'In Progress') THEN c.id END) AS active_complaints_count
      FROM rooms r
      LEFT JOIN equipment e ON r.id = e.room_id
      LEFT JOIN complaints c ON r.id = c.room_id
      WHERE 1=1
    `;

    const params = [];
    if (building && building !== 'All') {
      query += ' AND r.building = ?';
      params.push(building);
    }
    if (room_type && room_type !== 'All') {
      query += ' AND r.room_type = ?';
      params.push(room_type);
    }

    query += ' GROUP BY r.id ORDER BY r.building ASC, r.room_number ASC';

    const [rooms] = await pool.query(query, params);

    res.json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms.', error: error.message });
  }
};

// @desc Get room by ID with all equipment
// @route GET /api/rooms/:id
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const [roomRows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (roomRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    const room = roomRows[0];

    // Fetch equipment in this room
    const [equipment] = await pool.query('SELECT * FROM equipment WHERE room_id = ? ORDER BY equipment_name ASC', [id]);

    // Generate or ensure QR code image data URL
    let qrDataUrl = '';
    const qrPayload = JSON.stringify({
      app: 'CampusTechCare',
      roomId: room.id,
      building: room.building,
      roomNumber: room.room_number,
      code: room.qr_code || `CTC-ROOM-${room.id}`
    });

    try {
      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 300,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
    } catch (qrErr) {
      console.error('QR code generation error:', qrErr);
    }

    res.json({
      success: true,
      room: {
        ...room,
        qr_image_url: qrDataUrl,
        equipment
      }
    });
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve room details.', error: error.message });
  }
};

// @desc Create a new room
// @route POST /api/rooms
const createRoom = async (req, res) => {
  try {
    const { building, room_number, room_type } = req.body;

    if (!building || !room_number) {
      return res.status(400).json({ success: false, message: 'Building and room number are required.' });
    }

    // Check duplicate
    const [existing] = await pool.query(
      'SELECT id FROM rooms WHERE building = ? AND room_number = ?',
      [building.trim(), room_number.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'This room already exists in this building.' });
    }

    const safeRoomCode = `CTC-${building.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}-${room_number.replace(/[^a-zA-Z0-9]/g, '')}`;

    const [result] = await pool.query(
      'INSERT INTO rooms (building, room_number, room_type, qr_code) VALUES (?, ?, ?, ?)',
      [building.trim(), room_number.trim(), room_type || 'classroom', safeRoomCode]
    );

    const roomId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Room created successfully!',
      room: {
        id: roomId,
        building: building.trim(),
        room_number: room_number.trim(),
        room_type: room_type || 'classroom',
        qr_code: safeRoomCode
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Failed to create room.', error: error.message });
  }
};

// @desc Update room
// @route PUT /api/rooms/:id
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { building, room_number, room_type } = req.body;

    const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    await pool.query(
      'UPDATE rooms SET building = ?, room_number = ?, room_type = ? WHERE id = ?',
      [building || existing[0].building, room_number || existing[0].room_number, room_type || existing[0].room_type, id]
    );

    res.json({ success: true, message: 'Room updated successfully!' });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ success: false, message: 'Failed to update room.', error: error.message });
  }
};

// @desc Delete room
// @route DELETE /api/rooms/:id
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ success: true, message: 'Room deleted successfully.' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: 'Failed to delete room.', error: error.message });
  }
};

// @desc Get distinct building list
// @route GET /api/rooms/buildings
const getBuildings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT building FROM rooms ORDER BY building ASC');
    const buildings = rows.map(r => r.building);
    res.json({ success: true, buildings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch buildings.', error: error.message });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getBuildings
};
