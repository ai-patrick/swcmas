const complaintService = require('../services/complaint.service');
const ApiResponse = require('../utils/ApiResponse');
const { getIO } = require('../utils/socket');

// List complaints – supports filters
const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.resident) filter.resident = req.query.resident;
    const result = await complaintService.listComplaints({ filter, page, limit });
    res.json(new ApiResponse({ data: result }));
  } catch (err) {
    next(err);
  }
};

// Get a single complaint
const getOne = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaint(req.params.id);
    res.json(new ApiResponse({ data: complaint }));
  } catch (err) {
    next(err);
  }
};

// Resident creates a complaint
const create = async (req, res, next) => {
  try {
    let residentId = req.user._id;
    // Admin can specify a resident in the payload
    if (req.user.role === 'county_admin' && req.body.resident) {
      residentId = req.body.resident;
      // Remove resident field from complaint payload to keep schema clean
      const { resident, ...rest } = req.body;
      req.body = rest;
    }
    const complaint = await complaintService.createComplaint(residentId, req.body);
    
    // Trigger socket notification
    try {
      const io = getIO();
      io.to('county_admin').to('county_officer').emit('new_complaint', complaint);
    } catch (e) {
      // Ignored if socket is not ready
    }

    res.status(201).json(new ApiResponse({ data: complaint }));
  } catch (err) {
    next(err);
  }
};

// Officer updates a complaint (status, priority, assign, resolution)
const update = async (req, res, next) => {
  try {
    const { oldValue, newValue } = await complaintService.updateComplaint(req.params.id, req.body);
    // Attach audit data if needed
    req.oldValue = oldValue;
    req.newValue = newValue;
    res.json(new ApiResponse({ data: newValue }));
  } catch (err) {
    next(err);
  }
};

// Admin rejects (soft delete) complaint
const remove = async (req, res, next) => {
  try {
    const { oldValue, newValue } = await complaintService.rejectComplaint(req.params.id);
    req.oldValue = oldValue;
    req.newValue = newValue;
    res.json(new ApiResponse({ data: newValue, message: 'Complaint rejected' }));
  } catch (err) {
    next(err);
  }
};

// Run AI analysis on complaint
const analyze = async (req, res, next) => {
  try {
    const analysis = await complaintService.analyzeComplaint(req.params.id);
    res.json(new ApiResponse({ data: analysis }));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  analyze,
};
