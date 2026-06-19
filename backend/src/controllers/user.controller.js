const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// GET /users? page=1&limit=20
const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = {};
    // optional filters by role, isActive
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const result = await userService.listUsers({ filter, page, limit });
    res.json(new ApiResponse({ data: result }));
  } catch (err) {
    next(err);
  }
};

// GET /users/:id
const getOne = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(new ApiResponse({ data: user }));
  } catch (err) {
    next(err);
  }
};

// POST /users
const create = async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(new ApiResponse({ data: newUser }));
  } catch (err) {
    next(err);
  }
};

// PATCH /users/:id
const update = async (req, res, next) => {
  try {
    const { oldValue, newValue } = await userService.updateUser(req.params.id, req.body);
    // Attach audit data to request for middleware (if used)
    req.oldValue = oldValue;
    req.newValue = newValue;
    res.json(new ApiResponse({ data: newValue }));
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id
const remove = async (req, res, next) => {
  try {
    const { oldValue, newValue } = await userService.deleteUser(req.params.id);
    req.oldValue = oldValue;
    req.newValue = newValue;
    res.json(new ApiResponse({ message: 'User deactivated' }));
  } catch (err) {
    next(err);
  }
};

// GET /users/me/profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user._id);
    res.json(new ApiResponse({ data: profile }));
  } catch (err) {
    next(err);
  }
};

// PATCH /users/me/profile
const updateProfile = async (req, res, next) => {
  try {
    const { oldValue, newValue } = await userService.updateProfile(req.user._id, req.body);
    req.oldValue = oldValue;
    req.newValue = newValue;
    res.json(new ApiResponse({ data: newValue }));
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
  getProfile,
  updateProfile,
};
