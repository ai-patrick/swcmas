const Joi = require('joi');
const config = require('../config');

// Create user schema (admin use)
const createUserSchema = Joi.object({
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string()
    .valid(
      config.roles.COUNTY_ADMIN,
      config.roles.COUNTY_OFFICER,
      config.roles.LANDLORD,
      config.roles.WASTE_COLLECTOR,
      config.roles.RESIDENT
    )
    .required(),
  phone: Joi.string().max(20).optional(),
});

// Update user schema (admin/officer)
const updateUserSchema = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).max(128).optional(),
  role: Joi.string()
    .valid(
      config.roles.COUNTY_ADMIN,
      config.roles.COUNTY_OFFICER,
      config.roles.LANDLORD,
      config.roles.WASTE_COLLECTOR,
      config.roles.RESIDENT
    )
    .optional(),
  phone: Joi.string().max(20).optional(),
  isActive: Joi.boolean().optional(),
});

// Profile update for self (no role change)
const profileUpdateSchema = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  phone: Joi.string().max(20).optional(),
  // profileImage can be handled via upload middleware separately
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  profileUpdateSchema,
};
