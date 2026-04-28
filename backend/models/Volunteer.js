const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VolunteerSchema = new mongoose.Schema({
    volunteer_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String }, // Optional but added as per user request
    skills: [{ type: String }], // Array of skills
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    availability: { type: String, enum: ['available', 'busy', 'away'], default: 'available' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    password: { type: String, required: true },
    passkey: { type: String }, // Plain text for admin reference
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

VolunteerSchema.index({ location_id: 1, availability: 1 });

// Hash password before saving
VolunteerSchema.pre('save', async function() {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
VolunteerSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Volunteer', VolunteerSchema);
