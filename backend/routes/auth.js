const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Volunteer = require('../models/Volunteer');

const JWT_SECRET = process.env.JWT_SECRET || 'sevasetu-super-secret-key-2026';

// 1. Admin Signup
router.post('/admin/signup', async (req, res) => {
    console.log('📝 Signup attempt:', req.body.email);
    try {
        const { name, email, password } = req.body;
        const existing = await Admin.findOne({ email });
        if (existing) {
            console.log('❌ Admin exists');
            return res.status(400).json({ error: 'Admin already exists' });
        }

        const admin = new Admin({ name, email, password });
        await admin.save();
        console.log('✅ Admin saved');

        const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, admin: { id: admin._id, name, email } });
    } catch (err) {
        console.error('🔥 Signup Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, admin: { id: admin._id, name: admin.name, email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Volunteer Login (using email + passkey)
router.post('/volunteer/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔑 Volunteer login attempt - email:', email, 'password:', password);
        const volunteer = await Volunteer.findOne({ email });
        console.log('👤 Volunteer found:', volunteer ? `${volunteer.name} | passkey: ${volunteer.passkey}` : 'NOT FOUND');
        if (!volunteer) {
            return res.status(401).json({ error: 'Invalid email or passkey' });
        }

        const bcrypt = require('bcryptjs');
        const isHashedMatch = volunteer.password && volunteer.password.startsWith('$2') 
            ? await bcrypt.compare(password, volunteer.password)
            : false;
        const isPlainMatch = volunteer.passkey === password;

        if (!isHashedMatch && !isPlainMatch) {
            return res.status(401).json({ error: 'Invalid email or passkey' });
        }

        const token = jwt.sign({ id: volunteer._id, role: 'volunteer' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, volunteer: { id: volunteer._id, name: volunteer.name, email: volunteer.email, volunteer_id: volunteer.volunteer_id } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
