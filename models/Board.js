const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    // Identifiant URL du tableau, ex: "toto" → accessible à /:toto
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/, // Lettres minuscules, chiffres, tirets uniquement
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Board', boardSchema);
