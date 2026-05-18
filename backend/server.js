require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║         ⚡ CodeForge API Server          ║
║──────────────────────────────────────────║
║  Port:  ${String(PORT).padEnd(33)}║
║  Mode:  ${String(process.env.NODE_ENV || 'development').padEnd(33)}║
║  URL:   http://localhost:${String(PORT).padEnd(20)}║
╚══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
