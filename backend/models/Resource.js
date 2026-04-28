const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    resource_id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    status: { type: String, enum: ['available', 'low', 'out'], default: 'available' },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

ResourceSchema.index({ location_id: 1, type: 1 });

module.exports = mongoose.model('Resource', ResourceSchema);
