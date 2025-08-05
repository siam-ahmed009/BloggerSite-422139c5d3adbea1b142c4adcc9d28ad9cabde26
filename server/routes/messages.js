const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// ✅ 1. Submit message from public contact form
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    res.status(201).json({ message: 'Message received successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// ✅ 2. Fetch all messages for admin (you can later add auth middleware here)
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ✅ 3. Reply to a message (updates existing message with reply text)
router.put('/:id/reply', async (req, res) => {
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ error: 'Reply text is required' });
  }

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { reply, repliedAt: new Date() },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Reply saved successfully!', updatedMessage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

module.exports = router;
