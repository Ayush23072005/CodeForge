const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateAuth } = require('../middleware/validation');

// POST /api/auth/register
router.post('/register', authLimiter, validateAuth, register);

// POST /api/auth/login
router.post('/login', authLimiter, validateAuth, login);

// GET /api/auth/me (protected)
router.get('/me', protect, getMe);

module.exports = router;
