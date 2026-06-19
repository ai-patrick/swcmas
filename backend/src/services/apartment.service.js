const Apartment = require('../models/Apartment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/** List apartments with optional filters and pagination */
const listApartments = async ({ filter = {}, page = 1, limit = 20, sort = { createdAt: -1 } }) => {
  const skip = (page - 1) * limit;
  const apartments = await Apartment.find(filter).sort(sort).skip(skip).limit(limit).populate('landlord wasteCollector', 'firstName lastName email role');
  const total = await Apartment.countDocuments(filter);
  return { apartments, total, page, limit };
};

/** Get single apartment by ID */
const getApartmentById = async (id) => {
  const apartment = await Apartment.findById(id).populate('landlord wasteCollector', 'firstName lastName email role');
  if (!apartment) {
    throw new ApiError(404, 'Apartment not found');
  }
  return apartment;
};

/** Validate that a user ID exists and has a required role */
const validateUserRole = async (userId, allowedRoles) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, `User with ID ${userId} not found`);
  }
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(400, `User must have role ${allowedRoles.join(' or ')}`);
  }
  return user;
};

/** Create a new apartment */
const createApartment = async (data) => {
  // Verify landlord exists and is a landlord role
  await validateUserRole(data.landlord, ['landlord']);
  if (data.wasteCollector) {
    await validateUserRole(data.wasteCollector, ['waste_collector']);
  }
  const apartment = new Apartment(data);
  await apartment.save();
  return apartment;
};

/** Update an existing apartment */
const updateApartment = async (id, data) => {
  const apartment = await Apartment.findById(id);
  if (!apartment) {
    throw new ApiError(404, 'Apartment not found');
  }
  if (data.landlord) {
    await validateUserRole(data.landlord, ['landlord']);
  }
  if (data.wasteCollector) {
    await validateUserRole(data.wasteCollector, ['waste_collector']);
  }
  Object.assign(apartment, data);
  await apartment.save();
  return apartment;
};

/** Soft delete (deactivate) apartment */
const deactivateApartment = async (id) => {
  const apartment = await Apartment.findById(id);
  if (!apartment) {
    throw new ApiError(404, 'Apartment not found');
  }
  apartment.isActive = false;
  await apartment.save();
  return apartment;
};

module.exports = {
  listApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deactivateApartment,
};
