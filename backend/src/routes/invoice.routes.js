const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const auditLog = require('../middleware/audit');

router.use(protect);

router.route('/')
  .get(authorize('county_admin', 'landlord'), invoiceController.getAll);

router.route('/:id/pay')
  .patch(
    authorize('landlord', 'county_admin'), 
    invoiceController.pay,
    auditLog('UPDATE', 'invoice')
  );

module.exports = router;
