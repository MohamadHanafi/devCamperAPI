import crypto from 'crypto';
import ErrorResponse from '../utilis/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import User from '../models/User.js';
import { sendEmail } from '../utilis/sendEmail.js';

// @desc  Register A user
// @route POST /api/v1/auth/register
// @access Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create Token
  sendTokenResponse(user, 200, res);
});

// @desc  Login A user
// @route POST /api/v1/auth/login
// @access Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse('please provide both email and password', 400)
    );
  }

  // Check for the user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if passwords matches
  const isMatched = await user.matchPasswords(password);

  if (!isMatched) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Create Token
  sendTokenResponse(user, 200, res);
});

// @desc  logout A user and clear cookie
// @route get /api/v1/auth/logout
// @access Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc  get current logged in user
// @route POST /api/v1/auth/me
// @access private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc  update user details
// @route PUT /api/v1/auth/updatedetails
// @access private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc  update password
// @route PUT /api/v1/auth/updatepassword
// @access private
export const UpdatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  //check current password

  if (!(await user.matchPasswords(req.body.currentPassword))) {
    next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc  Forget password
// @route POST /api/v1/auth/forgetpassword
// @access Public
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`there is no user with that email`, 404));
  }

  // Get reset Token
  const resetToken = user.getResetPasswordToken();

  await user.save({
    validateBeforeSave: false,
  });

  const options = {
    email: user.email,
    subject: 'Reset Password',
    text: `You received this email because you (or someone else) requested to rest your password. If it is not you, no further action is required. otherWise, make a put request to: \n\n ${
      req.protocol
    }://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`,
  };

  try {
    await sendEmail(options);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error);
    user.getResetPasswordToken = undefined;
    user.getResetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    next(new ErrorResponse(`email could not be sent`, 500));
  }
});

// @desc  reset user password
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access private
export const resetPassword = asyncHandler(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid token`, 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// send token response and cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
