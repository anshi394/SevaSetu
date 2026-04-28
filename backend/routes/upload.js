const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Location = require('../models/Location');
const Need = require('../models/Need');
const Volunteer = require('../models/Volunteer');
const Facility = require('../models/Facility');
const Resource = require('../models/Resource');
const { processNeeds, assignVolunteersToTasks } = require('../services/intelligenceEngine');

const auth = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

// Protect all upload routes
router.use(auth('admin'));

// Helper to get location ID
const getLocationId = async (state, city, district) => {
    let loc = await Location.findOne({ state, city, district });
    if (!loc) {
        loc = new Location({ state, city, district });
        await loc.save();
    }
    return loc._id;
};

// Smart CSV Processor with header detection
const processCSV = (path, originalTarget, adminId) => {
    return new Promise((resolve, reject) => {
        const results = [];
        let detectedTarget = null;
        
        fs.createReadStream(path)
            .pipe(csv())
            .on('headers', (headers) => {
                if (headers.includes('need_id')) detectedTarget = 'needs';
                else if (headers.includes('volunteer_id')) detectedTarget = 'volunteers';
                else if (headers.includes('facility_id')) detectedTarget = 'facilities';
                else if (headers.includes('resource_id')) detectedTarget = 'resources';
            })
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', async () => {
                try {
                    const targetType = detectedTarget || originalTarget;
                    
                    for (const row of results) {
                        const locId = await getLocationId(row.state, row.city, row.district);
                        
                        const baseData = { ...row, location_id: locId, admin_id: adminId };

                        if (targetType === 'needs') {
                            await Need.findOneAndUpdate({ need_id: row.need_id, admin_id: adminId }, {
                                ...baseData, people_count: parseInt(row.people_count),
                                severity: row.severity?.trim().toLowerCase(), status: 'pending'
                            }, { upsert: true });
                        } else if (targetType === 'volunteers') {
                            await Volunteer.findOneAndUpdate({ volunteer_id: row.volunteer_id, admin_id: adminId }, {
                                ...baseData, skills: row.skills?.split(',').map(s => s.trim()),
                                email: row.email,
                                password: 'Volunteer123',
                                passkey: 'Volunteer123' // Default passkey for CSV uploads
                            }, { upsert: true });
                        } else if (targetType === 'facilities') {
                            await Facility.findOneAndUpdate({ facility_id: row.facility_id, admin_id: adminId }, {
                                ...baseData, capacity: parseInt(row.capacity), occupancy: parseInt(row.occupancy || 0)
                            }, { upsert: true });
                        } else if (targetType === 'resources') {
                            await Resource.findOneAndUpdate({ resource_id: row.resource_id, admin_id: adminId }, {
                                ...baseData, quantity: parseInt(row.quantity)
                            }, { upsert: true });
                        }
                    }

                    if (targetType === 'needs') processNeeds(adminId);
                    if (targetType === 'volunteers') assignVolunteersToTasks(adminId);

                    fs.unlinkSync(path);
                    resolve(targetType);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', reject);
    });
};

// CSV Upload Routes
router.post('/needs', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const finalType = await processCSV(req.file.path, 'needs', req.admin.id);
        res.json({ message: `File processed as ${finalType}.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/volunteers', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const finalType = await processCSV(req.file.path, 'volunteers', req.admin.id);
        res.json({ message: `File processed as ${finalType}.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/facilities', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const finalType = await processCSV(req.file.path, 'facilities', req.admin.id);
        res.json({ message: `File processed as ${finalType}.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/resources', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const finalType = await processCSV(req.file.path, 'resources', req.admin.id);
        res.json({ message: `File processed as ${finalType}.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manual Entry Routes (Text)
router.post('/manual/:type', async (req, res) => {
    const { type } = req.params;
    const admin_id = req.admin.id;
    try {
        const locId = await getLocationId(req.body.state, req.body.city, req.body.district);
        const data = { ...req.body, location_id: locId, admin_id };

        if (type === 'need') {
            const need_id = `NEED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            await new Need({ ...data, need_id, status: 'pending' }).save();
            processNeeds(admin_id);
        } else if (type === 'volunteer') {
            const volunteer_id = `VOL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const passkey = data.password || Math.random().toString(36).substring(2, 10).toUpperCase();
            const skillsArr = data.skills ? data.skills.split(',').map(s => s.trim()) : [];
            const v = new Volunteer({ ...data, volunteer_id, skills: skillsArr, password: passkey, passkey, admin_id });
            await v.save();
            assignVolunteersToTasks(admin_id);
            return res.json({ message: 'Volunteer added successfully', passkey });
        } else if (type === 'facility') {
            await new Facility(data).save();
        } else if (type === 'resource') {
            await new Resource(data).save();
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        res.json({ message: `${type} added successfully.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
