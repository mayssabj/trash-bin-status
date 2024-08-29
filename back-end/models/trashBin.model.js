const mongoose = require('mongoose');

const TrashBinSchema = mongoose.Schema({
    reference: { type: String, required: true, unique: true },
    longitude: Number,
    latitude: Number,
    height: Number,
    fillLevel: Number,
    address: String,
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('TrashBin', TrashBinSchema);
