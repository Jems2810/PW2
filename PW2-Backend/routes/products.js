const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Obtener todos los productos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { marca, minPrecio, maxPrecio, busqueda, destacado, ordenar } = req.query;
    
    let query = { activo: true };

    // Filtro por marca
    if (marca) {
      query.marca = marca;
    }

    // Filtro por precio
    if (minPrecio || maxPrecio) {
      query.precio = {};
      if (minPrecio) query.precio.$gte = Number(minPrecio);
      if (maxPrecio) query.precio.$lte = Number(maxPrecio);
    }

    // Filtro por destacado
    if (destacado === 'true') {
      query.destacado = true;
    }

    // Búsqueda por texto
    if (busqueda) {
      query.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { marca: { $regex: busqueda, $options: 'i' } },
        { modelo: { $regex: busqueda, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (ordenar === 'precio-asc') sortOption = { precio: 1 };
    if (ordenar === 'precio-desc') sortOption = { precio: -1 };
    if (ordenar === 'rating') sortOption = { rating: -1 };
    if (ordenar === 'nombre') sortOption = { nombre: 1 };

    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Obtener producto por ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   POST /api/products
// @desc    Crear nuevo producto
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Actualizar producto
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Eliminar producto
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: 'Producto eliminado' });
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/products/marca/:marca
// @desc    Obtener productos por marca
// @access  Public
router.get('/marca/:marca', async (req, res) => {
  try {
    const products = await Product.find({ marca: req.params.marca, activo: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
