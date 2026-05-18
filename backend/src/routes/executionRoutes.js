const express = require('express');
const router = express.Router();
const { runCode, getHealth } = require('../controllers/executionController');
const { optionalAuth } = require('../middleware/auth');
const { executionLimiter } = require('../middleware/rateLimiter');
const { validateExecution } = require('../middleware/validation');

// POST /api/run — Execute code (optional auth for history saving)
router.post('/run', executionLimiter, optionalAuth, validateExecution, runCode);

// GET /api/health — System health check
router.get('/health', getHealth);

module.exports = router;
