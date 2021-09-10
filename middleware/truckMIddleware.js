const truckMiddleware = async (req, res, next) => {
  if (!req.user.role === 'DRIVER') {
    res.status(400).json({
      message: 'Only drivers can have trucks',
    });
  }
  next();
};

module.exports = truckMiddleware;
