const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
// @desc    Obtener reseñas de un producto
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ producto: req.params.productId, aprobado: true })
      .populate('usuario', 'nombre')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Crear reseña
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { producto, rating, comentario } = req.body;

    // Verificar si ya dejó reseña
    const existing = await Review.findOne({ producto, usuario: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Ya dejaste una reseña para este producto' });
    }

    const review = await Review.create({
      producto,
      usuario: req.user._id,
      rating,
      comentario
    });

    // Actualizar rating promedio del producto
    const reviews = await Review.find({ producto, aprobado: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(producto, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: reviews.length
    });

    const populated = await review.populate('usuario', 'nombre');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Eliminar reseña
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Solo el autor o un admin puede eliminar
    if (review.usuario.toString() !== req.user._id.toString() && req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const productoId = review.producto;
    await review.deleteOne();

    // Recalcular rating
    const reviews = await Review.find({ producto: productoId, aprobado: true });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Product.findByIdAndUpdate(productoId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: reviews.length
    });

    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Aprobar/rechazar reseña (admin modera)
// @access  Private/Admin
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { aprobado: req.body.aprobado },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
