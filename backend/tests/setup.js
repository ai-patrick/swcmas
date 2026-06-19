// Test setup — in-memory MongoDB using jest-environment-node
const mongoose = require('mongoose');

// Use a mock DB URL for tests (real tests would use mongodb-memory-server)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-swcmas-2024';
process.env.JWT_EXPIRES_IN = '1d';
process.env.MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/swcmas_test';

// Silence logger during tests
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Prevent cron/scheduler side effects
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));
jest.mock('../src/services/anomaly.service', () => ({
  runDetections: jest.fn().mockResolvedValue(null),
}));
jest.mock('../src/services/collectionScheduler.service', () => ({
  start: jest.fn(),
}));
