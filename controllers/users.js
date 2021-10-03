import ErrorResponse from '../utilis/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import User from '../models/User.js';

// @desc  get all users
// @route GET /api/v1/users
// @access Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc  get single user
// @route GET /api/v1/users/:id
// @access Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    date: user,
  });
});

// @desc  Create a user
// @route POST /api/v1/users
// @access Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    date: user,
  });
});

// @desc  Update a user
// @route PUT /api/v1/users/:id
// @access Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    date: user,
  });
});

// @desc  delete a user
// @route DELETE /api/v1/users/:id
// @access Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    date: {},
  });
});
