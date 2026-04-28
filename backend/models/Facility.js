const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema({
    facility_id: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // e.g., clinic, shelter, school
    capacity: { type: Number, required: true },
    occupancy: { type: Number, default: 0 },
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

FacilitySchema.index({ location_id: 1, type: 1 });

module.exports = mongoose.model('Facility', FacilitySchema);
