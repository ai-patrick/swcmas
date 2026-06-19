const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');

const notificationController = require('../controllers/notification.controller');

router.use(protect);

// List notifications for logged‑in user
router.get('/', notificationController.getAll);

// Mark a specific notification as read
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
