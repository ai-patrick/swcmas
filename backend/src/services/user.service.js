const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/** List users with optional filters and pagination */
const listUsers = async ({ filter = {}, page = 1, limit = 20, sort = { createdAt: -1 } }) => {
  const skip = (page - 1) * limit;
  const users = await User.find(filter).sort(sort).skip(skip).limit(limit).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
  const total = await User.countDocuments(filter);
  return { users, total, page, limit };
};

/** Get single user by ID */
const getUserById = async (id) => {
  const user = await User.findById(id).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

/** Create new user (admin only) */
const createUser = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new ApiError(409, 'Email already in use');
  }
  const user = new User(data);
  await user.save();
  // omit sensitive fields
  const result = user.toObject();
  delete result.password;
  delete result.refreshToken;
  delete result.resetPasswordToken;
  delete result.resetPasswordExpires;
  return result;
};

/** Update user (admin/officer) */
const updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  // Keep track of old values for audit (optional)
  const oldValue = user.toObject();
  Object.assign(user, data);
  await user.save();
  const newValue = user.toObject();
  delete newValue.password;
  delete newValue.refreshToken;
  delete newValue.resetPasswordToken;
  delete newValue.resetPasswordExpires;
  return { oldValue, newValue };
};

/** Soft delete (deactivate) user */
const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  const oldValue = user.toObject();
  user.isActive = false;
  await user.save();
  const newValue = user.toObject();
  delete newValue.password;
  delete newValue.refreshToken;
  delete newValue.resetPasswordToken;
  delete newValue.resetPasswordExpires;
  return { oldValue, newValue };
};

/** Get profile of current authenticated user */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

/** Update profile of current user (self) */
const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  const oldValue = user.toObject();
  // only allow permitted fields
  const allowed = ['firstName', 'lastName', 'phone'];
  allowed.forEach((field) => {
    if (data[field] !== undefined) user[field] = data[field];
  });
  await user.save();
  const newValue = user.toObject();
  delete newValue.password;
  delete newValue.refreshToken;
  delete newValue.resetPasswordToken;
  delete newValue.resetPasswordExpires;
  return { oldValue, newValue };
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
};
