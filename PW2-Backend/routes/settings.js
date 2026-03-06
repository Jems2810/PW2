const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Obtener todas las configuraciones
// @access  Public (solo valores públicos)
router.get('/', async (req, res) => {
  try {
    const settings = await Setting.find();
    const result = {};
    settings.forEach(s => {
      result[s.clave] = s.valor;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/settings/all
// @desc    Obtener configuraciones con detalle (admin)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const settings = await Setting.find().populate('updatedBy', 'nombre');
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/settings/:clave
// @desc    Actualizar configuración
// @access  Private/Admin
router.put('/:clave', protect, admin, async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { clave: req.params.clave },
      {
        valor: req.body.valor,
        updatedBy: req.user._id,
        updatedAt: Date.now()
      },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
