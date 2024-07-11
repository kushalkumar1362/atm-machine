const mongoose = require('mongoose');
const ATMSchema = new mongoose.Schema({
  notes: {
    10: {
      type: Number,
      default: 0,
    },
    20: {
      type: Number,
      default: 0,
    },
    50: {
      type: Number,
      default: 0,
    },
    100: {
      type: Number,
      default: 0,
    },
    200: {
      type: Number,
      default: 0,
    },
    500: {
      type: Number,
      default: 0,
    },
    1000: {
      type: Number,
      default: 0,
    },
  }
});
module.exports = mongoose.model('ATM', ATMSchema);