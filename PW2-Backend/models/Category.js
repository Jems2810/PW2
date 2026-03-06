const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  descripcion: {
    type: String
  },
  imagen: {
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

// Generar slug automáticamente antes de guardar
categorySchema.pre('save', function() {
  if (this.isModified('nombre')) {
    this.slug = this.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);
