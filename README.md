# Campus TechCare – Smart Campus Maintenance Management System

A full-stack college maintenance reporting and equipment asset management web application built for students, faculty staff, campus facility administrators, and maintenance technicians.

---

## 1. Project Overview

**Campus TechCare** streamlines equipment fault reporting and repair workflows across college classrooms, staff rooms, computer labs, and seminar halls. 

When equipment malfunctions (such as fans, tube lights, lab PCs, projectors, air conditioning units, campus Wi-Fi access points, or electrical switches and sockets), students and faculty can instantly report issues or scan on-door **QR codes**.

The system features:
- **Role-Based Portals**: Tailored interfaces for Students, Staff, Technicians, and Administrators.
- **Visual 4-Stage Timeline**: Live tracking through `Submitted` → `Assigned` → `In Progress` → `Resolved`.
- **Door QR Code Integration**: Scan classroom plaques to automatically pre-fill building and room numbers.
- **Image Uploads**: Attach photos of faulty appliances or damaged parts for technician inspection.
- **Automated Workload & Dispatch**: Admins assign specialized technicians and monitor active workloads.
- **Real-Time Analytics**: Dynamic charts using **Recharts** for failure distribution and turnaround times.
- **In-App Notifications**: Real-time alerts on ticket updates and overdue repairs.

---

## 2. Technology Stack

- **Frontend**:
  - React.js 18 with Vite
  - Tailwind CSS (Navy blue and purple accent aesthetic)
  - React Router DOM v6 (Protected role routes)
  - Axios (HTTP client with JWT authorization interceptors)
  - Recharts (Interactive bar, area, and donut analytics)
  - Lucide React (Icons)
  - html5-qrcode & qrcode.react (QR generation and scanner)
  - Canvas Confetti (Celebration effects on task resolution)

- **Backend**:
  - Node.js & Express.js
  - RESTful APIs with prepared SQL statements
  - JWT (JSON Web Tokens) Authentication
  - bcryptjs Password Hashing
  - Multer (Local disk storage for complaint image uploads)
  - MySQL2 with connection pooling

- **Database**:
  - MySQL 8.0 (`campus_techcare`)
  - 7 relational tables with Foreign Keys and CASCADE constraints

---

## 3. Project Folder Structure

```
Campus-TechCare/
│
├── backend/
│   ├── config/
│   │   ├── db.js             # MySQL connection pool
│   │   └── initDb.js         # Automated DB schema creator & seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   ├── roomController.js
│   │   ├── equipmentController.js
│   │   ├── technicianController.js
│   │   ├── dashboardController.js
│   │   ├── notificationController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification & role authorization
│   │   └── upload.js         # Multer image upload handler
│   ├── routes/
│   ├── uploads/              # Storage directory for uploaded images
│   ├── server.js             # Express application entry point
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Active environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── Timeline.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── QRScannerModal.jsx
│   │   │   └── QRCodeModal.jsx
│   │   ├── dashboards/
│   │   │   ├── StudentDashboard/
│   │   │   ├── StaffDashboard/
│   │   │   ├── AdminDashboard/
│   │   │   └── TechnicianDashboard/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ReportComplaint.jsx
│   │   │   ├── ComplaintDetailsPage.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── database/
│   └── campus_techcare.sql   # Complete SQL schema and seed data
│
├── package.json              # Root project scripts
└── README.md
```

---

## 4. Default Demo Credentials

For quick evaluation or presentation:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `Admin@123` | Full system control, technicians, rooms, QR codes, analytics |
| **Student** | `student@campus.edu` | `Student@123` | Report problems, scan QR codes, track own complaints |
| **Staff** | `staff@campus.edu` | `Staff@123` | Report staff-room/classroom faults, track department tickets |
| **Technician (Electrical)** | `tech.electric@campus.edu` | `Tech@123` | Assigned electrical jobs, start work, add repair notes |
| **Technician (IT/Network)** | `tech.network@campus.edu` | `Tech@123` | Computer & Wi-Fi repair dispatches |
| **Technician (HVAC/AC)** | `tech.ac@campus.edu` | `Tech@123` | Air conditioning maintenance tickets |

*(Note: On the Login page, you can also click the quick **Demo Autofill** buttons to fill credentials with a single click).*

---

## 5. Setup & Installation Guide

### Prerequisites
- Node.js (v18 or v20+ recommended)
- MySQL Server (Running locally on port 3306)

---

### Step 1: Database Setup

You can set up the database in **one** of two ways:

#### Option A (Automated Node Script - Recommended):
1. In `backend/.env`, configure your MySQL password:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=campus_techcare
   DB_PORT=3306
   ```
2. Run the initialization script from the root directory:
   ```bash
   npm run init:db
   ```
   *(Or navigate into `backend` and run `npm run init-db`)*.

#### Option B (Manual MySQL Import):
Import the SQL script using MySQL Workbench or the MySQL command line:
```bash
mysql -u root -p < database/campus_techcare.sql
```

---

### Step 2: Configure Environment Variables

In `backend/.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_techcare
DB_PORT=3306

JWT_SECRET=campus_techcare_secure_jwt_secret_key_2026_xyz987
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
```

---

### Step 3: Install Dependencies

From root:
```bash
npm run install:all
```
*(Or run `npm install` inside both `backend` and `frontend` directories).*

---

### Step 4: Run the Application

You can start the backend and frontend in two separate terminal tabs:

#### Terminal 1 (Backend API):
```bash
cd backend
npm run dev
```
Backend API will start at: **`http://localhost:5000`**

#### Terminal 2 (Frontend React App):
```bash
cd frontend
npm run dev
```
Frontend Web App will open at: **`http://localhost:3000`**

---

## 6. Testing the Complete Maintenance Workflow

1. **Sign In as Student**:
   - Go to `http://localhost:3000/login` and click **Student**.
   - Click **Report a Problem** or **Scan Room QR**.
   - Select building, classroom, equipment (e.g., *Ceiling Fan* or *Projector*), set priority to *High*, describe the issue, and upload a photo.
   - Click **Submit Complaint Ticket**. Notice the generated Ticket ID (e.g. `CTC-2026-XXXX`).

2. **Sign In as Admin**:
   - Open in an incognito window or log out and log in as **Admin**.
   - Check the **Overview & Stats** tab: notice the dynamic count increase.
   - Go to the **All Complaints** tab to find the new ticket.
   - Click the **Assign Tech** button next to the complaint and allocate a technician (e.g. *Vikram Sharma*).
   - Status automatically advances from `Submitted` to `Assigned`.

3. **Sign In as Technician**:
   - Log in as **Technician** (`tech.electric@campus.edu`).
   - The assigned work order is prominently displayed in the technician dashboard.
   - Click **Start Work** (status changes to `In Progress`).
   - Click **Mark Resolved**, type repair notes (e.g., *"Replaced faulty motor capacitor with new 3.15uF unit. Verified speed."*), and submit.
   - Celebration confetti confirms task completion.

4. **Verify as Student**:
   - Log back in as **Student**.
   - Open the complaint details: the visual timeline displays the full audit trail with green completion checkmarks, the technician's name, timestamps, and repair notes.

---

## 7. Third-Year CSE Project Highlights
- **Prepared Statements**: Protection against SQL Injection.
- **Bcrypt Hashing**: Secure salted one-way password storage.
- **JWT Authorization Middleware**: Granular role-based access control protecting all REST endpoints.
- **Relational Integrity**: Foreign keys with cascading updates and deletes for rooms, equipment, and audit updates.
- **Responsive UI**: Handcrafted with Tailwind CSS, supporting mobile, tablet, and widescreen layouts.
