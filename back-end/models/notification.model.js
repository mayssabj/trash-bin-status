const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
  message: String,
  reference: String,
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
