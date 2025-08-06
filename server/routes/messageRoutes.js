const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authenticateAdmin = require('../middleware/authMiddleware');

// GET all messages (Admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

module.exports = router;
