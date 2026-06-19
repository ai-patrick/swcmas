const residentVerificationService = require('../services/residentVerification.service');
const ApiResponse = require('../utils/ApiResponse');

// POST /verifications/generate/:collectionId – admin or officer generate verification requests
const generate = async (req, res, next) => {
  try {
    const collectionId = req.params.collectionId;
    const verifications = await residentVerificationService.generateForCollection(collectionId);
    res.status(201).json(new ApiResponse({ data: verifications }));
  } catch (err) {
    next(err);
  }
};

// POST /verifications/:id/respond – resident submits response
const respond = async (req, res, next) => {
  try {
    const verificationId = req.params.id;
    const { wasCollected, notes } = req.body;
    const rv = await residentVerificationService.submitResponse(verificationId, req.user._id, wasCollected, notes);
    res.json(new ApiResponse({ data: rv }));
  } catch (err) {
    next(err);
  }
};

// GET /verifications/me – list resident's pending verifications
const listMy = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await residentVerificationService.listForResident(req.user._id, { page, limit });
    res.json(new ApiResponse({ data: result }));
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, respond, listMy };
