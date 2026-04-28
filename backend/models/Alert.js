const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    type: { type: String, enum: ['high-priority-need', 'low-resource', 'no-resource', 'system'], required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    isRead: { type: Boolean, default: false },
    ref_id: { type: mongoose.Schema.Types.ObjectId },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

AlertSchema.index({ severity: 1, isRead: 1 });

module.exports = mongoose.model('Alert', AlertSchema);
