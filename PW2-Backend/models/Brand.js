const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la marca es requerido'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  logo: {
    type: String
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

brandSchema.pre('save', function() {
  if (this.isModified('nombre')) {
    this.slug = this.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
});

module.exports = mongoose.model('Brand', brandSchema);
