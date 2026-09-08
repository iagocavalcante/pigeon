const mongoose = require('mongoose');

const Setting = mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Setting', Setting);
