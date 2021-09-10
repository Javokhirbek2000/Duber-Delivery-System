const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');

exports.registerUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 12),
    role: req.body.role,
  });

  res.status(200).json({
    message: 'Profile created successfully',
    data: {
      newUser,
    },
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 400));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  req.user = user;
  user.password = undefined;
  res.status(200).json({
    jwt_token: token,
    data: {
      user,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!
});

exports.forgottenPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).json({
      message: 'No user with such email found',
    });
  }

  const temporaryPassword = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 6);

  user.password = await bcrypt.hash(temporaryPassword, 12);
  await user.save({
    validateBeforeSave: false,
  });

  const emailOptions = {
    email: req.body.email,
    subject: 'Reset Password',
    message: `Temporary password: ${temporaryPassword}`,
  };
  sendEmail(emailOptions);

  res.status(200).json({
    message: 'New password sent to your email address',
  });
};
