const Need = require('../models/Need');
const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');
const Resource = require('../models/Resource');
const Alert = require('../models/Alert');
const Location = require('../models/Location');

// ------------------------------------------------------------------
// Main entry point: called after Needs are uploaded or manually added
// ------------------------------------------------------------------
const processNeeds = async (adminId) => {
    try {
        if (!adminId) return;
        const pendingNeeds = await Need.find({ status: 'pending', admin_id: adminId }).populate('location_id');
        
        for (const need of pendingNeeds) {
            const needTypeClean = need.need_type.trim();
            const needLoc = need.location_id;
            if (!needLoc) continue;

            // 1. Priority Calculation
            let priority = 'low';
            if (need.severity === 'high' || need.people_count > 100) priority = 'high';
            else if (need.severity === 'medium' || need.people_count > 20) priority = 'medium';

            // 2. Resource Availability Check (Smart Match by City Name)
            const allResources = await Resource.find({ admin_id: adminId, type: new RegExp(`^${needTypeClean}$`, 'i') }).populate('location_id');
            const matchingResource = allResources.find(r => 
                r.location_id && 
                r.location_id.city.toLowerCase() === needLoc.city.toLowerCase() &&
                r.location_id.district.toLowerCase() === needLoc.district.toLowerCase()
            );
            const availableCount = matchingResource ? matchingResource.quantity : 0;

            // 3. Task Generation/Update
            let task = await Task.findOne({ need_id: need._id, admin_id: adminId });
            if (!task) {
                const taskId = `TASK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                task = new Task({
                    task_id: taskId,
                    need_id: need._id,
                    priority,
                    admin_id: adminId,
                    status: priority === 'high' ? 'queued' : 'backlog',
                    type: needTypeClean
                });
            }

            // 4. Try Volunteer Matching (Smart Match by City Name)
            const volunteer = await findBestVolunteer(need, adminId);
            
            if (volunteer) {
                task.eligible_volunteer = volunteer._id;
                if (availableCount > 0) {
                    task.assigned_to = volunteer._id;
                    task.status = 'in-progress';
                    volunteer.availability = 'busy';
                    await volunteer.save();
                } else {
                    task.status = 'awaiting-logistics';
                    task.assigned_to = null; 
                }
            } else {
                task.status = priority === 'high' ? 'queued' : 'backlog';
            }

            await task.save();
            need.status = 'in-progress';
            await need.save();
        }
    } catch (err) {
        console.error('Error in processNeeds:', err);
    }
};

const assignVolunteersToTasks = async (adminId) => {
    try {
        if (!adminId) return;
        const unassignedTasks = await Task.find({
            admin_id: adminId,
            status: { $in: ['queued', 'backlog', 'awaiting-logistics'] }
        }).populate({
            path: 'need_id',
            populate: { path: 'location_id' }
        });

        for (const task of unassignedTasks) {
            if (!task.need_id || !task.need_id.location_id) continue;
            const need = task.need_id;
            const needTypeClean = need.need_type.trim();
            const needLoc = need.location_id;

            // Find resource by city name
            const allResources = await Resource.find({ admin_id: adminId, type: new RegExp(`^${needTypeClean}$`, 'i') }).populate('location_id');
            const matchingResource = allResources.find(r => 
                r.location_id && 
                r.location_id.city.toLowerCase() === needLoc.city.toLowerCase() &&
                r.location_id.district.toLowerCase() === needLoc.district.toLowerCase()
            );
            const availableCount = matchingResource ? matchingResource.quantity : 0;

            const volunteer = await findBestVolunteer(need, adminId);
            if (volunteer) {
                task.eligible_volunteer = volunteer._id;
                if (availableCount > 0) {
                    task.assigned_to = volunteer._id;
                    task.status = 'in-progress';
                    volunteer.availability = 'busy';
                    await volunteer.save();
                    await task.save();
                    await Alert.deleteOne({ ref_id: need._id, admin_id: adminId });
                } else {
                    task.status = 'awaiting-logistics';
                    await task.save();
                }
            }
        }
    } catch (err) {
        console.error('Error in assignVolunteersToTasks:', err);
    }
};

const findBestVolunteer = async (need, adminId) => {
    if (!need.location_id) return null;
    const needTypeClean = need.need_type.trim();
    const needLoc = need.location_id;

    // Find all active volunteers for this admin with matching skills
    const candidates = await Volunteer.find({
        admin_id: adminId,
        availability: 'available',
        status: 'active',
        skills: { $in: [new RegExp(`^${needTypeClean}$`, 'i')] }
    }).populate('location_id');

    // Filter by City Name match (case-insensitive)
    const bestMatch = candidates.find(v => 
        v.location_id && 
        v.location_id.city.toLowerCase() === needLoc.city.toLowerCase() &&
        v.location_id.district.toLowerCase() === needLoc.district.toLowerCase()
    );

    return bestMatch || null;
};

module.exports = { processNeeds, assignVolunteersToTasks };
