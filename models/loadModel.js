const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  created_by: {
    type: String,
  },
  assigned_to: {
    type: String,
  },
  status: {
    type: String,
    enum: {
      values: ['NEW', 'POSTED', 'ASSIGNED', 'SHIPPED'],
      message: 'Load status must be either: NEW, POSTED, ASSIGNED, SHIPPED',
    },
    default: 'NEW',
  },
  state: {
    type: String,
    enum: {
      values: [
        'En route to Pick Up',
        'Arrived to Pick Up',
        'En route to delivery',
      ],
      message:
        'Load state must be either: En route to Pick Up, Arrived to Pick Up, En route to delivery, Arrived to delivery',
    },
  },
  name: {
    type: String,
    minlength: [2, 'A tour name must have minimum 2 characters'],
    required: [true, 'Load must have a name'],
  },
  payload: {
    type: Number,
    required: [true, 'Load must have payload'],
  },
  pickup_address: {
    type: String,
    required: [true, 'Load must have pick-up address'],
  },
  delivery_address: {
    type: String,
    required: [true, 'Load must have delivery-up address'],
  },
  dimensions: {
    width: {
      type: Number,
    },
    length: {
      type: Number,
    },
    height: {
      type: Number,
    },
  },
  logs: [{ message: String, time: Date }],
  created_date: {
    type: Date,
    default: Date.now(),
  },
});

const Load = mongoose.model('Load', loadSchema);

module.exports = Load;
