const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config({ path: './../config.env' });

const authMiddleware = async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(400).json({
      message: 'You are not logged in! Please log in to get access.',
    });
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(400).json({
      message: 'The user belonging to this token does no longer exist.',
    });
  }
  req.user = currentUser;
  next();
};

module.exports = authMiddleware;
