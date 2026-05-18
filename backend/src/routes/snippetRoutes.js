const express = require('express');
const router = express.Router();
const {
  createSnippet,
  getSnippets,
  getSnippet,
  deleteSnippet,
  getSharedSnippet,
  getHistory,
} = require('../controllers/snippetController');
const { protect } = require('../middleware/auth');
const { standardLimiter } = require('../middleware/rateLimiter');
const { validateSnippet } = require('../middleware/validation');

// All snippet routes require auth
router.post('/', standardLimiter, protect, validateSnippet, createSnippet);
router.get('/', standardLimiter, protect, getSnippets);
router.get('/:id', standardLimiter, protect, getSnippet);
router.delete('/:id', standardLimiter, protect, deleteSnippet);

// History route (protected)
router.get('/user/history', standardLimiter, protect, getHistory);

// Public shared snippet route
router.get('/share/:shareId', standardLimiter, getSharedSnippet);

module.exports = router;
