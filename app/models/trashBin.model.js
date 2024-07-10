const mongoose = require('mongoose');

const TrashBinSchema = mongoose.Schema({
  reference: String,
  longitude: Number,
  latitude: Number,
  height: Number,
  fillLevel: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('TrashBin', TrashBinSchema);
