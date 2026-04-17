const mongoose = require('mongoose');

const postitSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    // Position absolue dans le tableau (en pixels)
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
    // z_index basé sur Date.now() : les plus récents / déplacés passent par-dessus
    z_index: { type: Number, default: 0 },
    // Référence vers l'auteur (User)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Référence vers le tableau (Board)
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
  },
  {
    timestamps: true, // Génère createdAt et updatedAt automatiquement
    toJSON: { virtuals: true },
  }
);

module.exports = mongoose.model('PostIt', postitSchema);
