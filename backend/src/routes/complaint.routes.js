const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const audit = require('../middleware/audit');

const complaintController = require('../controllers/complaint.controller');
const {
  createComplaintSchema,
  updateComplaintSchema,
} = require('../validators/complaint.validator');

// All routes require authentication
router.use(protect);

// List complaints – admin, officer, resident (own)
router.get('/', authorize('county_admin', 'county_officer', 'resident'), complaintController.getAll);

// Create complaint – resident only
router.post('/', authorize('resident', 'county_admin'), validate(createComplaintSchema), audit('Create Complaint'), complaintController.create);

// Get specific complaint – admin/officer can view any, resident only own (handled in controller or via filter)
router.get('/:id', authorize('county_admin', 'county_officer', 'resident'), complaintController.getOne);

// Update complaint – officer or admin
router.patch('/:id', authorize('county_admin', 'county_officer'), validate(updateComplaintSchema), audit('Update Complaint'), complaintController.update);

// Delete (reject) complaint – admin only
router.delete('/:id', authorize('county_admin'), audit('Reject Complaint'), complaintController.remove);

// AI analysis endpoint – officer or admin
router.post('/:id/analyze', authorize('county_admin', 'county_officer'), audit('AI Analyze Complaint'), complaintController.analyze);

module.exports = router;
