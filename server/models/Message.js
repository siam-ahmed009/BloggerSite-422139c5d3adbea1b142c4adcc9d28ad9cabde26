const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  reply: {
    type: String,
    default: ''
  },
  repliedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
