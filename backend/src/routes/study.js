const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { FocusBlock, StudySession } = require('../models/Study');

router.use(protect);



// GET /api/study/focus-blocks
router.get('/focus-blocks', async (req, res) => {
  try {
    const blocks = await FocusBlock.find({ userId: req.user._id })
      .populate('courseId', 'title')
      .sort({ parsedDate: 1 });
    res.json(blocks.map(b => ({ ...b.toObject(), id: b._id.toString() })));
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/study/focus-blocks
router.post('/focus-blocks', async (req, res) => {
  try {
    const block = await FocusBlock.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ ...block.toObject(), id: block._id.toString() });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/study/focus-blocks/:id
router.put('/focus-blocks/:id', async (req, res) => {
  try {
    const block = await FocusBlock.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!block) return res.status(404).json({ message: 'Focus block not found' });
    res.json({ ...block.toObject(), id: block._id.toString() });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/study/focus-blocks/:id
router.delete('/focus-blocks/:id', async (req, res) => {
  try {
    const block = await FocusBlock.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!block) return res.status(404).json({ message: 'Focus block not found' });
    res.json({ message: 'Focus block deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});



// GET /api/study/sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id }).sort({ sessionDate: -1 });
    res.json(sessions.map(s => ({
      ...s.toObject(),
      id: s._id.toString(),
      date: s.sessionDate,
    })));
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// POST /api/study/sessions
router.post('/sessions', async (req, res) => {
  try {
    const { course, courseId, duration, focus, loggedAt, color, date } = req.body;
    if (!course) return res.status(400).json({ message: 'Course is required' });
    const session = await StudySession.create({
      userId: req.user._id, course, courseId: courseId || null, duration, focus, loggedAt, color,
      sessionDate: date ? new Date(date) : new Date(),
    });

    const { updateUserStreak } = require('../utils/streakUtils');
    await updateUserStreak(req.user._id);

    res.status(201).json({ ...session.toObject(), id: session._id.toString(), date: session.sessionDate });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// DELETE /api/study/sessions/:id
router.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
