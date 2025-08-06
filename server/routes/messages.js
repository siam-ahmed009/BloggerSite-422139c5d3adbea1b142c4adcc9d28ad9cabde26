const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ahmedsiam.aliexpress@gmail.com',      // 🔁 your admin email
        pass: 'dmlr akms eyol nnuy'                // 🔁 app password from Gmail
    }
});


router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ receivedAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newMsg = new Message({ name, email, subject, message });
    await newMsg.save();
    res.status(201).json({ message: 'Message saved successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to submit message' });
  }
});

// POST /api/messages/:id/reply
router.post('/:id/reply', async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ message: 'Reply content is required' });
  }

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Save reply
    message.reply = reply;
    message.repliedAt = new Date();
    await message.save();

    // Optional: send email to user
    // await sendEmail(message.email, 'Reply from Admin', reply);

    res.json({ message: 'Reply saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
