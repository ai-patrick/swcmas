const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');

const residentVerificationController = require('../controllers/residentVerification.controller');

// All routes require authentication
router.use(protect);

// Generate verification requests – admin/officer
router.post('/generate/:collectionId', authorize('county_admin', 'county_officer'), residentVerificationController.generate);

// Resident responds to a verification request
router.post('/:id/respond', authorize('resident'), validate(require('joi').object({ wasCollected: require('joi').boolean().required(), notes: require('joi').string().max(500).optional() })), residentVerificationController.respond);

// Resident lists their verification requests
router.get('/me', authorize('resident'), residentVerificationController.listMy);

module.exports = router;
