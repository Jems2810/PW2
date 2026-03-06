const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    trim: true,
    lowercase: true
  },
  asunto: {
    type: String,
    trim: true
  },
  mensaje: {
    type: String,
    required: [true, 'El mensaje es requerido']
  },
  estado: {
    type: String,
    enum: ['nuevo', 'leido', 'respondido'],
    default: 'nuevo'
  },
  respondidoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respuesta: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
