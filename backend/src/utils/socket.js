const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('./logger');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: config.allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = decoded; // Attach user to socket
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user.id})`);
    
    // Join a room based on the user's role to receive role-specific broadcasts
    if (socket.user.role) {
      socket.join(socket.user.role);
    }
    // Join a room based on user ID for personal notifications
    socket.join(socket.user.id);

    // Live Tracking Broadcast
    socket.on('truck_location_update', (data) => {
      // Broadcast this to Admins and Officers for the Live Map
      socket.to('county_admin').to('county_officer').emit('live_truck_update', data);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
