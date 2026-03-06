const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { protect } = require('../middleware/auth');

// @route   GET /api/addresses
// @desc    Obtener direcciones del usuario
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ usuario: req.user._id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   POST /api/addresses
// @desc    Crear nueva dirección
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { alias, calle, ciudad, estado, codigoPostal, telefono, esPrincipal } = req.body;

    // Si es principal, quitar principal de las demás
    if (esPrincipal) {
      await Address.updateMany({ usuario: req.user._id }, { esPrincipal: false });
    }

    const address = await Address.create({
      usuario: req.user._id,
      alias,
      calle,
      ciudad,
      estado,
      codigoPostal,
      telefono,
      esPrincipal
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/addresses/:id
// @desc    Actualizar dirección
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, usuario: req.user._id });

    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    if (req.body.esPrincipal) {
      await Address.updateMany({ usuario: req.user._id }, { esPrincipal: false });
    }

    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   DELETE /api/addresses/:id
// @desc    Eliminar dirección
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });

    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }

    res.json({ message: 'Dirección eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
