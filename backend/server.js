const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static uploads folder for complaint images
app.use('/uploads', express.static(uploadsDir));

// Root health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Campus TechCare API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
const authRoutes = require('./routes/authRoutes');
const { login, register } = require('./controllers/authController');

app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);

// Direct top-level login/register fallbacks
app.post('/login', login);
app.post('/signin', login);
app.post('/sign-in', login);
app.post('/register', register);
app.post('/signup', register);
app.post('/sign-up', register);

// Redirect browser GETs on API auth paths to frontend UI
app.get(['/api/login', '/api/signin', '/api/sign-in', '/api/auth/login', '/api/auth/signin'], (req, res) => res.redirect('/login'));
app.get(['/api/register', '/api/signup', '/api/sign-up', '/api/auth/register', '/api/auth/signup'], (req, res) => res.redirect('/register'));

app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/technicians', require('./routes/technicianRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Serve frontend static build if available (Production / Unified server mode)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 Handler for unhandled API routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Campus TechCare Backend Server running on port ${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});
