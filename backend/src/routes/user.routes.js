const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const audit = require('../middleware/audit');

const userController = require('../controllers/user.controller');
const {
  createUserSchema,
  updateUserSchema,
  profileUpdateSchema,
} = require('../validators/user.validator');

// All routes require authentication
router.use(protect);

// List users (admin & officer)
router.get('/', authorize('county_admin', 'county_officer'), userController.getAll);

// Create new user (admin only)
router.post(
  '/',
  authorize('county_admin'),
  validate(createUserSchema),
  audit('Create User'),
  userController.create
);

// Get own profile (any authenticated)
router.get('/me/profile', userController.getProfile);
// Update own profile
router.patch(
  '/me/profile',
  validate(profileUpdateSchema),
  audit('Update Own Profile'),
  userController.updateProfile
);

// Get specific user by ID (admin & officer)
router.get('/:id', authorize('county_admin', 'county_officer'), userController.getOne);

// Update user (admin & officer)
router.patch(
  '/:id',
  authorize('county_admin', 'county_officer'),
  validate(updateUserSchema),
  audit('Update User'),
  userController.update
);

// Delete (deactivate) user (admin only)
router.delete(
  '/:id',
  authorize('county_admin'),
  audit('Deactivate User'),
  userController.remove
);

module.exports = router;
