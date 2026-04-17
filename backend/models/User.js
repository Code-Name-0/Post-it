const mongoose = require('mongoose');

// Hiérarchie croissante : guest < creator < editor < eraser < admin
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
    // Stocké haché par bcrypt — jamais en clair
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'creator', // rôle par défaut à l'inscription
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
