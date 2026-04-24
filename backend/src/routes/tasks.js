const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');

// All routes protected
router.use(protect);

// GET /api/tasks — get all tasks for logged-in user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks/by-course/:courseId — get tasks linked to a specific course
router.get('/by-course/:courseId', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id, courseId: req.params.courseId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks — create a task
router.post('/', async (req, res) => {
  try {
    const { title, details, deadline, priority, status, courseId, parsedDeadline } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const task = await Task.create({
      userId: req.user._id,
      title, details, deadline,
      priority: priority || 'Medium',
      status:   status   || 'Not started',
      courseId: courseId || null,
      parsedDeadline: parsedDeadline ? new Date(parsedDeadline) : null,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/tasks/:id — update a task
router.put('/:id', async (req, res) => {
  try {
    if (req.body.status === 'Completed') {
      req.body.completedAt = new Date();
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.status === 'Completed') {
      const { updateUserStreak } = require('../utils/streakUtils');
      await updateUserStreak(req.user._id);
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
