const Joi = require('joi');
const config = require('../config');

// Create complaint (resident)
const createComplaintSchema = Joi.object({
  resident: Joi.string().optional(),
  apartment: Joi.string().optional(), // could be null
  type: Joi.string().valid(...config.complaintTypes).required(),
  title: Joi.string().max(200).required(),
  description: Joi.string().max(2000).required(),
  images: Joi.array().items(Joi.string()).optional(), // URLs after upload
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).optional(),
});

// Update complaint (officer)
const updateComplaintSchema = Joi.object({
  status: Joi.string().valid(...config.complaintStatuses).optional(),
  priority: Joi.string().valid(...config.complaintPriorities).optional(),
  assignedTo: Joi.string().optional(),
  resolution: Joi.string().max(1000).optional(),
}).min(1);

module.exports = {
  createComplaintSchema,
  updateComplaintSchema,
};
