const mongoose = require('mongoose');

const ROLES = ['guest', 'creator', 'editor', 'eraser', 'admin'];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'creator',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
