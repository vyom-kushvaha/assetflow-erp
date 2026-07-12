const http = require('http');
const path = require('path');
// Load environment variables from .env if present
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('./app');

const { ensureInitialized } = require('./database/init');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = http.createServer(app);

// Graceful Shutdown Configuration
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Perform any database or resource cleanup here if needed
    
    console.log('Graceful shutdown completed successfully.');
    process.exit(0);
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

// Process Event Observers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...', reason);
  process.exit(1);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start Server Listen Execution
async function startServer() {
  try {
    console.log('Verifying database state...');
    await ensureInitialized();
    
    server.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  AssetFlow API Server running in [${NODE_ENV}] mode`);
      console.log(`  Listening on port: ${PORT}`);
      console.log(`  Health Check URL: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('CRITICAL ERROR: Database initialization failed on startup!', err);
    process.exit(1);
  }
}

startServer();
