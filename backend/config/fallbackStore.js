const bcrypt = require('bcryptjs');

// Precomputed bcrypt hashes for instant startup
// Admin@123, Student@123, Staff@123, Tech@123
const ADMIN_HASH = '$2a$10$8.4nYsAPUZUPLLdJmHRaGe0tDYpeZHQ2HvPPOF3acy80.K.hVIpDa';
const STUDENT_HASH = '$2a$10$8.4nYsAPUZUPLLdJmHRaGeU2j5S0I7oksj7Igk7Zx5fm6IGq4rhZa';
const STAFF_HASH = '$2a$10$8.4nYsAPUZUPLLdJmHRaGeRqvy0TTYnZYbfqwfptVXG7ThzmD/TrS';
const TECH_HASH = '$2a$10$8.4nYsAPUZUPLLdJmHRaGesDd/Zirv7LY8Ge8jBVej33LMW5NOkry';

class FallbackStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = [
      { id: 1, name: 'System Administrator', email: 'admin@campus.edu', password: ADMIN_HASH, role: 'admin', department: 'Campus Administration', phone: '+91 98765 43210', created_at: new Date('2026-01-01') },
      { id: 2, name: 'Alex Johnson (Student)', email: 'student@campus.edu', password: STUDENT_HASH, role: 'student', department: 'Computer Science & Engg', phone: '+91 98765 11111', created_at: new Date('2026-01-02') },
      { id: 3, name: 'Dr. Robert Vance (Staff)', email: 'staff@campus.edu', password: STAFF_HASH, role: 'staff', department: 'Electrical & Electronics', phone: '+91 98765 22222', created_at: new Date('2026-01-03') },
      { id: 4, name: 'Vikram Sharma (Electrician)', email: 'tech.electric@campus.edu', password: TECH_HASH, role: 'technician', department: 'Campus Electrical Works', phone: '+91 98765 33333', created_at: new Date('2026-01-04') },
      { id: 5, name: 'Suresh Patel (IT Specialist)', email: 'tech.network@campus.edu', password: TECH_HASH, role: 'technician', department: 'Hardware & Networking', phone: '+91 98765 44444', created_at: new Date('2026-01-05') },
      { id: 6, name: 'Ramesh Kumar (HVAC Expert)', email: 'tech.ac@campus.edu', password: TECH_HASH, role: 'technician', department: 'Air Conditioning & Cooling', phone: '+91 98765 55555', created_at: new Date('2026-01-06') },
      { id: 7, name: 'Sneha Reddy (Student)', email: 'sneha@campus.edu', password: STUDENT_HASH, role: 'student', department: 'Information Technology', phone: '+91 98765 66666', created_at: new Date('2026-01-07') }
    ];

    this.rooms = [
      { id: 1, building: 'Aryabhata Block (CS & IT)', room_number: 'Room 101', room_type: 'lab', qr_code: 'CTC-ROOM-ARYA-101', created_at: new Date('2026-01-01') },
      { id: 2, building: 'Aryabhata Block (CS & IT)', room_number: 'Room 204', room_type: 'classroom', qr_code: 'CTC-ROOM-ARYA-204', created_at: new Date('2026-01-01') },
      { id: 3, building: 'Aryabhata Block (CS & IT)', room_number: 'Staff Room 201', room_type: 'staff_room', qr_code: 'CTC-ROOM-ARYA-SR201', created_at: new Date('2026-01-01') },
      { id: 4, building: 'Kalam Science Block', room_number: 'Room 302', room_type: 'classroom', qr_code: 'CTC-ROOM-KLM-302', created_at: new Date('2026-01-01') },
      { id: 5, building: 'Kalam Science Block', room_number: 'Staff Room 102', room_type: 'staff_room', qr_code: 'CTC-ROOM-KLM-SR102', created_at: new Date('2026-01-01') },
      { id: 6, building: 'Ramanujan Engineering Block', room_number: 'Room 405', room_type: 'seminar_hall', qr_code: 'CTC-ROOM-RAM-405', created_at: new Date('2026-01-01') },
      { id: 7, building: 'Ramanujan Engineering Block', room_number: 'Room 108', room_type: 'lab', qr_code: 'CTC-ROOM-RAM-108', created_at: new Date('2026-01-01') }
    ];

    this.technicians = [
      { id: 1, user_id: 4, name: 'Vikram Sharma', email: 'tech.electric@campus.edu', phone: '+91 98765 33333', specialization: 'Electrical', status: 'available', created_at: new Date('2026-01-01') },
      { id: 2, user_id: 5, name: 'Suresh Patel', email: 'tech.network@campus.edu', phone: '+91 98765 44444', specialization: 'IT & Computer', status: 'busy', created_at: new Date('2026-01-01') },
      { id: 3, user_id: 6, name: 'Ramesh Kumar', email: 'tech.ac@campus.edu', phone: '+91 98765 55555', specialization: 'HVAC & AC', status: 'available', created_at: new Date('2026-01-01') }
    ];

    this.equipment = [
      { id: 1, room_id: 1, equipment_type: 'PC', equipment_name: 'Dell OptiPlex 7090 - PC-01', status: 'operational', created_at: new Date('2026-01-01') },
      { id: 2, room_id: 1, equipment_type: 'PC', equipment_name: 'Dell OptiPlex 7090 - PC-14', status: 'needs_maintenance', created_at: new Date('2026-01-01') },
      { id: 3, room_id: 1, equipment_type: 'Projector', equipment_name: 'Epson Full HD Projector 4K', status: 'operational', created_at: new Date('2026-01-01') },
      { id: 4, room_id: 1, equipment_type: 'AC', equipment_name: 'Voltas 2-Ton Inverter AC (North)', status: 'operational', created_at: new Date('2026-01-01') },
      { id: 5, room_id: 1, equipment_type: 'Switch', equipment_name: 'Main Power Distribution Box', status: 'operational', created_at: new Date('2026-01-01') },
      { id: 6, room_id: 2, equipment_type: 'Projector', equipment_name: 'BenQ Smart Projector PJ-204', status: 'needs_maintenance', created_at: new Date('2026-01-01') },
      { id: 7, room_id: 2, equipment_type: 'Fan', equipment_name: 'Havells High-Speed Ceiling Fan #2', status: 'needs_maintenance', created_at: new Date('2026-01-01') },
      { id: 8, room_id: 2, equipment_type: 'Light', equipment_name: 'Philips 36W LED Tube Light #4', status: 'needs_maintenance', created_at: new Date('2026-01-01') },
      { id: 9, room_id: 2, equipment_type: 'Wi-Fi', equipment_name: 'Cisco Catalyst AP 9120AX', status: 'operational', created_at: new Date('2026-01-01') },
      { id: 10, room_id: 3, equipment_type: 'AC', equipment_name: 'Daikin Dual Inverter 1.5-Ton', status: 'needs_maintenance', created_at: new Date('2026-01-01') },
      { id: 11, room_id: 3, equipment_type: 'Light', equipment_name: 'Philips Recessed Ceiling Panel', status: 'operational', created_at: new Date('2026-01-01') },
      { id: 12, room_id: 4, equipment_type: 'PC', equipment_name: 'HP EliteDesk Workstation 03', status: 'operational', created_at: new Date('2026-01-01') },
      { id: 13, room_id: 4, equipment_type: 'Wi-Fi', equipment_name: 'Aruba AP-535 Campus Access Point', status: 'under_repair', created_at: new Date('2026-01-01') },
      { id: 14, room_id: 6, equipment_type: 'Projector', equipment_name: 'Sony Laser 4K Seminar Projector', status: 'operational', created_at: new Date('2026-01-01') },
      { id: 15, room_id: 6, equipment_type: 'AC', equipment_name: 'Carrier Central Chiller Unit', status: 'operational', created_at: new Date('2026-01-01') }
    ];

    const now = new Date();
    this.complaints = [
      {
        id: 1,
        complaint_code: 'CTC-2026-1001',
        user_id: 2,
        room_id: 2,
        equipment_id: 7,
        problem_type: 'Fan not working',
        description: 'Ceiling fan #2 in Room 204 is making loud humming noise and has stopped rotating completely during morning lectures.',
        priority: 'High',
        status: 'In Progress',
        technician_id: 1,
        repair_notes: 'Technician inspected the motor and capacitor. Replacing the 3.15uF capacitor.',
        photo_url: null,
        resolved_at: null,
        created_at: new Date(now.getTime() - 2 * 86400000)
      },
      {
        id: 2,
        complaint_code: 'CTC-2026-1002',
        user_id: 3,
        room_id: 3,
        equipment_id: 10,
        problem_type: 'AC problems',
        description: 'Staff Room AC is blowing room temperature air instead of cooling. Display shows error code E4 (Refrigerant pressure low).',
        priority: 'Urgent',
        status: 'Assigned',
        technician_id: 3,
        repair_notes: 'Assigned to Ramesh Kumar for gas pressure top-up and coil check.',
        photo_url: null,
        resolved_at: null,
        created_at: new Date(now.getTime() - 1 * 86400000)
      },
      {
        id: 3,
        complaint_code: 'CTC-2026-1003',
        user_id: 2,
        room_id: 1,
        equipment_id: 2,
        problem_type: 'Computers and PCs not working',
        description: 'PC-14 in CS Lab 1 fails to boot into Windows. Solid amber light on motherboard, possibly faulty RAM stick or power supply.',
        priority: 'Medium',
        status: 'Submitted',
        technician_id: null,
        repair_notes: null,
        photo_url: null,
        resolved_at: null,
        created_at: new Date(now.getTime() - 4 * 3600000)
      },
      {
        id: 4,
        complaint_code: 'CTC-2026-1004',
        user_id: 3,
        room_id: 4,
        equipment_id: 13,
        problem_type: 'Wi-Fi and network problems',
        description: 'Campus Wi-Fi connectivity drops every 5 minutes in Kalam Room 302. Students cannot access online assessment portal.',
        priority: 'High',
        status: 'Assigned',
        technician_id: 2,
        repair_notes: 'Suresh Patel investigating switch port connectivity and PoE injector.',
        photo_url: null,
        resolved_at: null,
        created_at: new Date(now.getTime() - 18 * 3600000)
      },
      {
        id: 5,
        complaint_code: 'CTC-2026-1005',
        user_id: 7,
        room_id: 2,
        equipment_id: 8,
        problem_type: 'Lights not working',
        description: 'LED Tube Light #4 flickering violently near the whiteboard, causing severe glare and headache for students.',
        priority: 'Low',
        status: 'Resolved',
        technician_id: 1,
        repair_notes: 'Replaced faulty electronic ballast and fitted fresh 36W LED tube. Verified illumination.',
        photo_url: null,
        resolved_at: new Date(now.getTime() - 1 * 86400000),
        created_at: new Date(now.getTime() - 3 * 86400000)
      }
    ];

    this.complaint_updates = [
      { id: 1, complaint_id: 1, updated_by: 2, old_status: null, new_status: 'Submitted', note: 'Complaint submitted by Alex Johnson', created_at: new Date(now.getTime() - 2 * 86400000) },
      { id: 2, complaint_id: 1, updated_by: 1, old_status: 'Submitted', new_status: 'Assigned', note: 'Assigned to Technician Vikram Sharma', created_at: new Date(now.getTime() - 1 * 86400000) },
      { id: 3, complaint_id: 1, updated_by: 4, old_status: 'Assigned', new_status: 'In Progress', note: 'Technician started inspection and testing capacitor.', created_at: new Date(now.getTime() - 6 * 3600000) },
      { id: 4, complaint_id: 2, updated_by: 3, old_status: null, new_status: 'Submitted', note: 'Complaint registered by Dr. Robert Vance', created_at: new Date(now.getTime() - 1 * 86400000) },
      { id: 5, complaint_id: 2, updated_by: 1, old_status: 'Submitted', new_status: 'Assigned', note: 'Assigned to HVAC technician Ramesh Kumar', created_at: new Date(now.getTime() - 12 * 3600000) },
      { id: 6, complaint_id: 3, updated_by: 2, old_status: null, new_status: 'Submitted', note: 'Complaint submitted by Alex Johnson for Lab 1 PC-14', created_at: new Date(now.getTime() - 4 * 3600000) },
      { id: 7, complaint_id: 4, updated_by: 3, old_status: null, new_status: 'Submitted', note: 'Complaint registered by Staff Dr. Robert Vance', created_at: new Date(now.getTime() - 18 * 3600000) },
      { id: 8, complaint_id: 4, updated_by: 1, old_status: 'Submitted', new_status: 'Assigned', note: 'Assigned to Suresh Patel (Networking)', created_at: new Date(now.getTime() - 10 * 3600000) },
      { id: 9, complaint_id: 5, updated_by: 7, old_status: null, new_status: 'Submitted', note: 'Complaint submitted by Sneha Reddy', created_at: new Date(now.getTime() - 3 * 86400000) },
      { id: 10, complaint_id: 5, updated_by: 1, old_status: 'Submitted', new_status: 'Assigned', note: 'Assigned to Vikram Sharma', created_at: new Date(now.getTime() - 2 * 86400000) },
      { id: 11, complaint_id: 5, updated_by: 4, old_status: 'Assigned', new_status: 'In Progress', note: 'Began replacement of ballast and tube', created_at: new Date(now.getTime() - 1 * 86400000) },
      { id: 12, complaint_id: 5, updated_by: 4, old_status: 'In Progress', new_status: 'Resolved', note: 'Replacement complete and tested successfully.', created_at: new Date(now.getTime() - 1 * 86400000) }
    ];

    this.notifications = [
      { id: 1, user_id: 1, complaint_id: 3, message: 'New complaint #CTC-2026-1003 reported for CS Lab 1 (PC-14).', is_read: 0, created_at: new Date(now.getTime() - 4 * 3600000) },
      { id: 2, user_id: 2, complaint_id: 1, message: 'Your complaint #CTC-2026-1001 status changed to In Progress.', is_read: 0, created_at: new Date(now.getTime() - 6 * 3600000) },
      { id: 3, user_id: 4, complaint_id: 1, message: 'You have been assigned complaint #CTC-2026-1001 (Aryabhata Room 204 - Fan).', is_read: 1, created_at: new Date(now.getTime() - 1 * 86400000) },
      { id: 4, user_id: 3, complaint_id: 2, message: 'Technician Ramesh Kumar assigned to your complaint #CTC-2026-1002.', is_read: 0, created_at: new Date(now.getTime() - 12 * 3600000) },
      { id: 5, user_id: 7, complaint_id: 5, message: 'Your complaint #CTC-2026-1005 (Room 204 Light) has been Resolved!', is_read: 1, created_at: new Date(now.getTime() - 1 * 86400000) }
    ];

    this.nextIds = {
      users: 8,
      rooms: 8,
      technicians: 4,
      equipment: 16,
      complaints: 6,
      complaint_updates: 13,
      notifications: 6
    };
  }

  enrichComplaint(c) {
    const room = this.rooms.find(r => r.id === c.room_id) || {};
    const equip = this.equipment.find(e => e.id === c.equipment_id) || {};
    const tech = this.technicians.find(t => t.id === c.technician_id) || {};
    const reporter = this.users.find(u => u.id === c.user_id) || {};

    return {
      ...c,
      reporter_name: reporter.name,
      reporter_email: reporter.email,
      reporter_role: reporter.role,
      reporter_department: reporter.department,
      reporter_phone: reporter.phone,
      building: room.building,
      room_number: room.room_number,
      room_type: room.room_type,
      qr_code: room.qr_code,
      equipment_name: equip.equipment_name,
      equipment_type: equip.equipment_type,
      technician_name: tech.name,
      technician_email: tech.email,
      technician_phone: tech.phone,
      technician_specialization: tech.specialization
    };
  }

  async query(sql, params = []) {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');
    const lower = cleanSql.toLowerCase();

    // 1. SELECT COUNT FROM users
    if (lower.startsWith('select count(*) as count from users')) {
      return [[{ count: this.users.length }]];
    }

    // 2. SELECT id FROM users WHERE email = ?
    if (lower.startsWith('select id from users where email = ?')) {
      const email = String(params[0] || '').toLowerCase().trim();
      const match = this.users.filter(u => u.email.toLowerCase() === email);
      return [match.map(u => ({ id: u.id }))];
    }

    // 3. SELECT id, name, email, password, role, department, phone FROM users WHERE email = ?
    if (lower.includes('from users where email = ?')) {
      const email = String(params[0] || '').toLowerCase().trim();
      const match = this.users.filter(u => u.email.toLowerCase() === email);
      return [match.map(u => ({ ...u }))];
    }

    // 4. SELECT id, name, email, role, department, phone FROM users WHERE id = ?
    if (lower.includes('from users where id = ?')) {
      const id = parseInt(params[0], 10);
      const match = this.users.filter(u => u.id === id);
      return [match.map(u => ({ ...u }))];
    }

    // 5. SELECT id FROM users WHERE role = "admin"
    if (lower.includes('from users where role =') && lower.includes('admin')) {
      const match = this.users.filter(u => u.role === 'admin');
      return [match.map(u => ({ id: u.id }))];
    }

    // 6. Users directory for admin
    if (lower.startsWith('select u.id, u.name, u.email, u.role, u.department, u.phone, u.created_at')) {
      let list = this.users.map(u => ({
        ...u,
        total_complaints_reported: this.complaints.filter(c => c.user_id === u.id).length
      }));
      // Check filters
      for (const p of params) {
        if (p && !String(p).includes('%')) {
          list = list.filter(u => u.role === p);
        } else if (p && String(p).includes('%')) {
          const s = String(p).replace(/%/g, '').toLowerCase();
          list = list.filter(u => (u.name && u.name.toLowerCase().includes(s)) || (u.email && u.email.toLowerCase().includes(s)));
        }
      }
      return [list];
    }

    // 7. Technicians lookup
    if (lower.includes('from technicians where user_id = ? or email = ?')) {
      const uId = parseInt(params[0], 10);
      const email = String(params[1] || '').toLowerCase();
      const match = this.technicians.filter(t => t.user_id === uId || (t.email && t.email.toLowerCase() === email));
      return [match.map(t => ({ ...t }))];
    }

    if (lower.includes('from technicians where id = ?')) {
      const id = parseInt(params[0], 10);
      const match = this.technicians.filter(t => t.id === id);
      return [match.map(t => ({ ...t }))];
    }

    if (lower.includes('from technicians where email = ?')) {
      const email = String(params[0] || '').toLowerCase();
      const match = this.technicians.filter(t => t.email && t.email.toLowerCase() === email);
      return [match.map(t => ({ ...t }))];
    }

    if (lower.startsWith('select t.*, u.id as user_account_id')) {
      let list = this.technicians.map(t => {
        const u = this.users.find(usr => usr.id === t.user_id || usr.email === t.email);
        const assigned = this.complaints.filter(c => c.technician_id === t.id);
        return {
          ...t,
          user_account_id: u ? u.id : null,
          active_tasks_count: assigned.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length,
          completed_tasks_count: assigned.filter(c => c.status === 'Resolved').length,
          total_assigned_tasks: assigned.length
        };
      });
      return [list];
    }

    // 8. Complaints queries
    if (lower.includes('from complaints where complaint_code = ?')) {
      const code = params[0];
      const match = this.complaints.filter(c => c.complaint_code === code);
      return [match.map(c => ({ id: c.id }))];
    }

    if (lower.includes('from complaints where id = ?')) {
      const id = parseInt(params[0], 10);
      const match = this.complaints.filter(c => c.id === id);
      return [match.map(c => ({ ...c }))];
    }

    // Single complaint with full details (getComplaintById)
    if (lower.startsWith('select c.*, u.name as reporter_name') && lower.includes('where c.id = ?')) {
      const id = parseInt(params[0], 10);
      const comp = this.complaints.find(c => c.id === id);
      if (!comp) return [[]];
      return [[this.enrichComplaint(comp)]];
    }

    // User's own complaints (getMyComplaints)
    if (lower.includes('where c.user_id = ?')) {
      const userId = parseInt(params[0], 10);
      let list = this.complaints.filter(c => c.user_id === userId).map(c => this.enrichComplaint(c));
      return [list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))];
    }

    // Technician assigned tasks (getMyTasks)
    if (lower.includes('where c.technician_id = ?')) {
      const techId = parseInt(params[0], 10);
      let list = this.complaints.filter(c => c.technician_id === techId).map(c => this.enrichComplaint(c));
      return [list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))];
    }

    // All complaints (Admin)
    if (lower.startsWith('select c.*, u.name as reporter_name')) {
      let list = this.complaints.map(c => this.enrichComplaint(c));
      return [list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))];
    }

    // Complaint updates / history
    if (lower.includes('from complaint_updates cu') && lower.includes('where cu.complaint_id = ?')) {
      const id = parseInt(params[0], 10);
      const list = this.complaint_updates
        .filter(cu => cu.complaint_id === id)
        .map(cu => {
          const u = this.users.find(usr => usr.id === cu.updated_by) || {};
          return {
            ...cu,
            updated_by_name: u.name || 'System',
            updated_by_role: u.role || 'admin'
          };
        });
      return [list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))];
    }

    // 9. Rooms queries
    if (lower.startsWith('select distinct building from rooms')) {
      const bldgs = [...new Set(this.rooms.map(r => r.building))].sort();
      return [bldgs.map(b => ({ building: b }))];
    }

    if (lower.includes('from rooms where id = ?')) {
      const id = parseInt(params[0], 10);
      const match = this.rooms.filter(r => r.id === id);
      return [match.map(r => ({ ...r }))];
    }

    if (lower.includes('from rooms where building = ? and room_number = ?')) {
      const bldg = params[0];
      const rNum = params[1];
      const match = this.rooms.filter(r => r.building === bldg && r.room_number === rNum);
      return [match.map(r => ({ id: r.id }))];
    }

    if (lower.startsWith('select r.*, count(distinct e.id) as equipment_count')) {
      let list = this.rooms.map(r => ({
        ...r,
        equipment_count: this.equipment.filter(e => e.room_id === r.id).length,
        active_complaints_count: this.complaints.filter(c => c.room_id === r.id && ['Submitted', 'Assigned', 'In Progress'].includes(c.status)).length
      }));
      return [list];
    }

    // 10. Equipment queries
    if (lower.includes('from equipment where id = ?')) {
      const id = parseInt(params[0], 10);
      const match = this.equipment.filter(e => e.id === id);
      return [match.map(e => ({ ...e }))];
    }

    if (lower.includes('from equipment where room_id = ?')) {
      const roomId = parseInt(params[0], 10);
      const match = this.equipment.filter(e => e.room_id === roomId);
      return [match.map(e => ({ ...e }))];
    }

    if (lower.startsWith('select e.*, r.building, r.room_number')) {
      let list = this.equipment.map(e => {
        const r = this.rooms.find(rm => rm.id === e.room_id) || {};
        return {
          ...e,
          building: r.building,
          room_number: r.room_number,
          room_type: r.room_type,
          active_complaints_count: this.complaints.filter(c => c.equipment_id === e.id && ['Submitted', 'Assigned', 'In Progress'].includes(c.status)).length
        };
      });
      if (params.length > 0 && typeof params[0] === 'number') {
        list = list.filter(e => e.room_id === params[0]);
      }
      return [list];
    }

    // 11. Notifications queries
    if (lower.startsWith('select n.*, c.complaint_code')) {
      const userId = parseInt(params[0], 10);
      const list = this.notifications
        .filter(n => n.user_id === userId)
        .map(n => {
          const c = this.complaints.find(cmp => cmp.id === n.complaint_id) || {};
          return {
            ...n,
            complaint_code: c.complaint_code,
            complaint_status: c.status
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [list];
    }

    if (lower.includes('select count(*) as unread from notifications where user_id = ?')) {
      const userId = parseInt(params[0], 10);
      const count = this.notifications.filter(n => n.user_id === userId && !n.is_read).length;
      return [[{ unread: count }]];
    }

    // 12. Dashboard Stats
    if (lower.includes('count(*) as total_complaints')) {
      const total = this.complaints.length;
      const pending = this.complaints.filter(c => c.status === 'Submitted').length;
      const assigned = this.complaints.filter(c => c.status === 'Assigned').length;
      const inProg = this.complaints.filter(c => c.status === 'In Progress').length;
      const resolved = this.complaints.filter(c => c.status === 'Resolved').length;
      const closed = this.complaints.filter(c => c.status === 'Closed').length;
      const high = this.complaints.filter(c => ['High', 'Urgent'].includes(c.priority)).length;
      const urgent = this.complaints.filter(c => c.priority === 'Urgent').length;

      return [[{
        total_complaints: total,
        pending_complaints: pending,
        assigned_complaints: assigned,
        in_progress_complaints: inProg,
        resolved_complaints: resolved,
        closed_complaints: closed,
        high_priority_complaints: high,
        urgent_complaints: urgent
      }]];
    }

    if (lower.includes('select count(*) as total_technicians')) {
      return [[{
        total_technicians: this.technicians.length,
        available_technicians: this.technicians.filter(t => t.status === 'available').length
      }]];
    }

    if (lower.includes('select count(*) as total_rooms')) {
      return [[{ total_rooms: this.rooms.length }]];
    }

    if (lower.includes('select count(*) as total_equipment')) {
      return [[{
        total_equipment: this.equipment.length,
        operational_equipment: this.equipment.filter(e => e.status === 'operational').length
      }]];
    }

    if (lower.includes('avg(timestampdiff(hour')) {
      return [[{ avg_resolution_hours: 14.5 }]];
    }

    if (lower.includes('select count(*) as overdue_count')) {
      return [[{ overdue_count: 1 }]];
    }

    // Equipment breakdown for analytics
    if (lower.includes('coalesce(e.equipment_type')) {
      const map = {};
      this.complaints.forEach(c => {
        const e = this.equipment.find(eq => eq.id === c.equipment_id);
        const type = e ? e.equipment_type : 'Other';
        if (!map[type]) map[type] = { equipment_type: type, count: 0, resolved_count: 0, open_count: 0 };
        map[type].count++;
        if (c.status === 'Resolved') map[type].resolved_count++;
        else map[type].open_count++;
      });
      return [Object.values(map)];
    }

    // Building breakdown for analytics
    if (lower.includes('r.building, count(c.id) as total_complaints')) {
      const map = {};
      this.complaints.forEach(c => {
        const r = this.rooms.find(rm => rm.id === c.room_id) || {};
        const b = r.building || 'General';
        if (!map[b]) map[b] = { building: b, total_complaints: 0, resolved: 0, pending: 0 };
        map[b].total_complaints++;
        if (c.status === 'Resolved') map[b].resolved++;
        else map[b].pending++;
      });
      return [Object.values(map)];
    }

    if (lower.includes('r.room_number, r.building, r.room_type, count(c.id) as complaints_count')) {
      const map = {};
      this.complaints.forEach(c => {
        const r = this.rooms.find(rm => rm.id === c.room_id) || {};
        const key = `${r.building}-${r.room_number}`;
        if (!map[key]) map[key] = { room_number: r.room_number, building: r.building, room_type: r.room_type, complaints_count: 0 };
        map[key].complaints_count++;
      });
      return [Object.values(map)];
    }

    // Monthly breakdown for analytics
    if (lower.includes('date_format(created_at, \'%b %y\') as month')) {
      return [[
        { month: 'Oct 2026', month_key: '2026-10', total: 12, resolved: 10, pending: 2 },
        { month: 'Nov 2026', month_key: '2026-11', total: 5, resolved: 1, pending: 4 }
      ]];
    }

    if (lower.includes('select status, count(*) as count from complaints')) {
      const map = {};
      this.complaints.forEach(c => {
        map[c.status] = (map[c.status] || 0) + 1;
      });
      return [Object.entries(map).map(([status, count]) => ({ status, count }))];
    }

    if (lower.includes('select priority, count(*) as count from complaints')) {
      const map = {};
      this.complaints.forEach(c => {
        map[c.priority] = (map[c.priority] || 0) + 1;
      });
      return [Object.entries(map).map(([priority, count]) => ({ priority, count }))];
    }

    // ============================================
    // MUTATIONS (INSERT, UPDATE, DELETE)
    // ============================================

    // INSERT INTO users
    if (lower.startsWith('insert into users')) {
      const id = this.nextIds.users++;
      const [name, email, password, role, department, phone] = params;
      const newUser = { id, name, email, password, role, department, phone, created_at: new Date() };
      this.users.push(newUser);
      return [{ insertId: id }];
    }

    // INSERT INTO complaints
    if (lower.startsWith('insert into complaints')) {
      const id = this.nextIds.complaints++;
      const [complaint_code, user_id, room_id, equipment_id, problem_type, description, photo_url, priority] = params;
      const newComp = {
        id,
        complaint_code,
        user_id,
        room_id,
        equipment_id,
        problem_type,
        description,
        photo_url,
        priority,
        status: 'Submitted',
        technician_id: null,
        repair_notes: null,
        resolved_at: null,
        created_at: new Date()
      };
      this.complaints.unshift(newComp);
      return [{ insertId: id }];
    }

    // INSERT INTO complaint_updates
    if (lower.startsWith('insert into complaint_updates')) {
      const id = this.nextIds.complaint_updates++;
      const [complaint_id, updated_by, old_status, new_status, note] = params;
      this.complaint_updates.push({ id, complaint_id, updated_by, old_status, new_status, note, created_at: new Date() });
      return [{ insertId: id }];
    }

    // INSERT INTO notifications
    if (lower.startsWith('insert into notifications')) {
      const id = this.nextIds.notifications++;
      if (params.length === 2) {
        const [user_id, message] = params;
        this.notifications.unshift({ id, user_id, complaint_id: null, message, is_read: 0, created_at: new Date() });
      } else {
        const [user_id, complaint_id, message] = params;
        this.notifications.unshift({ id, user_id, complaint_id, message, is_read: 0, created_at: new Date() });
      }
      return [{ insertId: id }];
    }

    // INSERT INTO rooms
    if (lower.startsWith('insert into rooms')) {
      const id = this.nextIds.rooms++;
      const [building, room_number, room_type, qr_code] = params;
      this.rooms.push({ id, building, room_number, room_type, qr_code, created_at: new Date() });
      return [{ insertId: id }];
    }

    // INSERT INTO equipment
    if (lower.startsWith('insert into equipment')) {
      const id = this.nextIds.equipment++;
      const [room_id, equipment_type, equipment_name, status] = params;
      this.equipment.push({ id, room_id, equipment_type, equipment_name, status: status || 'operational', created_at: new Date() });
      return [{ insertId: id }];
    }

    // INSERT INTO technicians
    if (lower.startsWith('insert into technicians')) {
      const id = this.nextIds.technicians++;
      const [user_id, name, email, phone, specialization, status] = params;
      this.technicians.push({ id, user_id, name, email, phone, specialization, status: status || 'available', created_at: new Date() });
      return [{ insertId: id }];
    }

    // UPDATE complaints (Assign)
    if (lower.startsWith('update complaints set technician_id = ?, status = ? where id = ?')) {
      const [techId, status, id] = params;
      const comp = this.complaints.find(c => c.id === parseInt(id, 10));
      if (comp) {
        comp.technician_id = parseInt(techId, 10);
        comp.status = status;
      }
      return [{ affectedRows: 1 }];
    }

    // UPDATE complaints (Status & Repair Notes)
    if (lower.startsWith('update complaints set status = ?')) {
      const [status, repair_notes, resolved_at, id] = params;
      const comp = this.complaints.find(c => c.id === parseInt(id, 10));
      if (comp) {
        comp.status = status;
        if (repair_notes) comp.repair_notes = repair_notes;
        if (status === 'Resolved' && !comp.resolved_at) comp.resolved_at = resolved_at || new Date();
      }
      return [{ affectedRows: 1 }];
    }

    // UPDATE equipment
    if (lower.startsWith('update equipment set status = "needs_maintenance" where id = ?')) {
      const id = parseInt(params[0], 10);
      const eq = this.equipment.find(e => e.id === id);
      if (eq) eq.status = 'needs_maintenance';
      return [{ affectedRows: 1 }];
    }

    if (lower.startsWith('update equipment set status = "operational" where id = ?')) {
      const id = parseInt(params[0], 10);
      const eq = this.equipment.find(e => e.id === id);
      if (eq) eq.status = 'operational';
      return [{ affectedRows: 1 }];
    }

    if (lower.startsWith('update equipment set room_id = ?')) {
      const [room_id, equipment_type, equipment_name, status, id] = params;
      const eq = this.equipment.find(e => e.id === parseInt(id, 10));
      if (eq) {
        eq.room_id = parseInt(room_id, 10);
        eq.equipment_type = equipment_type;
        eq.equipment_name = equipment_name;
        eq.status = status;
      }
      return [{ affectedRows: 1 }];
    }

    // UPDATE technicians
    if (lower.startsWith('update technicians set status = "busy" where id = ?')) {
      const id = parseInt(params[0], 10);
      const t = this.technicians.find(tech => tech.id === id);
      if (t) t.status = 'busy';
      return [{ affectedRows: 1 }];
    }

    if (lower.startsWith('update technicians set name = ?')) {
      const [name, email, phone, specialization, status, id] = params;
      const t = this.technicians.find(tech => tech.id === parseInt(id, 10));
      if (t) {
        t.name = name;
        t.email = email;
        t.phone = phone;
        t.specialization = specialization;
        t.status = status;
      }
      return [{ affectedRows: 1 }];
    }

    // UPDATE rooms
    if (lower.startsWith('update rooms set building = ?')) {
      const [building, room_number, room_type, id] = params;
      const r = this.rooms.find(rm => rm.id === parseInt(id, 10));
      if (r) {
        r.building = building;
        r.room_number = room_number;
        r.room_type = room_type;
      }
      return [{ affectedRows: 1 }];
    }

    // UPDATE users (Profile)
    if (lower.startsWith('update users set name = ?')) {
      const id = parseInt(params[params.length - 1], 10);
      const u = this.users.find(usr => usr.id === id);
      if (u) {
        u.name = params[0] || u.name;
        u.department = params[1] || u.department;
        u.phone = params[2] || u.phone;
      }
      return [{ affectedRows: 1 }];
    }

    // UPDATE notifications
    if (lower.startsWith('update notifications set is_read = 1 where user_id = ?')) {
      const userId = parseInt(params[0], 10);
      this.notifications.forEach(n => {
        if (n.user_id === userId) n.is_read = 1;
      });
      return [{ affectedRows: 1 }];
    }

    if (lower.startsWith('update notifications set is_read = 1 where id = ?')) {
      const id = parseInt(params[0], 10);
      const n = this.notifications.find(notif => notif.id === id);
      if (n) n.is_read = 1;
      return [{ affectedRows: 1 }];
    }

    // DELETE queries
    if (lower.startsWith('delete from users where id = ?')) {
      const id = parseInt(params[0], 10);
      this.users = this.users.filter(u => u.id !== id);
      return [{ affectedRows: 1 }];
    }

    if (lower.startsWith('delete from rooms where id = ?')) {
      const id = parseInt(params[0], 10);
      this.rooms = this.rooms.filter(r => r.id !== id);
      return [{ affectedRows: 1 }];
    }

    if (lower.startsWith('delete from equipment where id = ?')) {
      const id = parseInt(params[0], 10);
      this.equipment = this.equipment.filter(e => e.id !== id);
      return [{ affectedRows: 1 }];
    }

    if (lower.startsWith('delete from technicians where id = ?')) {
      const id = parseInt(params[0], 10);
      this.technicians = this.technicians.filter(t => t.id !== id);
      return [{ affectedRows: 1 }];
    }

    // Default safe fallback for unhandled queries
    return [[]];
  }
}

module.exports = new FallbackStore();

