const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const executionRoutes = require('./routes/executionRoutes');
const authRoutes = require('./routes/authRoutes');
const snippetRoutes = require('./routes/snippetRoutes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts from React
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', executionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes);

// In production, serve the React frontend build
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));

  // SPA fallback — any non-API route serves index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
} else {
  // Dev: root route shows API info
  app.get('/', (req, res) => {
    res.json({
      name: 'CodeForge API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: 'GET /api/health',
        run: 'POST /api/run',
        auth: '/api/auth/*',
        snippets: '/api/snippets/*',
      },
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

module.exports = app;
