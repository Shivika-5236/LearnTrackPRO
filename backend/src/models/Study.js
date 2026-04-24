const mongoose = require('mongoose');

const FocusBlockSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  details:     { type: String, default: '' },
  courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  day:         { type: String, default: '' },
  date:        { type: String, default: '' },
  time:        { type: String, default: '' },
  duration:    { type: Number, default: 0 },
  color:       { type: String, default: '#6C63FF' },
  subjectLabel: { type: String, default: null },
  subjectColor: { type: String, default: null },
  subjectIcon:  { type: String, default: null },
  isActive:    { type: Boolean, default: false },
  isPaused:    { type: Boolean, default: false },
  elapsedTime: { type: Number, default: 0 },
  flaggedTimes:{ type: [Number], default: [] },
  pdfUri:      { type: String, default: null },
  pdfName:     { type: String, default: null },
  tasks:       [{
    text:      { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  parsedDate:  { type: Date, default: null },
  reminderLevel: { type: Number, default: 0 }, // 0: None, 1: 12h, 2: 5h, 3: 1h
}, { timestamps: true });

FocusBlockSchema.pre('save', function(next) {
  if (this.isModified('date') || this.isModified('time') || !this.parsedDate) {
    if (this.date && this.time) {
      try {
        const [year, month, day] = this.date.split('-').map(Number);
        const [timePart, modifier] = this.time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        this.parsedDate = new Date(year, month - 1, day, hours, minutes);
      } catch (e) {
        console.error('Error parsing FocusBlock date/time:', e);
      }
    }
  }
  next();
});

const StudySessionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:      { type: String, required: true },
  courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  duration:    { type: String, default: '' },
  focus:       { type: String, default: '' },
  loggedAt:    { type: String, default: '' },
  color:       { type: String, default: '#6C63FF' },
  sessionDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = {
  FocusBlock:   mongoose.model('FocusBlock', FocusBlockSchema),
  StudySession: mongoose.model('StudySession', StudySessionSchema),
};
