const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alias: {
    type: String,
    default: 'Casa'  // "Casa", "Oficina", etc.
  },
  calle: {
    type: String,
    required: [true, 'La calle es requerida']
  },
  ciudad: {
    type: String,
    required: [true, 'La ciudad es requerida']
  },
  estado: {
    type: String,
    required: [true, 'El estado es requerido']
  },
  codigoPostal: {
    type: String,
    required: [true, 'El código postal es requerido']
  },
  telefono: {
    type: String
  },
  esPrincipal: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Address', addressSchema);
