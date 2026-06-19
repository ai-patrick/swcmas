const apartmentService = require('../services/apartment.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// GET /apartments?city=&county=&page=&limit=
const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = {};
    if (req.query.city) filter.city = req.query.city;
    if (req.query.county) filter.county = req.query.county;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const result = await apartmentService.listApartments({ filter, page, limit });
    res.json(new ApiResponse({ data: result }));
  } catch (err) {
    next(err);
  }
};

// GET /apartments/:id
const getOne = async (req, res, next) => {
  try {
    const apartment = await apartmentService.getApartmentById(req.params.id);
    res.json(new ApiResponse({ data: apartment }));
  } catch (err) {
    next(err);
  }
};

// POST /apartments
const create = async (req, res, next) => {
  try {
    const apartment = await apartmentService.createApartment(req.body);
    res.status(201).json(new ApiResponse({ data: apartment }));
  } catch (err) {
    next(err);
  }
};

// PATCH /apartments/:id
const update = async (req, res, next) => {
  try {
    const apartment = await apartmentService.updateApartment(req.params.id, req.body);
    res.json(new ApiResponse({ data: apartment }));
  } catch (err) {
    next(err);
  }
};

// DELETE /apartments/:id (soft delete)
const remove = async (req, res, next) => {
  try {
    const apartment = await apartmentService.deactivateApartment(req.params.id);
    res.json(new ApiResponse({ data: apartment, message: 'Apartment deactivated' }));
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
};
