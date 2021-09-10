const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getUserInfo = catchAsync(async (req, res) => {
  const user = await User.findOne({ id: req.user._id }).select('-password');
  res.status(200).json({
    user,
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await User.findOneAndRemove({ id: req.user._id });
  res.status(200).json({
    message: 'Profile deleted successfully!',
  });
});

exports.changeUserPassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id);

  if (!req.body.oldPassword || !req.body.newPassword) {
    return res.status(400).json({
      message: 'Specify old and new passwords',
    });
  }

  if (!(await bcrypt.compare(req.body.oldPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 400));
  }

  // 3) If so, update password
  user.password = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();

  res.status(200).json({
    message: 'Password changed successfully',
  });
});
