const AppError = require('../utils/appError');

const truckMiddleware = async (req, res, next) => {
  if (!req.user.role === 'DRIVER') {
    next(new AppError('Only drivers can have trucks', 400));
  }
  next();
};

module.exports = truckMiddleware;
