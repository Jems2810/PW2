const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Crear nueva orden
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productos, direccionEnvio, metodoPago } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ message: 'No hay productos en la orden' });
    }

    // Calcular totales
    let subtotal = 0;
    for (const item of productos) {
      const product = await Product.findById(item.producto);
      if (product) {
        subtotal += product.precio * item.cantidad;
      }
    }

    const costoEnvio = subtotal > 5000 ? 0 : 150; // Envío gratis arriba de $5000
    const impuestos = subtotal * 0.16; // IVA 16%
    const total = subtotal + costoEnvio + impuestos;

    const order = new Order({
      usuario: req.user._id,
      productos,
      direccionEnvio,
      metodoPago,
      subtotal,
      costoEnvio,
      impuestos,
      total
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/orders/myorders
// @desc    Obtener órdenes del usuario actual
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ usuario: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Obtener orden por ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('usuario', 'nombre email')
      .populate('productos.producto');

    if (order) {
      // Verificar que el usuario sea dueño de la orden o admin
      if (order.usuario._id.toString() === req.user._id.toString() || req.user.rol === 'admin') {
        res.json(order);
      } else {
        res.status(403).json({ message: 'No autorizado para ver esta orden' });
      }
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Actualizar orden a pagada
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.estadoPago = 'pagado';
      order.fechaPago = Date.now();
      order.resultadoPago = {
        id: req.body.id,
        status: req.body.status,
        updateTime: req.body.updateTime,
        emailAddress: req.body.emailAddress
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/orders/:id/deliver
// @desc    Actualizar orden a enviada/entregada
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.estadoEnvio = req.body.estadoEnvio || 'enviado';
      if (req.body.estadoEnvio === 'enviado') {
        order.fechaEnvio = Date.now();
      }
      if (req.body.estadoEnvio === 'entregado') {
        order.fechaEntrega = Date.now();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Obtener todas las órdenes (admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('usuario', 'nombre email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router;
