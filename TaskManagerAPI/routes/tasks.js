
// routes/tasks.js - Tasks API routes
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// @route   GET api/tasks
// @desc    Get all tasks for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get all tasks for the current user
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, categories, dueDate } = req.body;
    
    // Create new task
    const newTask = new Task({
      title,
      description,
      priority,
      categories: categories || [],
      dueDate,
      user: req.user.id
    });
    
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ user: req.user.id });
    const completedTasks = await Task.countDocuments({ 
      user: req.user.id,
      status: 'completed'
    });
    const pendingTasks = await Task.countDocuments({ 
      user: req.user.id,
      status: 'pending'
    });
    
    // Get counts by priority
    const highPriority = await Task.countDocuments({ 
      user: req.user.id,
      priority: 'high',
      status: 'pending'
    });
    
    const mediumPriority = await Task.countDocuments({ 
      user: req.user.id,
      priority: 'medium',
      status: 'pending'
    });
    
    const lowPriority = await Task.countDocuments({ 
      user: req.user.id,
      priority: 'low',
      status: 'pending'
    });
    
    res.json({
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      priority: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedTask);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Delete the task
    await Task.findByIdAndRemove(req.params.id);
    
    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tasks/:id/status
// @desc    Toggle task status (completed/pending)
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Toggle the status
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    
    await task.save();
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/tasks/filter
// @desc    Filter tasks by status, priority, or category
// @access  Private
router.get('/filter/search', auth, async (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.categories = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;