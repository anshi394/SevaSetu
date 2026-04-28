const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    state: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true }
}, { timestamps: true });

LocationSchema.index({ state: 1, city: 1, district: 1 }, { unique: true });

module.exports = mongoose.model('Location', LocationSchema);
