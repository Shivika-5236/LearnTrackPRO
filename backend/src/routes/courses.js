const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Course, Assignment, Note, Project } = require('../models/Course');
const multer = require('multer');
const PDFDocument = require('pdfkit');

const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

// ── Courses ──────────────────────────────────────────────────

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Attach sub-documents
    const result = await Promise.all(courses.map(async (c) => {
      const [assignments, notes, projects] = await Promise.all([
        Assignment.find({ courseId: c._id }).sort({ createdAt: -1 }),
        Note.find({ courseId: c._id }).sort({ createdAt: -1 }),
        Project.find({ courseId: c._id }).sort({ createdAt: -1 }),
      ]);

      const mapWithId = (items) => items.map(item => ({ ...item.toObject(), id: item._id.toString() }));

      return { 
        ...c.toObject(), 
        id: c._id.toString(), 
        assignments: mapWithId(assignments), 
        notes: mapWithId(notes), 
        projects: mapWithId(projects) 
      };
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/courses
router.post('/', async (req, res) => {
  try {
    const { title, description, instructor, totalHours, credits, tag, progress, label, courseLink, labelColor, durationValue, durationUnit } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const course = await Course.create({ userId: req.user._id, title, description, instructor, totalHours, credits, tag, progress, label, courseLink, labelColor, durationValue, durationUnit });
    res.status(201).json({ ...course.toObject(), id: course._id.toString(), assignments: [], notes: [], projects: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/courses/:id
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ ...course.toObject(), id: course._id.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    // Cascade delete sub-documents
    await Promise.all([
      Assignment.deleteMany({ courseId: req.params.id }),
      Note.deleteMany({ courseId: req.params.id }),
      Project.deleteMany({ courseId: req.params.id }),
    ]);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Assignments ──────────────────────────────────────────────

router.post('/:courseId/assignments', async (req, res) => {
  try {
    const { title, description, pdfUrl } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const item = await Assignment.create({ courseId: req.params.courseId, title, description, pdfUrl });
    res.status(201).json({ ...item.toObject(), id: item._id.toString() });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:courseId/assignments/:id', async (req, res) => {
  try {
    if (req.body.status === 'Submitted') {
      req.body.completedAt = new Date();
    }

    const item = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Assignment not found' });

    if (item.status === 'Submitted') {
      const { updateUserStreak } = require('../utils/streakUtils');
      await updateUserStreak(req.user._id);
    }

    res.json({ ...item.toObject(), id: item._id.toString() });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:courseId/assignments/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// ── Notes ─────────────────────────────────────────────────────

router.post('/:courseId/notes', async (req, res) => {
  try {
    const { heading, content } = req.body;
    if (!heading) return res.status(400).json({ message: 'Heading is required' });
    const item = await Note.create({ courseId: req.params.courseId, heading, content });
    res.status(201).json({ ...item.toObject(), id: item._id.toString() });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:courseId/notes/:id', async (req, res) => {
  try {
    const item = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Note not found' });
    res.json({ ...item.toObject(), id: item._id.toString() });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:courseId/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// ── Projects ──────────────────────────────────────────────────

router.post('/:courseId/projects', async (req, res) => {
  try {
    const { name, techStack, details, pdfUrl } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const item = await Project.create({ courseId: req.params.courseId, name, techStack, details, pdfUrl });
    res.status(201).json({ ...item.toObject(), id: item._id.toString() });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/:courseId/projects/:id', async (req, res) => {
  try {
    if (req.body.status === 'Completed') {
      req.body.completedAt = new Date();
    }

    const item = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Project not found' });

    if (item.status === 'Completed') {
      const { updateUserStreak } = require('../utils/streakUtils');
      await updateUserStreak(req.user._id);
    }

    res.json({ ...item.toObject(), id: item._id.toString() });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/:courseId/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// ── PDF Integrations ──────────────────────────────────────────────

router.post('/:courseId/:type/:id/pdf', upload.single('pdf'), async (req, res) => {
  try {
    const { type, id } = req.params;
    let Model;
    if (type === 'assignments') Model = Assignment;
    else if (type === 'notes') Model = Note;
    else if (type === 'projects') Model = Project;
    else return res.status(400).json({ message: 'Invalid type' });

    // Mock local storage URL representing saved S3/Multer blob object
    const mockPdfUrl = `/uploads/${req.file.originalname || 'document.pdf'}`;
    const item = await Model.findByIdAndUpdate(id, { pdfUrl: mockPdfUrl }, { new: true });
    
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'PDF imported successfully', pdfUrl: mockPdfUrl });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/:courseId/:type/:id/export-pdf', async (req, res) => {
  try {
    const { type, id } = req.params;
    let Model;
    if (type === 'assignments') Model = Assignment;
    else if (type === 'notes') Model = Note;
    else if (type === 'projects') Model = Project;

    const item = await Model.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const doc = new PDFDocument();
    
    res.setHeader('Content-disposition', `attachment; filename="${item.title || item.heading || item.name}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);
    doc.fontSize(25).text(item.title || item.heading || item.name, 100, 100);
    doc.fontSize(14).text(item.description || item.content || item.details, 100, 150);
    doc.end();
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
