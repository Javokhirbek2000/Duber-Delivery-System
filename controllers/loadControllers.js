const Load = require('../models/loadModel');
const Truck = require('../models/truckModel');
const catchAsync = require('../utils/catchAsync');
const loadStates = require('../utils/loadStates');
const findTruckType = require('../utils/findTruckType');

exports.getUsersLoads = catchAsync(async (req, res) => {
  const { limit, offset, status } = req.query;

  let loads;
  if (req.user.role === 'DRIVER') {
    loads = await Load.find(
      {
        assigned_to: req.user.id,
        status: status || /^(ASSIGNED|SHIPPED)$/,
      },
      {},
      { skip: +offset || 0, limit: +limit || 10 }
    );
  } else if (req.user.role === 'SHIPPER') {
    loads = await Load.find(
      { created_by: req.user.id },
      {},
      { skip: +offset || 0, limit: +limit || 10 }
    );
  }

  res.status(200).json({
    loads,
  });
});

exports.addLoad = catchAsync(async (req, res) => {
  if (req.user.role === 'DRIVER') {
    return res.status(400).json({
      message: 'This route is available only for shippers!',
    });
  }
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  await Load.create({ ...req.body, created_by: req.user.id });
  res.status(200).json({
    message: 'Load created successfully',
  });
});

exports.getActiveLoads = catchAsync(async (req, res) => {
  if (req.user.role === 'SHIPPER') {
    return res.status(400).json({
      message: 'Only drivers can access this route',
    });
  }

  const load = await Load.find({
    assigned_to: req.user.id,
    status: 'ASSIGNED',
  });

  res.status(200).json({
    load,
  });
});

exports.iterateToNextLoad = catchAsync(async (req, res) => {
  if (req.user.role === 'SHIPPER') {
    return res.status(400).json({
      message: 'This route is available only for drivers!',
    });
  }
  const load = await Load.findOne({
    assigned_to: req.user.id,
    status: 'ASSIGNED',
  });

  const currentState = load.state || 'En route to pick up';
  if (loadStates.indexOf(currentState) === 2) {
    load.status = 'SHIPPED';
    return res.status(400).json({
      message: 'Load is already delivered',
    });
  }
  load.state = loadStates[loadStates.indexOf(currentState) + 1];

  await load.save({
    validateBeforeSave: false,
  });
  load.logs.push({
    message: `Load state changed to ${load.state}`,
    time: Date.now(),
  });
  await load.save({ validateBeforeSave: false });

  res.status(200).json({
    message: `Load state changed to ${load.state}`,
  });
});

exports.getLoad = catchAsync(async (req, res) => {
  if (req.user.role === 'DRIVER') {
    return res.status(400).json({
      message: 'This route is available only for shippers!',
    });
  }
  const load = await Load.findById(req.params.id);
  res.status(200).json({
    load,
  });
});

exports.updateLoad = catchAsync(async (req, res) => {
  if (req.user.role === 'DRIVER') {
    return res.status(400).json({
      message: 'This route is available only for shippers!',
    });
  }
  await Load.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    message: 'Load details changed successfully!',
  });
});

exports.deleteLoad = catchAsync(async (req, res) => {
  if (req.user.role === 'DRIVER') {
    return res.status(400).json({
      message: 'This route is available only for shippers!',
    });
  }
  await Load.findOneAndRemove({ _id: req.params.id });
  res.status(200).json({
    message: 'Load deleted successfully',
  });
});

exports.postLoad = catchAsync(async (req, res) => {
  if (req.user.role === 'DRIVER') {
    return res.status(400).json({
      message: 'This route is available only for shippers!',
    });
  }

  let driverFound = false;
  const load = await Load.findById(req.params.id);
  const truckType = findTruckType({
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    ...load.dimensions,
    payload: load.payload,
  });

  const truck = await Truck.findOne({
    status: 'IS',
    type: truckType,
    assigned_to: { $ne: null },
  });

  if (!truck) {
    load.status = 'NEW';
    return res.status(200).json({
      message: 'Could not find available trucks Try later!',
    });
  }

  load.status = 'ASSIGNED';
  load.logs.push({
    message: `Load assigned to driver with id ${truck.created_by}`,
    time: Date.now(),
  });
  load.state = 'En route to pick up';
  truck.status = 'OL';
  load.assigned_to = truck.created_by;
  driverFound = true;

  load.save({
    validateBeforeSave: false,
  });
  truck.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    message: 'Load assigned successfully!',
    driver_found: driverFound,
  });
});

exports.getShippingInfo = catchAsync(async (req, res) => {
  if (req.user.role === 'DRIVER') {
    return res.status(400).json({
      message: 'This route is available only for shippers!',
    });
  }

  const load = await Load.findOne({
    _id: req.params.id,
    status: { $ne: 'NEW' },
  });

  if (!load) {
    return res.status(400).json({
      message: 'No load found',
    });
  }
  res.status(200).json({
    load,
  });
});
