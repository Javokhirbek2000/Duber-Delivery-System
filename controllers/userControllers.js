const bcrypt = require('bcryptjs');
const Truck = require('../models/truckModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getUserInfo = catchAsync(async (req, res) => {
  const user = await User.findOne({ _id: req.user.id }).select('-password');
  res.status(200).json({
    user,
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  const assignedTrucks = Truck.findOne({ assigned_to: req.user.id });
  if (assignedTrucks) {
    return res.status(400).json({
      message: 'You cannot delete profile while it is assigned to truck',
    });
  }
  await User.findOneAndRemove({ _id: req.user._id });
  res.status(200).json({
    message: 'Profile deleted successfully!',
  });
});

exports.changeUserPassword = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!req.body.oldPassword || !req.body.newPassword) {
    return res.status(400).json({
      message: 'Specify old and new passwords',
    });
  }

  if (!(await bcrypt.compare(req.body.oldPassword, user.password))) {
    return res.status(400).json({
      message: 'Your current password is wrong.',
    });
  }

  user.password = await bcrypt.hash(req.body.newPassword, 10);
  await user.save();

  res.status(200).json({
    message: 'Password changed successfully',
  });
});
