const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const { optionalProtect, protect, admin } = require('../middleware/auth');

// @route   GET /api/brands
// @desc    Obtener todas las marcas
// @access  Public
router.get('/', optionalProtect, async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true' && req.user?.rol === 'admin';
    const brands = await Brand.find(includeInactive ? {} : { activo: true }).sort({ nombre: 1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/brands/:id
// @desc    Obtener marca por ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (brand) {
      res.json(brand);
    } else {
      res.status(404).json({ message: 'Marca no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   POST /api/brands
// @desc    Crear marca
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { nombre, logo } = req.body;

    const brandExists = await Brand.findOne({ nombre });
    if (brandExists) {
      return res.status(400).json({ message: 'La marca ya existe' });
    }

    const brand = await Brand.create({ nombre, logo });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/brands/:id
// @desc    Actualizar marca
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (brand) {
      res.json(brand);
    } else {
      res.status(404).json({ message: 'Marca no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   DELETE /api/brands/:id
// @desc    Eliminar marca
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (brand) {
      res.json({ message: 'Marca eliminada' });
    } else {
      res.status(404).json({ message: 'Marca no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
