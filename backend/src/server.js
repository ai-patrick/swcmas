const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { initSocket } = require('./utils/socket');

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
server.listen(config.port, () => {
  logger.info(`Server running in ${config.env} mode on port ${config.port}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
