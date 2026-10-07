const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI is missing. Copy .env.example to .env'); process.exit(1); }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (e) {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  }
};
