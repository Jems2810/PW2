const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  nombre: String,
  imagen: String,
  precio: Number,
  cantidad: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productos: [orderItemSchema],
  direccionEnvio: {
    calle: { type: String, required: true },
    ciudad: { type: String, required: true },
    estado: { type: String, required: true },
    codigoPostal: { type: String, required: true },
    telefono: String
  },
  metodoPago: {
    type: String,
    required: true,
    enum: ['tarjeta', 'paypal', 'transferencia', 'efectivo']
  },
  resultadoPago: {
    id: String,
    status: String,
    updateTime: String,
    emailAddress: String
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  costoEnvio: {
    type: Number,
    required: true,
    default: 0
  },
  impuestos: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  estadoPago: {
    type: String,
    enum: ['pendiente', 'pagado', 'fallido'],
    default: 'pendiente'
  },
  estadoEnvio: {
    type: String,
    enum: ['procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'procesando'
  },
  fechaPago: Date,
  fechaEnvio: Date,
  fechaEntrega: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
