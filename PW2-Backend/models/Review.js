const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'El rating es requerido'],
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    trim: true
  },
  aprobado: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Un usuario solo puede dejar una reseña por producto
reviewSchema.index({ producto: 1, usuario: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
