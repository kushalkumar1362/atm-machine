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
  },
  failedAttempts: {
    type: Number,
    default: 0,
  },
  blockUntil: {
    type: Date
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  }]
});

module.exports = mongoose.model('Account', accountSchema);

