const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: {
      values: ['DRIVER', 'SHIPPER'],
      message: 'Role must be either: "DRIVER", "SHIPPER"',
    },
    required: [true, 'User must have a role'],
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Invalid Email'],
    required: [true, 'User must have an email address'],
    unique: [true, 'An email should be unique'],
  },
  created_date: {
    type: Date,
    default: Date.now(),
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
