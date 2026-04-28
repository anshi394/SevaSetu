const mongoose = require('mongoose');

const NeedSchema = new mongoose.Schema({
    need_id: { type: String, required: true, unique: true },
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    need_type: { type: String, required: true }, // food, shelter, medical, water, etc.
    people_count: { type: Number, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

NeedSchema.index({ location_id: 1, need_type: 1, severity: 1 });

module.exports = mongoose.model('Need', NeedSchema);
