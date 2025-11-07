const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Voter = require('../models/vote.model');

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
console.error('Error: MONGO_URL is not set in .env');
process.exit(1);
}

async function createAdmin() {
try {
await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
console.log('Connected to MongoDB');

const email = 'admin@sdca.edu.ph';
const existingAdmin = await Voter.findOne({ email });

if (existingAdmin) {
  console.log('Admin already exists:', email);
  process.exit(0);
}

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash('admin123', salt);

const admin = await Voter.create({
  fullName: 'Admin User',
  email,
  studentID: '0000',
  password: hashedPassword,
  isAdmin: true,
});

console.log('Admin created successfully:', admin.email);
process.exit(0);


} catch (err) {
console.error('Failed to create admin:', err);
process.exit(1);
}
}

createAdmin();
