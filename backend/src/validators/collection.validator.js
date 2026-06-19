const Joi = require('joi');
const config = require('../config');

// Create collection schedule (admin)
const createCollectionSchema = Joi.object({
  apartment: Joi.string().required(),
  wasteCollector: Joi.string().required(),
  scheduledDate: Joi.date().required(),
  // optional notes
  notes: Joi.string().max(500).optional(),
});

// Start collection (collector)
const startCollectionSchema = Joi.object({
  startLocation: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).required(),
}).required();

// Complete collection (collector) – beforePhoto will be uploaded via multipart, but we can also allow optional notes
const completeCollectionSchema = Joi.object({
  endLocation: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).required(),
  notes: Joi.string().max(500).optional(),
}).required();

// Verify collection (landlord)
const verifyCollectionSchema = Joi.object({
  verificationStatus: Joi.string()
    .valid('verified', 'suspicious', 'requires_investigation')
    .required(),
}).required();

module.exports = {
  createCollectionSchema,
  startCollectionSchema,
  completeCollectionSchema,
  verifyCollectionSchema,
};
