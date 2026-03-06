const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  marca: {
    type: String,
    required: [true, 'La marca es requerida'],
    enum: ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Google', 'Motorola', 'Oppo', 'LG', 'Honor', 'ZTE']
  },
  modelo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: 0
  },
  precioOferta: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imagen: {
    type: String,
    default: '/placeholder.png'
  },
  imagenes: [{
    type: String
  }],
  especificaciones: {
    pantalla: String,
    procesador: String,
    ram: String,
    almacenamiento: String,
    camara: String,
    bateria: String,
    sistemaOperativo: String
  },
  color: {
    type: String
  },
  coloresDisponibles: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  destacado: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice para búsquedas
productSchema.index({ nombre: 'text', marca: 'text', modelo: 'text' });

module.exports = mongoose.model('Product', productSchema);
