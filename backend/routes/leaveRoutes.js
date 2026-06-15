const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const auth = require('../middleware/auth');

function countDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1);
}

router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const days = countDays(startDate, endDate);
    const user = await User.findById(req.user.id);
    if (user.leaveBalance < days)
      return res.status(400).json({ message: `Not enough leave balance. You have ${user.leaveBalance} day(s) left.` });
    user.leaveBalance -= days;
    await user.save();
    const leave = await Leave.create({
      userId: req.user.id,
      employeeName: req.user.name,
      leaveType, startDate, endDate, reason,
    });
    res.json({ leave, leaveBalance: user.leaveBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/approve/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const updated = await Leave.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Not found' });
    if (leave.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not your leave' });
    if (leave.status !== 'Pending')
      return res.status(400).json({ message: 'Can only edit pending leaves' });
    const oldDays = countDays(leave.startDate, leave.endDate);
    const newDays = countDays(req.body.startDate, req.body.endDate);
    const diff = newDays - oldDays;
    const user = await User.findById(req.user.id);
    if (user.leaveBalance < diff)
      return res.status(400).json({ message: 'Not enough balance for updated dates.' });
    user.leaveBalance -= diff;
    await user.save();
    const updated = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ leave: updated, leaveBalance: user.leaveBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Not found' });
    if (leave.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not your leave' });
    if (leave.status !== 'Pending')
      return res.status(400).json({ message: 'Can only delete pending leaves' });
    const days = countDays(leave.startDate, leave.endDate);
    const user = await User.findById(req.user.id);
    user.leaveBalance += days;
    await user.save();
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted', leaveBalance: user.leaveBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;