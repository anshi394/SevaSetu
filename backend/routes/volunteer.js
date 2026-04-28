const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Resource = require('../models/Resource');
const Facility = require('../models/Facility');
const Volunteer = require('../models/Volunteer');

// Protect all volunteer routes
router.use(auth('volunteer'));

// 1. Get assigned tasks for current volunteer
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({ assigned_to: req.admin.id })
            .populate({
                path: 'need_id',
                populate: { path: 'location_id' }
            });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Complete Task and Update Resources/Facilities
router.post('/tasks/:id/complete', async (req, res) => {
    try {
        const { resourcesUsed, facilityUpdates } = req.body;
        const task = await Task.findOne({ _id: req.params.id, assigned_to: req.admin.id }).populate('need_id');
        if (!task) return res.status(404).json({ error: 'Task not found or not assigned to you' });

        // Update Resources
        if (resourcesUsed && resourcesUsed.length > 0) {
            for (const item of resourcesUsed) {
                await Resource.findOneAndUpdate(
                    { type: item.type, location_id: task.need_id.location_id, admin_id: task.admin_id },
                    { $inc: { quantity: -item.quantity } }
                );
            }
        }

        // Update Facilities
        if (facilityUpdates && facilityUpdates.length > 0) {
            for (const item of facilityUpdates) {
                await Facility.findOneAndUpdate(
                    { type: item.type, location_id: task.need_id.location_id, admin_id: task.admin_id },
                    { $inc: { occupancy: item.occupancyChange } }
                );
            }
        }

        task.status = 'completed';
        await task.save();

        // Update Volunteer Availability
        await Volunteer.findByIdAndUpdate(req.admin.id, { availability: 'available' });

        res.json({ message: 'Task completed and resources updated.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
