const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true
  },
  pin: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Account', accountSchema);

