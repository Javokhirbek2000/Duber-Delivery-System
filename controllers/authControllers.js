const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config({ path: '../config.env' });

exports.registerUser = catchAsync(async (req, res) => {
  const newUser = await User.create({
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
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
    return res.status(400).json({
      message: 'Please provide password and email',
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({
      message: 'Incorrect email or password',
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  req.user = user;

  res.status(200).json({
    jwt_token: token,
    data: {
      user,
    },
  });
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
