const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  courseId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:            { type: String, required: true },
  description:      { type: String, default: '' },
  problemStatement: { type: String, default: '' },
  content:          { type: String, default: '' },
  wordCount:        { type: Number, default: 0 },
  status:           { type: String, enum: ['Submitted', 'Not Submitted'], default: 'Not Submitted' },
  dueDate:          { type: Date },
  lastEdited:       { type: Date, default: Date.now },
  pdfUrl:           { type: String, default: '' },
  completedAt:      { type: Date, default: null },
  reminderLevel:    { type: Number, default: 0 }, // 0: None, 3: 1h
}, { timestamps: true });

const NoteSchema = new mongoose.Schema({
  courseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  heading:    { type: String, required: true },
  content:    { type: String, default: '' },
  lastEdited: { type: Date, default: Date.now },
  pdfUrl:     { type: String, default: '' },
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  courseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  name:       { type: String, required: true },
  techStack:  { type: String, default: '' },
  details:    { type: String, default: '' },
  status:     { type: String, enum: ['In Progress', 'Completed', 'Pending'], default: 'In Progress' },
  progress:   { type: Number, default: 0 },
  tasks:      [{
    id:        { type: String },
    title:     { type: String },
    completed: { type: Boolean, default: false },
    dueDate:   { type: Date }
  }],
  lastEdited: { type: Date, default: Date.now },
  pdfUrl:     { type: String, default: '' },
  completedAt: { type: Date, default: null },
  reminderLevel: { type: Number, default: 0 }, // 0: None, 3: 1h
}, { timestamps: true });

const CourseSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  instructor:  { type: String, default: '' },
  totalHours:  { type: Number, default: 0 },
  credits:     { type: Number, default: 0 },
  tag:         { type: String, enum: ['Self', 'College', 'Online Course', 'Certification', 'Personal Learning'], default: 'College' },
  progress:    { type: Number, default: 0, min: 0, max: 100 },
  courseLink:  { type: String, default: '' },
  label:       { type: String, default: '' },
  labelColor:  { type: String, default: '' },
  durationValue:{ type: String, default: '' },
  durationUnit: { type: String, default: 'hours' },
  courseEndDate: { type: String, default: '' },
}, { timestamps: true });

module.exports = {
  Course:     mongoose.model('Course', CourseSchema),
  Assignment: mongoose.model('Assignment', AssignmentSchema),
  Note:       mongoose.model('Note', NoteSchema),
  Project:    mongoose.model('Project', ProjectSchema),
};
