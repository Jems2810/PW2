const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Obtener carrito del usuario
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const items = await CartItem.find({ usuario: req.user._id })
      .populate('producto', 'nombre precio precioOferta imagen stock marca');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   POST /api/cart
// @desc    Agregar producto al carrito
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { producto, cantidad } = req.body;

    // Verificar si ya existe en el carrito
    const existing = await CartItem.findOne({ usuario: req.user._id, producto });

    if (existing) {
      existing.cantidad += cantidad || 1;
      await existing.save();
      const populated = await existing.populate('producto', 'nombre precio precioOferta imagen stock marca');
      return res.json(populated);
    }

    const item = await CartItem.create({
      usuario: req.user._id,
      producto,
      cantidad: cantidad || 1
    });

    const populated = await item.populate('producto', 'nombre precio precioOferta imagen stock marca');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/cart/:id
// @desc    Actualizar cantidad
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await CartItem.findOne({ _id: req.params.id, usuario: req.user._id });

    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    item.cantidad = req.body.cantidad;
    await item.save();

    const populated = await item.populate('producto', 'nombre precio precioOferta imagen stock marca');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   DELETE /api/cart/:id
// @desc    Eliminar item del carrito
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await CartItem.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });

    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   DELETE /api/cart
// @desc    Vaciar carrito completo
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await CartItem.deleteMany({ usuario: req.user._id });
    res.json({ message: 'Carrito vaciado' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
