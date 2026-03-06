const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Un usuario no puede tener el mismo producto duplicado en el carrito
cartItemSchema.index({ usuario: 1, producto: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
