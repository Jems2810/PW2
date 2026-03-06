const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  sku: {
    type: String
  },
  imagen: {
    type: String
  },
  precio: {
    type: Number,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
