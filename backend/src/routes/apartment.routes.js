const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const audit = require('../middleware/audit');

const apartmentController = require('../controllers/apartment.controller');
const { createApartmentSchema, updateApartmentSchema } = require('../validators/apartment.validator');

// All routes require authentication
router.use(protect);

// List apartments (admin & officer)
router.get('/', authorize('county_admin', 'county_officer'), apartmentController.getAll);

// Get specific apartment (admin & officer)
router.get('/:id', authorize('county_admin', 'county_officer'), apartmentController.getOne);

// Create apartment (admin only)
router.post(
  '/',
  authorize('county_admin'),
  validate(createApartmentSchema),
  audit('Create Apartment'),
  apartmentController.create
);

// Update apartment (admin only)
router.patch(
  '/:id',
  authorize('county_admin'),
  validate(updateApartmentSchema),
  audit('Update Apartment'),
  apartmentController.update
);

// Delete (deactivate) apartment (admin only)
router.delete(
  '/:id',
  authorize('county_admin'),
  audit('Deactivate Apartment'),
  apartmentController.remove
);

module.exports = router;
