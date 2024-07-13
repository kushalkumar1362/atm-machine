const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true
  },
  withdrawalAmount: {
    type: Number,
    required: true
  },
  notesDispensed: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
