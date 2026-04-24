const cron = require('node-cron');
const Task = require('../models/Task');
const { FocusBlock } = require('../models/Study');
const { Assignment, Project, Course } = require('../models/Course');
const { sendEmail, sendPushNotification } = require('../services/notifications');

const processReminders = async () => {
  try {
    const now = new Date();
    const msInHour = 1000 * 60 * 60;

    // Helper to process a model type
    const processModelReminders = async (Model, dateField, titlePrefix, typeLabel, idField) => {
      // Build population based on model type
      let populateQuery = { path: 'userId', select: 'email expoPushToken name' };
      
      // Assignments and Projects are linked via Course
      if (Model.modelName === 'Assignment' || Model.modelName === 'Project') {
        populateQuery = {
          path: 'courseId',
          select: 'userId',
          populate: { path: 'userId', select: 'email expoPushToken name' }
        };
      }

      const items = await Model.find({
        status: { $nin: ['Completed', 'Submitted'] },
        [dateField]: { $ne: null },
        reminderLevel: { $lt: 3 },
      }).populate(populateQuery);

      for (const item of items) {
        let user = item.userId;
        
        // If nested (Assignment/Project), user is in item.courseId.userId
        if (!user && item.courseId) {
          user = item.courseId.userId;
        }

        if (!user) continue;

        const hoursLeft = (item[dateField] - now) / msInHour;

        // ONLY notify exactly 1 hour before (within 0-1 hour window)
        if (hoursLeft > 0 && hoursLeft <= 1 && item.reminderLevel < 3) {
          const title = `${titlePrefix} ⏰`;
          const message = `Your ${typeLabel} "${item.title || item.name}" is due in less than 1 hour!`;

          if (user.expoPushToken) {
            await sendPushNotification(user.expoPushToken, title, message, { [idField]: item._id });
          }
          if (user.email) {
            await sendEmail(user.email, title, `Hi ${user.name},\n\n${message}\n\nGood luck!`);
          }

          item.reminderLevel = 3;
          await item.save();
        }
      }
    };

    // Process all types
    await processModelReminders(Task, 'parsedDeadline', 'Task Deadline Approaching', 'task', 'taskId');
    await processModelReminders(FocusBlock, 'parsedDate', 'Study Session Approaching', 'study session', 'blockId');
    await processModelReminders(Assignment, 'dueDate', 'Assignment Due Soon', 'assignment', 'assignmentId');
    await processModelReminders(Project, 'dueDate', 'Project Deadline Approaching', 'project', 'projectId');

  } catch (error) {
    console.error('Error processing reminders:', error);
  }
};

const initScheduler = () => {
  console.log('Initializing Notification Scheduler...');
  cron.schedule('*/5 * * * *', processReminders);
};

module.exports = { initScheduler };
