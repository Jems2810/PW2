const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Listar usuarios (admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { busqueda } = req.query;
    const filter = {};
    if (busqueda && typeof busqueda === 'string' && busqueda.trim()) {
      const regex = new RegExp(busqueda.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ nombre: regex }, { email: regex }];
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/users/:id/rol
// @desc    Cambiar rol de un usuario (admin)
// @access  Private/Admin
router.put('/:id/rol', protect, admin, async (req, res) => {
  try {
    const { rol } = req.body;
    if (!['usuario', 'admin'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    if (req.params.id === req.user._id.toString() && rol !== 'admin') {
      return res.status(400).json({ message: 'No puedes quitarte tu propio rol de administrador' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Eliminar usuario (admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
