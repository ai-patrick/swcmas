const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

const auditController = require('../controllers/audit.controller');

router.use(protect);
router.use(authorize('county_admin'));

router.get('/', auditController.getAll);

module.exports = router;
