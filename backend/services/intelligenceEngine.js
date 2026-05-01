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
        if (!adminId) {
            console.log('⚠️ No Admin ID provided to processNeeds');
            return;
        }
        const pendingNeeds = await Need.find({ status: 'pending', admin_id: adminId }).populate('location_id');
        console.log(`🔍 Processing ${pendingNeeds.length} pending needs for Admin: ${adminId}`);

        for (const need of pendingNeeds) {
            const needTypeClean = need.need_type.trim();
            console.log(`➡️ Processing Need: ${need.need_id} (${needTypeClean})`);
            const loc = need.location_id;
            const locationLabel = loc ? `${loc.district}, ${loc.city}` : 'Unknown Location';

            // 1. Priority Calculation
            let priority = 'low';
            if (need.severity === 'high' || need.people_count > 100) {
                priority = 'high';
            } else if (need.severity === 'medium' || need.people_count > 20) {
                priority = 'medium';
            }

            // 2. Resource Availability Check (Smart Match)
            const res = await Resource.findOne({ 
                location_id: need.location_id, 
                type: new RegExp(`^${needTypeClean}$`, 'i'), 
                admin_id: adminId 
            });
            const availableCount = res ? res.quantity : 0;

            // 3. Task Generation
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

            // 4. Try Volunteer Matching (Smart Match)
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

            // 5. CRITICAL ALERTS
            if (availableCount === 0) {
                const existingAlert = await Alert.findOne({ ref_id: need._id, type: 'no-resource', admin_id: adminId });
                if (!existingAlert) {
                    await new Alert({
                        type: 'no-resource',
                        message: `CRITICAL: No ${needTypeClean} resources available at ${locationLabel}.`,
                        severity: 'critical',
                        ref_id: need._id,
                        admin_id: adminId
                    }).save();
                }
            }

            if (priority === 'high' && !volunteer) {
                const existingAlert = await Alert.findOne({ ref_id: need._id, type: 'high-priority-need', admin_id: adminId });
                if (!existingAlert) {
                    await new Alert({
                        type: 'high-priority-need',
                        message: `CRITICAL: Unassigned High Priority Task! ${needTypeClean} required for ${need.people_count} people at ${locationLabel}.`,
                        severity: 'critical',
                        ref_id: need._id,
                        admin_id: adminId
                    }).save();
                }
            }

            need.status = 'in-progress';
            await need.save();
        }
    } catch (err) {
        console.error('Error in Intelligence Engine (processNeeds):', err);
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
            if (!task.need_id) continue;
            const need = task.need_id;
            const needTypeClean = need.need_type.trim();

            const res = await Resource.findOne({ 
                location_id: need.location_id, 
                type: new RegExp(`^${needTypeClean}$`, 'i'), 
                admin_id: adminId 
            });
            const availableCount = res ? res.quantity : 0;

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
            } else {
                // Update eligible volunteer even if no resources yet
                const bestV = await findBestVolunteer(need, adminId);
                if (bestV) {
                    task.eligible_volunteer = bestV._id;
                    await task.save();
                }
            }
        }
    } catch (err) {
        console.error('Error in assignVolunteersToTasks:', err);
    }
};

const findBestVolunteer = async (need, adminId) => {
    const needTypeClean = need.need_type.trim();
    console.log(`👤 Searching volunteer for: ${needTypeClean} in ${need.location_id}`);
    
    // Find volunteer with case-insensitive skill matching
    const v = await Volunteer.findOne({
        admin_id: adminId,
        location_id: need.location_id,
        availability: 'available',
        status: 'active',
        skills: { $in: [new RegExp(`^${needTypeClean}$`, 'i')] }
    });
    
    if (v) console.log(`✅ Found Volunteer: ${v.name}`);
    return v;
};

module.exports = { processNeeds, assignVolunteersToTasks };
