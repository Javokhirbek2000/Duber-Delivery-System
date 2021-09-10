const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
require('dotenv').config({ path: './../config.env' });

const authMiddleware = async (req, res, next) => {
  let token;
  if (req.headers.cookie && req.headers.cookie.startsWith('jwt')) {
    token = req.headers.cookie.split('=')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 400)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  req.user = currentUser;
  next();
};

module.exports = authMiddleware;
