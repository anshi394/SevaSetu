const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Need = require('../models/Need');
const Volunteer = require('../models/Volunteer');
const Facility = require('../models/Facility');
const Resource = require('../models/Resource');
const Task = require('../models/Task');
const Alert = require('../models/Alert');

// Protect all routes
router.use(auth('admin'));

const getPaginatedData = async (model, query, page, limit, populate = '') => {
    const skip = (page - 1) * limit;
    const data = await model.find(query)
        .populate(populate)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await model.countDocuments(query);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
};

// Needs with filters
router.get('/needs', async (req, res) => {
    const { page = 1, limit = 10, severity, need_type } = req.query;
    const query = { admin_id: req.admin.id };
    if (severity) query.severity = severity;
    if (need_type) query.need_type = need_type;
    
    try {
        const result = await getPaginatedData(Need, query, parseInt(page), parseInt(limit), 'location_id');
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Volunteers
router.get('/volunteers', async (req, res) => {
    const { page = 1, limit = 10, availability } = req.query;
    const query = { admin_id: req.admin.id };
    if (availability) query.availability = availability;
    
    try {
        const result = await getPaginatedData(Volunteer, query, parseInt(page), parseInt(limit), 'location_id');
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Facilities
router.get('/facilities', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const result = await getPaginatedData(Facility, { admin_id: req.admin.id }, parseInt(page), parseInt(limit), 'location_id');
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Resources
router.get('/resources', async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const query = { admin_id: req.admin.id };
    if (status) query.status = status;
    
    try {
        const result = await getPaginatedData(Resource, query, parseInt(page), parseInt(limit), 'location_id');
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tasks
router.get('/tasks', async (req, res) => {
    const { page = 1, limit = 10, priority, status } = req.query;
    const query = { admin_id: req.admin.id };
    if (priority) query.priority = priority;
    if (status) query.status = status;
    
    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const data = await Task.find(query)
            .populate({
                path: 'need_id',
                populate: { path: 'location_id' }
            })
            .populate('assigned_to')
            .populate('eligible_volunteer')
            .sort({ 
                assigned_to: -1, // Shows assigned tasks at the top
                createdAt: -1    // Then newest first
            })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Task.countDocuments(query);
        res.json({ data, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Alerts
router.get('/alerts', async (req, res) => {
    try {
        const alerts = await Alert.find({ admin_id: req.admin.id, isRead: false }).sort({ createdAt: -1 }).limit(20);
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark Alert as Read (Dismiss)
router.put('/alerts/:id/read', async (req, res) => {
    try {
        await Alert.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: 'Alert dismissed.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const adminObjectId = new mongoose.Types.ObjectId(req.admin.id);
        const query = { admin_id: req.admin.id };
        const totalNeeds = await Need.countDocuments(query);
        const highPriorityNeeds = await Need.countDocuments({ ...query, severity: 'high' });
        const activeTasks = await Task.countDocuments({ ...query, status: { $in: ['queued', 'in-progress'] } });
        const totalVolunteers = await Volunteer.countDocuments({ ...query, availability: 'available' });

        // Task Priority Distribution
        const taskPriorityDistribution = [
            { name: 'High', count: await Task.countDocuments({ ...query, priority: 'high' }) },
            { name: 'Medium', count: await Task.countDocuments({ ...query, priority: 'medium' }) },
            { name: 'Low', count: await Task.countDocuments({ ...query, priority: 'low' }) },
        ];

        // Need Trends - group by need_type (more useful since bulk uploads happen on same day)
        const needTypeBreakdown = await Need.aggregate([
            { $match: { admin_id: adminObjectId } },
            { $group: { _id: '$need_type', count: { $sum: 1 }, totalPeople: { $sum: '$people_count' } } },
            { $sort: { count: -1 } }
        ]);
        const needTrends = needTypeBreakdown.map(t => ({ 
            name: t._id ? t._id.charAt(0).toUpperCase() + t._id.slice(1) : 'Unknown', 
            count: t.count,
            people: t.totalPeople || 0
        }));

        // Also compute daily trends for the line chart (last 30 days to catch bulk uploads)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyTrends = await Need.aggregate([
            { $match: { admin_id: adminObjectId, createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $dateToString: { format: "%m/%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
        ]);
        const dailyNeedTrends = dailyTrends.map(t => ({ name: t._id, count: t.count }));

        res.json({
            totalNeeds,
            highPriorityNeeds,
            activeTasks,
            totalVolunteers,
            taskPriorityDistribution,
            needTrends,           // by type (for bar chart)
            dailyNeedTrends       // by date (for line chart)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Routes
router.delete('/needs/:id', async (req, res) => {
    try {
        await Need.findOneAndDelete({ _id: req.params.id, admin_id: req.admin.id });
        await Task.deleteMany({ need_id: req.params.id, admin_id: req.admin.id }); 
        res.json({ message: 'Need and associated tasks deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/volunteers/:id', async (req, res) => {
    try {
        const volunteer = await Volunteer.findOneAndDelete({ _id: req.params.id, admin_id: req.admin.id });
        if (volunteer) {
            // Unassign tasks
            await Task.updateMany({ assigned_to: req.params.id, admin_id: req.admin.id }, { assigned_to: null, status: 'queued' });
        }
        res.json({ message: 'Volunteer deleted and tasks unassigned.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/facilities/:id', async (req, res) => {
    try {
        await Facility.findOneAndDelete({ _id: req.params.id, admin_id: req.admin.id });
        res.json({ message: 'Facility deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/resources/:id', async (req, res) => {
    try {
        await Resource.findOneAndDelete({ _id: req.params.id, admin_id: req.admin.id });
        res.json({ message: 'Resource deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, admin_id: req.admin.id });
        if (task && task.assigned_to) {
            await Volunteer.findOneAndUpdate({ _id: task.assigned_to, admin_id: req.admin.id }, { availability: 'available' });
        }
        await Task.findOneAndDelete({ _id: req.params.id, admin_id: req.admin.id });
        res.json({ message: 'Task deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/alerts/:id', async (req, res) => {
    try {
        await Alert.findOneAndDelete({ _id: req.params.id, admin_id: req.admin.id });
        res.json({ message: 'Alert deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RESET SYSTEM (Delete All Data)
router.post('/reset', async (req, res) => {
    try {
        const query = { admin_id: req.admin.id };
        await Need.deleteMany(query);
        await Volunteer.deleteMany(query);
        await Facility.deleteMany(query);
        await Resource.deleteMany(query);
        await Task.deleteMany(query);
        await Alert.deleteMany(query);
        res.json({ message: 'System reset successfully. Your data has been cleared.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// MANUAL RE-ASSIGNMENT TRIGGER
router.post('/reassign', async (req, res) => {
    try {
        const { assignVolunteersToTasks } = require('../services/intelligenceEngine');
        assignVolunteersToTasks();
        res.json({ message: 'Re-assignment engine triggered.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
