const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  resetRequestSchema,
  resetConfirmSchema,
} = require('../validators/auth.validator');
const protect = require('../middleware/auth');

// Public endpoints
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshSchema), authController.refreshToken);
router.post('/reset-password', validate(resetRequestSchema), authController.resetPasswordRequest);
router.post('/reset-password/confirm', validate(resetConfirmSchema), authController.resetPasswordConfirm);

// Protected endpoint
router.post('/logout', protect, authController.logout);

module.exports = router;
