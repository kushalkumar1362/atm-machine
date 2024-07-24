// models/seedStatus.model.js
const mongoose = require('mongoose');

const seedStatusSchema = new mongoose.Schema({
  seeded: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('SeedStatus', seedStatusSchema);
