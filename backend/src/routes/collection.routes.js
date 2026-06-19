const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload'); // Cloudinary multer

const collectionController = require('../controllers/collection.controller');
const {
  createCollectionSchema,
  startCollectionSchema,
  completeCollectionSchema,
  verifyCollectionSchema,
} = require('../validators/collection.validator');

// All routes require authentication
router.use(protect);

// List collections – admin, officer, collector, landlord
router.get('/', authorize('county_admin', 'county_officer', 'waste_collector', 'landlord'), collectionController.getAll);

// Get collection details – same roles
router.get('/:id', authorize('county_admin', 'county_officer', 'waste_collector', 'landlord'), collectionController.getOne);

// Create schedule – admin only
router.post(
  '/',
  authorize('county_admin'),
  validate(createCollectionSchema),
  collectionController.create
);

// Collector starts collection – collector role, upload before photo
router.patch(
  '/:id/start',
  authorize('waste_collector'),
  upload.single('beforePhoto'),
  validate(startCollectionSchema),
  collectionController.start
);

// Collector completes collection – collector role, upload after photo
router.patch(
  '/:id/complete',
  authorize('waste_collector'),
  upload.single('afterPhoto'),
  validate(completeCollectionSchema),
  collectionController.complete
);

// Landlord verifies collection – landlord role
router.patch(
  '/:id/verify',
  authorize('landlord'),
  validate(verifyCollectionSchema),
  collectionController.verify
);

// Admin deactivates collection (soft delete / dispute)
router.delete(
  '/:id',
  authorize('county_admin'),
  collectionController.remove
);

module.exports = router;
