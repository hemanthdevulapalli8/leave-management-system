const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  leaveBalance: { type: Number, default: 4 },
});

module.exports = mongoose.model('User', userSchema);