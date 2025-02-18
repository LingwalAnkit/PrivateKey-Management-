// models.js
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cloudwallet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  publickey: {
    type: String,
    required: true
  },
  privatekey: {
    type: String,
    required: true
  }
});

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;