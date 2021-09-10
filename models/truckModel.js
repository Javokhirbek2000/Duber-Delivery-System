const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  created_by: {
    type: String,
  },
  assigned_to: {
    type: String,
  },
  type: {
    type: String,
    enum: {
      values: ['SPRINTER', 'SMALL STRAIGHT', 'LARGE STRAIGHT'],
      message: 'Type must be either SPRINTER, SMALL STRAIGHT, LARGE STRAIGHT',
    },
    required: [true, 'Truck must have type'],
  },
  status: {
    type: String,
    enum: {
      values: ['OL', 'IS'],
      message: 'Truck status must be either OL(onload), IS(in service)',
    },
    default: 'IS',
  },
  created_date: {
    type: Date,
    default: Date.now(),
  },
});

const Truck = mongoose.model('Truck', truckSchema);
module.exports = Truck;
