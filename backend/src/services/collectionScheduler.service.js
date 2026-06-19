const cron = require('node-cron');
const Apartment = require('../models/Apartment');
const Collection = require('../models/Collection');
const logger = require('../utils/logger');
const User = require('../models/User');
const notificationService = require('../services/notification.service');
const config = require('../config');

/** Helper to parse HH:MM time string */
const parseTime = (timeStr) => {
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10) || 0;
  const minute = parseInt(minuteStr, 10) || 0;
  return { hour, minute };
};

/** Determine whether a collection should be scheduled for a given apartment on a target date */
const shouldSchedule = (apartment, targetDate) => {
  const schedule = apartment.collectionSchedule;
  if (!schedule) return false;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[targetDate.getDay()];

  const freq = schedule.frequency;

  // Custom special dates take precedence
  if (freq === 'custom' && Array.isArray(schedule.specialDates)) {
    const match = schedule.specialDates.find((d) => {
      const sd = new Date(d.date);
      return sd.toDateString() === targetDate.toDateString();
    });
    return !!match;
  }

  switch (freq) {
    case 'daily':
      return true;
    case 'every_other_day': {
      // Use apartment creation date as reference
      const diffDays = Math.floor((targetDate - apartment.createdAt) / (1000 * 60 * 60 * 24));
      return diffDays % 2 === 0;
    }
    case 'weekly':
      return schedule.days && schedule.days.includes(dayName);
    case 'biweekly': {
      if (!schedule.days) return false;
      // Determine week difference from creation
      const diffWeeks = Math.floor((targetDate - apartment.createdAt) / (1000 * 60 * 60 * 24 * 7));
      return diffWeeks % 2 === 0 && schedule.days.includes(dayName);
    }
    default:
      return false;
  }
};

/** Create a collection entry for the given apartment on target date (if not existing) */
const createCollectionIfNeeded = async (apartment, targetDate) => {
  if (!apartment.wasteCollector) {
    // No collector assigned – skip scheduling
    return;
  }

  // Normalise the target date to the time defined in schedule
  const { hour, minute } = parseTime(apartment.collectionSchedule.time || '08:00');
  const scheduledDate = new Date(targetDate);
  scheduledDate.setHours(hour, minute, 0, 0);
  // Define day boundaries for overload / duplicate checks
  const dayStart = new Date(scheduledDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(scheduledDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Check for overload for the assigned collector
  if (apartment.wasteCollector) {

    const assignedCount = await Collection.countDocuments({
      wasteCollector: apartment.wasteCollector,
      scheduledDate: { $gte: dayStart, $lt: dayEnd },
    });
    const maxPerDay = config.maxCollectionsPerCollectorDay || 10;
    if (assignedCount >= maxPerDay) {
      logger.warn(`Collector ${apartment.wasteCollector} overloaded (${assignedCount}/${maxPerDay}) on ${scheduledDate.toDateString()}, searching for alternative collector`);
      // Find another collector with fewer assignments
      const otherCollector = await User.findOne({ role: 'waste_collector' }).sort({ _id: 1 }); // placeholder: just pick any
      if (otherCollector && otherCollector._id.toString() !== apartment.wasteCollector.toString()) {
        logger.info(`Reassigning collection to collector ${otherCollector._id}`);
        apartment.wasteCollector = otherCollector._id; // reassign for this schedule
      } else {
        logger.error(`No available collector found for apartment ${apartment._id} on ${scheduledDate.toDateString()}, skipping schedule`);
        return; // skip scheduling due to overload
      }
    }
  }

  // Check for existence (same apartment and same scheduled date day)
  const existing = await Collection.findOne({
    apartment: apartment._id,
    scheduledDate: { $gte: dayStart, $lt: dayEnd },
  });

  if (existing) return; // already scheduled for that day

  const collection = new Collection({
    apartment: apartment._id,
    wasteCollector: apartment.wasteCollector,
    status: 'scheduled',
    scheduledDate,
  });
  await collection.save();
  logger.info(`Scheduled collection for apartment ${apartment._id} on ${scheduledDate.toISOString()}`);

  // Create notification for the collector
  if (apartment.wasteCollector) {
    await notificationService.createNotification({
      user: apartment.wasteCollector,
      type: 'collection_reminder',
      title: 'New Collection Assignment',
      message: `You have a scheduled collection for ${apartment.name} on ${scheduledDate.toLocaleString()}.`,
    });
  }
};

/** Core scheduler that runs daily and creates tomorrow's collections */
const runScheduler = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const apartments = await Apartment.find({ isActive: true });
  for (const apt of apartments) {
    if (shouldSchedule(apt, tomorrow)) {
      try {
        await createCollectionIfNeeded(apt, tomorrow);
      } catch (err) {
        logger.error('Failed to schedule collection for apartment %s: %s', apt._id, err.message);
      }
    }
  }
};

/** Start the cron job (runs at 02:00 server time every day) */
const start = () => {
  // Run once at startup to ensure next day is scheduled (useful for dev)
  runScheduler().catch((e) => logger.error('Initial collection scheduling error: %s', e.message));

  cron.schedule('0 2 * * *', async () => {
    logger.info('Running daily collection scheduler');
    try {
      await runScheduler();
      logger.info('Daily collection scheduling completed');
    } catch (err) {
      logger.error('Collection scheduler failed: %s', err.message);
    }
  });
};

module.exports = { start };
