import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportComplaint from './pages/ReportComplaint';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';
import Profile from './pages/Profile';

import StudentDashboard from './dashboards/StudentDashboard/StudentDashboard';
import StaffDashboard from './dashboards/StaffDashboard/StaffDashboard';
import AdminDashboard from './dashboards/AdminDashboard/AdminDashboard';
import TechnicianDashboard from './dashboards/TechnicianDashboard/TechnicianDashboard';

// Role-based dispatcher
const DashboardDispatcher = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/dashboard/${user.role}`} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard redirector */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardDispatcher />
                </ProtectedRoute>
              }
            />

            {/* Protected Role Dashboards */}
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/staff"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/technician"
              element={
                <ProtectedRoute allowedRoles={['technician']}>
                  <TechnicianDashboard />
                </ProtectedRoute>
              }
            />

            {/* Report Complaint */}
            <Route
              path="/report"
              element={
                <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
                  <ReportComplaint />
                </ProtectedRoute>
              }
            />

            {/* Complaint Detailed Tracking & History */}
            <Route
              path="/complaints/:id"
              element={
                <ProtectedRoute>
                  <ComplaintDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Profile Settings */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
