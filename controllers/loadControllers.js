const Load = require('../models/loadModel');
const Truck = require('../models/truckModel');
const catchAsync = require('../utils/catchAsync');
const loadStates = require('../utils/loadStates');
const findTruckType = require('../utils/findTruckType');

exports.getUsersLoads = catchAsync(async (req, res) => {
  const { limit, offset, status } = req.query;

  console.log(req.user);
  let loads;
  if (req.user.role === 'DRIVER') {
    loads = await Load.find(
      { assigned_to: req.user.id, status: status },
      {},
      { skip: +offset || 0, limit: +limit || 0 }
    );
  } else if (req.user.role === 'SHIPPER') {
    loads = await Load.find(
      { created_by: req.user.id },
      {},
      { skip: +offset || 0, limit: +limit || 0 }
    );
  }

  res.status(200).json({
    loads,
  });
});

exports.addLoad = catchAsync(async (req, res) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  const newLoad = await Load.create({ ...req.body, created_by: req.user.id });
  res.status(200).json({
    message: 'Load created successfully',
    newLoad,
  });
});

exports.getActiveLoads = catchAsync(async (req, res) => {
  if (!req.user.role === 'DRIVER') {
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
  const load = await Load.findOne({
    assigned_to: req.user.id,
    status: 'ASSIGNED',
  });

  const currentState = load.state || 'En route to pick up';
  if (loadStates.indexOf(currentState === 2)) {
    return res.status(400).json({
      message: 'Load is delivered',
    });
  }
  load.state = loadStates[loadStates.indexOf(currentState) + 1];

  await load.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    message: `Load state changed to ${load.state}`,
  });
});

exports.getLoad = catchAsync(async (req, res) => {
  const load = await Load.findById(req.params.id);
  res.status(200).json({
    load,
  });
});

exports.updateLoad = catchAsync(async (req, res) => {
  const newLoad = await Load.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    message: 'Load updated successfully!',
    newLoad,
  });
});

exports.deleteLoad = catchAsync(async (req, res) => {
  await Load.findOneAndRemove(req.params.id);
  res.status(200).json({
    message: 'Load deleted successfully',
  });
});

exports.postLoad = catchAsync(async (req, res) => {
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
  truck.status = 'IS';
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
  res.status(200).json({
    message: 'This controller is not ready yet!',
  });
});
