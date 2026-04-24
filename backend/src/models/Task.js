const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  title:    { type: String, required: true },
  details:  { type: String, default: '' },
  deadline: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status:   { type: String, enum: ['Not started', 'Doing', 'Completed'], default: 'Not started' },
  parsedDeadline: { type: Date, default: null },
  reminderLevel: { type: Number, default: 0 }, // 0: None, 1: 12h, 2: 5h, 3: 1h
  completedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);


