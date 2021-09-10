/* eslint-disable node/no-unsupported-features/es-syntax */
const Truck = require('../models/truckModel');
const catchAsync = require('../utils/catchAsync');

exports.getUsersTrucks = catchAsync(async (req, res) => {
  const trucks = await Truck.find({ created_by: req.user.id });
  res.status(200).json({
    trucks,
  });
});

exports.addTruck = catchAsync(async (req, res) => {
  if (!req.body.type) {
    return res.status(200).json({
      message: 'A truck must have a type',
    });
  }

  const newTruck = await Truck.create({
    ...req.body,
    created_by: req.user.id,
  });

  res.status(200).json({
    message: 'New truck has been created successfully!',
    newTruck,
  });
});

exports.getTruck = catchAsync(async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({
      message: 'Invalid truck ID',
    });
  }
  const truck = await Truck.findOne({ id: req.params.id });

  res.status(200).json({
    truck,
  });
});

exports.updateTruck = catchAsync(async (req, res) => {
  const newType = req.body.type;

  if (!newType) {
    return res.status(400).json({
      message: 'Type must be specified',
    });
  }
  const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!truck) {
    return res.status(400).json({
      message: 'No truck with such ID',
    });
  }

  res.status(200).json({
    message: 'Truck updated successfully',
    truck,
  });
});

exports.deleteTruck = catchAsync(async (req, res) => {
  await Truck.findByIdAndRemove(req.params.id);
  res.status(200).json({
    message: 'Truck deleted successfully!',
  });
});

exports.assignTruck = catchAsync(async (req, res) => {
  const truck = await Truck.findByIdAndUpdate(
    req.params.id,
    { assigned_to: req.user.id },
    {
      runValidators: true,
      new: true,
    }
  );

  res.status(200).json({
    message: 'Truck assigned successfully!',
    truck,
  });
});
