const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Authentication endpoints
router.post('/register', register);
router.post('/signup', register);
router.post('/sign-up', register);

router.post('/login', login);
router.post('/signin', login);
router.post('/sign-in', login);

// Friendly redirects if opened as GET in browser
router.get('/login', (req, res) => res.redirect('/login'));
router.get('/signin', (req, res) => res.redirect('/login'));
router.get('/sign-in', (req, res) => res.redirect('/login'));
router.get('/register', (req, res) => res.redirect('/register'));
router.get('/signup', (req, res) => res.redirect('/register'));
router.get('/sign-up', (req, res) => res.redirect('/register'));

router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
