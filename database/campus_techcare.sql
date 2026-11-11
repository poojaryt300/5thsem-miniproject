-- Campus TechCare: Smart Campus Maintenance Management System
-- Complete MySQL Database Schema and Seed Data

DROP DATABASE IF EXISTS campus_techcare;
CREATE DATABASE campus_techcare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_techcare;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'staff', 'admin', 'technician') NOT NULL,
    department VARCHAR(100) DEFAULT 'General',
    phone VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Rooms Table
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building VARCHAR(100) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    room_type ENUM('classroom', 'staff_room', 'lab', 'seminar_hall', 'other') DEFAULT 'classroom',
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_building_room (building, room_number)
) ENGINE=InnoDB;

-- 3. Equipment Table
CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    equipment_type ENUM('Fan', 'Light', 'PC', 'Projector', 'AC', 'Wi-Fi', 'Switch', 'Other') NOT NULL,
    equipment_name VARCHAR(100) NOT NULL,
    status ENUM('operational', 'needs_maintenance', 'under_repair', 'replaced') DEFAULT 'operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Technicians Table
CREATE TABLE technicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    specialization ENUM('Electrical', 'HVAC & AC', 'IT & Computer', 'Networking', 'Projector & AV', 'General Maintenance') DEFAULT 'General Maintenance',
    status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Complaints Table
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_code VARCHAR(30) UNIQUE,
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    equipment_id INT NULL,
    problem_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    photo_url VARCHAR(255) DEFAULT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    status ENUM('Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Submitted',
    technician_id INT NULL,
    repair_notes TEXT NULL,
    resolved_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Complaint Updates / History Table
CREATE TABLE complaint_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    updated_by INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    complaint_id INT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_user ON complaints(user_id);
CREATE INDEX idx_complaints_technician ON complaints(technician_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- ==========================================
-- SEED DATA
-- Default Passwords:
-- Admin:      admin@campus.edu         / Admin@123
-- Student:    student@campus.edu       / Student@123
-- Staff:      staff@campus.edu         / Staff@123
-- Technician: tech.electric@campus.edu / Tech@123
-- ==========================================

INSERT INTO users (id, name, email, password, role, department, phone) VALUES
(1, 'System Administrator', 'admin@campus.edu', '$2a$10$8.4nYsAPUZUPLLdJmHRaGe0tDYpeZHQ2HvPPOF3acy80.K.hVIpDa', 'admin', 'Campus Administration', '+91 98765 43210'),
(2, 'Alex Johnson (Student)', 'student@campus.edu', '$2a$10$8.4nYsAPUZUPLLdJmHRaGeU2j5S0I7oksj7Igk7Zx5fm6IGq4rhZa', 'student', 'Computer Science & Engg', '+91 98765 11111'),
(3, 'Dr. Robert Vance (Staff)', 'staff@campus.edu', '$2a$10$8.4nYsAPUZUPLLdJmHRaGeRqvy0TTYnZYbfqwfptVXG7ThzmD/TrS', 'staff', 'Electrical & Electronics', '+91 98765 22222'),
(4, 'Vikram Sharma (Electrician)', 'tech.electric@campus.edu', '$2a$10$8.4nYsAPUZUPLLdJmHRaGesDd/Zirv7LY8Ge8jBVej33LMW5NOkry', 'technician', 'Campus Electrical Works', '+91 98765 33333'),
(5, 'Suresh Patel (IT Specialist)', 'tech.network@campus.edu', '$2a$10$8.4nYsAPUZUPLLdJmHRaGesDd/Zirv7LY8Ge8jBVej33LMW5NOkry', 'technician', 'Hardware & Networking', '+91 98765 44444'),
(6, 'Ramesh Kumar (HVAC Expert)', 'tech.ac@campus.edu', '$2a$10$8.4nYsAPUZUPLLdJmHRaGesDd/Zirv7LY8Ge8jBVej33LMW5NOkry', 'technician', 'Air Conditioning & Cooling', '+91 98765 55555'),
(7, 'Sneha Reddy (Student)', 'sneha@campus.edu', '$2a$10$8.4nYsAPUZUPLLdJmHRaGeU2j5S0I7oksj7Igk7Zx5fm6IGq4rhZa', 'student', 'Information Technology', '+91 98765 66666');

-- Technicians Records linked with user IDs
INSERT INTO technicians (id, user_id, name, email, phone, specialization, status) VALUES
(1, 4, 'Vikram Sharma', 'tech.electric@campus.edu', '+91 98765 33333', 'Electrical', 'available'),
(2, 5, 'Suresh Patel', 'tech.network@campus.edu', '+91 98765 44444', 'IT & Computer', 'busy'),
(3, 6, 'Ramesh Kumar', 'tech.ac@campus.edu', '+91 98765 55555', 'HVAC & AC', 'available');

-- Rooms
INSERT INTO rooms (id, building, room_number, room_type, qr_code) VALUES
(1, 'Aryabhata Block (CS & IT)', 'Room 101', 'lab', 'CTC-ROOM-ARYA-101'),
(2, 'Aryabhata Block (CS & IT)', 'Room 204', 'classroom', 'CTC-ROOM-ARYA-204'),
(3, 'Aryabhata Block (CS & IT)', 'Staff Room 201', 'staff_room', 'CTC-ROOM-ARYA-SR201'),
(4, 'Kalam Science Block', 'Room 302', 'classroom', 'CTC-ROOM-KLM-302'),
(5, 'Kalam Science Block', 'Staff Room 102', 'staff_room', 'CTC-ROOM-KLM-SR102'),
(6, 'Ramanujan Engineering Block', 'Room 405', 'seminar_hall', 'CTC-ROOM-RAM-405'),
(7, 'Ramanujan Engineering Block', 'Room 108', 'lab', 'CTC-ROOM-RAM-108');

-- Equipment
INSERT INTO equipment (id, room_id, equipment_type, equipment_name, status) VALUES
(1, 1, 'PC', 'Dell OptiPlex 7090 - PC-01', 'operational'),
(2, 1, 'PC', 'Dell OptiPlex 7090 - PC-14', 'needs_maintenance'),
(3, 1, 'Projector', 'Epson Full HD Projector 4K', 'operational'),
(4, 1, 'AC', 'Voltas 2-Ton Inverter AC (North)', 'operational'),
(5, 1, 'Switch', 'Main Power Distribution Box', 'operational'),
(6, 2, 'Projector', 'BenQ Smart Projector PJ-204', 'needs_maintenance'),
(7, 2, 'Fan', 'Havells High-Speed Ceiling Fan #2', 'needs_maintenance'),
(8, 2, 'Light', 'Philips 36W LED Tube Light #4', 'needs_maintenance'),
(9, 2, 'Wi-Fi', 'Cisco Catalyst AP 9120AX', 'operational'),
(10, 3, 'AC', 'Daikin Dual Inverter 1.5-Ton', 'needs_maintenance'),
(11, 3, 'Light', 'Philips Recessed Ceiling Panel', 'operational'),
(12, 4, 'PC', 'HP EliteDesk Workstation 03', 'operational'),
(13, 4, 'Wi-Fi', 'Aruba AP-535 Campus Access Point', 'under_repair'),
(14, 6, 'Projector', 'Sony Laser 4K Seminar Projector', 'operational'),
(15, 6, 'AC', 'Carrier Central Chiller Unit', 'operational');

-- Sample Complaints
INSERT INTO complaints (id, complaint_code, user_id, room_id, equipment_id, problem_type, description, priority, status, technician_id, repair_notes, resolved_at, created_at) VALUES
(1, 'CTC-2026-1001', 2, 2, 7, 'Fan not working', 'Ceiling fan #2 in Room 204 is making loud humming noise and has stopped rotating completely during morning lectures.', 'High', 'In Progress', 1, 'Technician inspected the motor and capacitor. Replacing the 3.15uF capacitor.', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'CTC-2026-1002', 3, 3, 10, 'AC problems', 'Staff Room AC is blowing room temperature air instead of cooling. Display shows error code E4 (Refrigerant pressure low).', 'Urgent', 'Assigned', 3, 'Assigned to Ramesh Kumar for gas pressure top-up and coil check.', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'CTC-2026-1003', 2, 1, 2, 'Computers and PCs not working', 'PC-14 in CS Lab 1 fails to boot into Windows. Solid amber light on motherboard, possibly faulty RAM stick or power supply.', 'Medium', 'Submitted', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(4, 'CTC-2026-1004', 3, 4, 13, 'Wi-Fi and network problems', 'Campus Wi-Fi connectivity drops every 5 minutes in Kalam Room 302. Students cannot access online assessment portal.', 'High', 'Assigned', 2, 'Suresh Patel investigating switch port connectivity and PoE injector.', NULL, DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(5, 'CTC-2026-1005', 7, 2, 8, 'Lights not working', 'LED Tube Light #4 flickering violently near the whiteboard, causing severe glare and headache for students.', 'Low', 'Resolved', 1, 'Replaced faulty electronic ballast and fitted fresh 36W LED tube. Verified illumination.', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- Complaint Updates History
INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, note, created_at) VALUES
(1, 2, NULL, 'Submitted', 'Complaint submitted by Alex Johnson', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 1, 'Submitted', 'Assigned', 'Assigned to Technician Vikram Sharma', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 4, 'Assigned', 'In Progress', 'Technician started inspection and testing capacitor.', DATE_SUB(NOW(), INTERVAL 6 HOUR)),

(2, 3, NULL, 'Submitted', 'Complaint registered by Dr. Robert Vance', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, 'Submitted', 'Assigned', 'Assigned to HVAC technician Ramesh Kumar', DATE_SUB(NOW(), INTERVAL 12 HOUR)),

(3, 2, NULL, 'Submitted', 'Complaint submitted by Alex Johnson for Lab 1 PC-14', DATE_SUB(NOW(), INTERVAL 4 HOUR)),

(4, 3, NULL, 'Submitted', 'Complaint registered by Staff Dr. Robert Vance', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(4, 1, 'Submitted', 'Assigned', 'Assigned to Suresh Patel (Networking)', DATE_SUB(NOW(), INTERVAL 10 HOUR)),

(5, 7, NULL, 'Submitted', 'Complaint submitted by Sneha Reddy', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 1, 'Submitted', 'Assigned', 'Assigned to Vikram Sharma', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 4, 'Assigned', 'In Progress', 'Began replacement of ballast and tube', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 4, 'In Progress', 'Resolved', 'Replacement complete and tested successfully.', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Notifications
INSERT INTO notifications (user_id, complaint_id, message, is_read, created_at) VALUES
(1, 3, 'New complaint #CTC-2026-1003 reported for CS Lab 1 (PC-14).', 0, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, 1, 'Your complaint #CTC-2026-1001 status changed to In Progress.', 0, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(4, 1, 'You have been assigned complaint #CTC-2026-1001 (Aryabhata Room 204 - Fan).', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 2, 'Technician Ramesh Kumar assigned to your complaint #CTC-2026-1002.', 0, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(7, 5, 'Your complaint #CTC-2026-1005 (Room 204 Light) has been Resolved!', 1, DATE_SUB(NOW(), INTERVAL 1 DAY));
