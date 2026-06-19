const Joi = require('joi');

// Registration schema
const registerSchema = Joi.object({
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string()
    .valid('county_admin', 'county_officer', 'landlord', 'waste_collector', 'resident')
    .required(),
  phone: Joi.string().max(20).optional(),
});

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Refresh token schema (if token in body)
const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Reset password request schema
const resetRequestSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Password reset confirmation schema
const resetConfirmSchema = Joi.object({
  token: Joi.string().required(),
  email: Joi.string().email().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  resetRequestSchema,
  resetConfirmSchema,
};
