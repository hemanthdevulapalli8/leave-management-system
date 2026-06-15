const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const users = [
  { name: 'admin', password: 'admin123', role: 'admin', leaveBalance: 0 },
  { name: 'A', password: 'A123', role: 'employee', leaveBalance: 4 },
  { name: 'B', password: 'B123', role: 'employee', leaveBalance: 4 },
  { name: 'C', password: 'C123', role: 'employee', leaveBalance: 4 },
  { name: 'D', password: 'D123', role: 'employee', leaveBalance: 4 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  for (const u of users) {
    u.password = await bcrypt.hash(u.password, 10);
    await User.create(u);
  }
  console.log('Seeded users: admin, A, B, C, D');
  process.exit();
}

seed();