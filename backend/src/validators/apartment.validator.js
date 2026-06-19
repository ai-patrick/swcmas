const Joi = require('joi');
const config = require('../config');

const locationSchema = Joi.object({
  type: Joi.string().valid('Point').required(),
  coordinates: Joi.array().items(Joi.number().precision(8)).length(2).required(), // [lng, lat]
});

const scheduleSchema = Joi.object({
  frequency: Joi.string().valid('daily', 'every_other_day', 'weekly', 'biweekly', 'custom').required(),
  days: Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')).optional(),
  time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(), // HH:MM 24h format
  specialDates: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      reason: Joi.string().max(200).optional(),
    })
  ).optional(),
});

const createApartmentSchema = Joi.object({
  name: Joi.string().max(200).required(),
  address: Joi.string().max(500).required(),
  city: Joi.string().required(),
  county: Joi.string().required(),
  location: locationSchema.required(),
  unitCount: Joi.number().integer().min(1).required(),
  landlord: Joi.string().required(), // user id
  wasteCollector: Joi.string().optional(),
  collectionSchedule: scheduleSchema.optional(),
  notes: Joi.string().max(1000).optional(),
});

const updateApartmentSchema = Joi.object({
  name: Joi.string().max(200).optional(),
  address: Joi.string().max(500).optional(),
  city: Joi.string().optional(),
  county: Joi.string().optional(),
  location: locationSchema.optional(),
  unitCount: Joi.number().integer().min(1).optional(),
  landlord: Joi.string().optional(),
  wasteCollector: Joi.string().optional(),
  collectionSchedule: scheduleSchema.optional(),
  notes: Joi.string().max(1000).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createApartmentSchema,
  updateApartmentSchema,
};
