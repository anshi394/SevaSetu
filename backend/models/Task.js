const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    task_id: { type: String, required: true, unique: true },
    need_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Need', required: true },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
    status: { type: String, enum: ['queued', 'backlog', 'in-progress', 'completed', 'awaiting-logistics'], default: 'queued' },
    eligible_volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
    type: { type: String, required: true } // Task type matching need type
}, { timestamps: true });

TaskSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model('Task', TaskSchema);
