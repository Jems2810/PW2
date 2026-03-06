const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Enviar mensaje de contacto
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    const message = await ContactMessage.create({
      nombre,
      email,
      asunto,
      mensaje
    });

    res.status(201).json({ message: 'Mensaje enviado correctamente', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/contact
// @desc    Obtener todos los mensajes (admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { estado } = req.query;
    let query = {};
    if (estado) query.estado = estado;

    const messages = await ContactMessage.find(query)
      .populate('respondidoPor', 'nombre')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/contact/:id
// @desc    Responder mensaje (admin)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    message.estado = req.body.estado || 'respondido';
    message.respuesta = req.body.respuesta || message.respuesta;
    message.respondidoPor = req.user._id;

    const updated = await message.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Eliminar mensaje
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    res.json({ message: 'Mensaje eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
