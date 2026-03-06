const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Modelos
const User = require('./models/User');
const Address = require('./models/Address');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Product = require('./models/Product');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Review = require('./models/Review');
const ContactMessage = require('./models/ContactMessage');
const Setting = require('./models/Setting');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Conectado');

    // ============================
    // LIMPIAR TODAS LAS COLECCIONES
    // ============================
    await User.deleteMany({});
    await Address.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    await CartItem.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Review.deleteMany({});
    await ContactMessage.deleteMany({});
    await Setting.deleteMany({});
    console.log('Colecciones limpiadas');

    // ============================
    // 1. USUARIOS
    // ============================
    const admin = await User.create({
      nombre: 'Administrador',
      email: 'admin@movilstore.com',
      password: 'Admin123!',
      telefono: '614-123-4567',
      rol: 'admin'
    });

    const cliente1 = await User.create({
      nombre: 'Juan Pérez',
      email: 'juan@gmail.com',
      password: 'Cliente123!',
      telefono: '614-987-6543',
      rol: 'usuario'
    });

    const cliente2 = await User.create({
      nombre: 'María López',
      email: 'maria@gmail.com',
      password: 'Cliente123!',
      telefono: '614-555-1234',
      rol: 'usuario'
    });

    console.log('✅ 1/11 - Usuarios creados (3)');

    // ============================
    // 2. DIRECCIONES
    // ============================
    const direccion1 = await Address.create({
      usuario: cliente1._id,
      alias: 'Casa',
      calle: 'Av. Tecnológico #1234',
      ciudad: 'Chihuahua',
      estado: 'Chihuahua',
      codigoPostal: '31100',
      telefono: '614-987-6543',
      esPrincipal: true
    });

    await Address.create({
      usuario: cliente1._id,
      alias: 'Oficina',
      calle: 'Blvd. Ortiz Mena #567',
      ciudad: 'Chihuahua',
      estado: 'Chihuahua',
      codigoPostal: '31210',
      telefono: '614-987-6543',
      esPrincipal: false
    });

    await Address.create({
      usuario: cliente2._id,
      alias: 'Casa',
      calle: 'Calle Reforma #890',
      ciudad: 'Chihuahua',
      estado: 'Chihuahua',
      codigoPostal: '31000',
      telefono: '614-555-1234',
      esPrincipal: true
    });

    console.log('✅ 2/11 - Direcciones creadas (3)');

    // ============================
    // 3. CATEGORÍAS
    // ============================
    const catGamaAlta = await Category.create({
      nombre: 'Gama Alta',
      descripcion: 'Los smartphones más potentes y premium del mercado',
      imagen: '/categorias/gama-alta.png'
    });

    const catGamaMedia = await Category.create({
      nombre: 'Gama Media',
      descripcion: 'Excelente relación calidad-precio',
      imagen: '/categorias/gama-media.png'
    });

    const catGamaEntrada = await Category.create({
      nombre: 'Gama de Entrada',
      descripcion: 'Smartphones accesibles con buenas prestaciones',
      imagen: '/categorias/gama-entrada.png'
    });

    const catAccesorios = await Category.create({
      nombre: 'Accesorios',
      descripcion: 'Fundas, cargadores, audífonos y más',
      imagen: '/categorias/accesorios.png'
    });

    console.log('✅ 3/11 - Categorías creadas (4)');

    // ============================
    // 4. MARCAS
    // ============================
    const marcas = await Brand.insertMany([
      { nombre: 'Apple', slug: 'apple', logo: '/apple.svg' },
      { nombre: 'Samsung', slug: 'samsung', logo: '/samsung.svg' },
      { nombre: 'Huawei', slug: 'huawei', logo: '/huawei.svg' },
      { nombre: 'Xiaomi', slug: 'xiaomi', logo: '/xiaomi.svg' },
      { nombre: 'Google', slug: 'google', logo: '/google.svg' },
      { nombre: 'Motorola', slug: 'motorola', logo: '/motorola.svg' },
      { nombre: 'Oppo', slug: 'oppo', logo: '/oppo.svg' },
      { nombre: 'Honor', slug: 'honor', logo: '/honor.svg' },
      { nombre: 'LG', slug: 'lg', logo: '/lg.svg' },
      { nombre: 'ZTE', slug: 'zte', logo: '/zte.svg' }
    ]);

    console.log('✅ 4/11 - Marcas creadas (10)');

    // ============================
    // 5. PRODUCTOS
    // ============================
    const apple = marcas.find(m => m.nombre === 'Apple');
    const samsung = marcas.find(m => m.nombre === 'Samsung');
    const huawei = marcas.find(m => m.nombre === 'Huawei');
    const xiaomi = marcas.find(m => m.nombre === 'Xiaomi');
    const google = marcas.find(m => m.nombre === 'Google');
    const motorola = marcas.find(m => m.nombre === 'Motorola');
    const oppo = marcas.find(m => m.nombre === 'Oppo');
    const honor = marcas.find(m => m.nombre === 'Honor');

    const productos = await Product.insertMany([
      {
        nombre: 'iPhone 15 Pro Max',
        marca: 'Apple',
        modelo: '15 Pro Max',
        descripcion: 'El iPhone más avanzado con chip A17 Pro, sistema de cámara profesional y diseño de titanio.',
        precio: 28999,
        stock: 15,
        imagen: '/iphone15.png',
        especificaciones: { pantalla: '6.7" Super Retina XDR OLED', procesador: 'Apple A17 Pro', ram: '8GB', almacenamiento: '256GB', camara: '48MP + 12MP + 12MP', bateria: '4422 mAh', sistemaOperativo: 'iOS 17' },
        color: 'Titanio Natural',
        coloresDisponibles: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco', 'Titanio Negro'],
        rating: 4.9,
        numReviews: 3,
        destacado: true
      },
      {
        nombre: 'Samsung Galaxy S24 Ultra',
        marca: 'Samsung',
        modelo: 'Galaxy S24 Ultra',
        descripcion: 'El Galaxy más potente con Galaxy AI, S Pen integrado y cámara de 200MP.',
        precio: 26999,
        stock: 20,
        imagen: '/samsung-s24.png',
        especificaciones: { pantalla: '6.8" Dynamic AMOLED 2X', procesador: 'Snapdragon 8 Gen 3', ram: '12GB', almacenamiento: '256GB', camara: '200MP + 12MP + 50MP + 10MP', bateria: '5000 mAh', sistemaOperativo: 'Android 14' },
        color: 'Titanium Gray',
        coloresDisponibles: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow'],
        rating: 4.8,
        numReviews: 2,
        destacado: true
      },
      {
        nombre: 'Huawei Pura 70 Pro',
        marca: 'Huawei',
        modelo: 'Pura 70 Pro',
        descripcion: 'Fotografía profesional con cámara XMAGE y diseño elegante.',
        precio: 18999,
        stock: 12,
        imagen: '/huawei.png',
        especificaciones: { pantalla: '6.8" LTPO OLED', procesador: 'Kirin 9010', ram: '12GB', almacenamiento: '512GB', camara: '50MP + 40MP + 12.5MP', bateria: '5050 mAh', sistemaOperativo: 'HarmonyOS 4' },
        color: 'Negro',
        coloresDisponibles: ['Negro', 'Blanco', 'Verde'],
        rating: 4.7,
        numReviews: 1,
        destacado: true
      },
      {
        nombre: 'Xiaomi 14 Ultra',
        marca: 'Xiaomi',
        modelo: '14 Ultra',
        descripcion: 'Co-desarrollado con Leica, el smartphone más fotográfico de Xiaomi.',
        precio: 22999,
        stock: 18,
        imagen: '/xiaomi14.png',
        especificaciones: { pantalla: '6.73" LTPO AMOLED', procesador: 'Snapdragon 8 Gen 3', ram: '16GB', almacenamiento: '512GB', camara: '50MP + 50MP + 50MP + 50MP', bateria: '5000 mAh', sistemaOperativo: 'Android 14' },
        color: 'Negro',
        coloresDisponibles: ['Negro', 'Blanco'],
        rating: 4.8,
        numReviews: 1,
        destacado: true
      },
      {
        nombre: 'Google Pixel 8 Pro',
        marca: 'Google',
        modelo: 'Pixel 8 Pro',
        descripcion: 'La mejor cámara con Google AI, 7 años de actualizaciones.',
        precio: 19999,
        stock: 10,
        imagen: '/pixel8.png',
        especificaciones: { pantalla: '6.7" LTPO OLED', procesador: 'Google Tensor G3', ram: '12GB', almacenamiento: '128GB', camara: '50MP + 48MP + 48MP', bateria: '5050 mAh', sistemaOperativo: 'Android 14' },
        color: 'Obsidian',
        coloresDisponibles: ['Obsidian', 'Porcelain', 'Bay'],
        rating: 4.7,
        numReviews: 1,
        destacado: false
      },
      {
        nombre: 'Motorola Edge 50 Pro',
        marca: 'Motorola',
        modelo: 'Edge 50 Pro',
        descripcion: 'Diseño premium con pantalla curva y carga rápida de 125W.',
        precio: 12999,
        stock: 25,
        imagen: '/moto-edge50.png',
        especificaciones: { pantalla: '6.7" pOLED', procesador: 'Snapdragon 7 Gen 3', ram: '12GB', almacenamiento: '256GB', camara: '50MP + 13MP + 10MP', bateria: '4500 mAh', sistemaOperativo: 'Android 14' },
        color: 'Black Beauty',
        coloresDisponibles: ['Black Beauty', 'Luxe Lavender', 'Vanilla Cream'],
        rating: 4.5,
        numReviews: 0,
        destacado: false
      },
      {
        nombre: 'OPPO Find X7 Ultra',
        marca: 'Oppo',
        modelo: 'Find X7 Ultra',
        descripcion: 'Sistema de cámara Hasselblad con doble periscopio.',
        precio: 21999,
        stock: 8,
        imagen: '/oppo-findx7.png',
        especificaciones: { pantalla: '6.82" LTPO AMOLED', procesador: 'Snapdragon 8 Gen 3', ram: '16GB', almacenamiento: '512GB', camara: '50MP + 50MP + 50MP + 50MP', bateria: '5000 mAh', sistemaOperativo: 'Android 14' },
        color: 'Ocean Blue',
        coloresDisponibles: ['Ocean Blue', 'Sepia Brown'],
        rating: 4.6,
        numReviews: 0,
        destacado: false
      },
      {
        nombre: 'Honor Magic 6 Pro',
        marca: 'Honor',
        modelo: 'Magic 6 Pro',
        descripcion: 'Pantalla con detección ocular y batería de silicio-carbono.',
        precio: 17999,
        stock: 14,
        imagen: '/honor-magic6.png',
        especificaciones: { pantalla: '6.8" LTPO OLED', procesador: 'Snapdragon 8 Gen 3', ram: '12GB', almacenamiento: '512GB', camara: '50MP + 50MP + 180MP periscope', bateria: '5600 mAh', sistemaOperativo: 'Android 14' },
        color: 'Negro',
        coloresDisponibles: ['Negro', 'Verde', 'Morado'],
        rating: 4.6,
        numReviews: 0,
        destacado: false
      }
    ]);

    console.log('✅ 5/11 - Productos creados (8)');

    // ============================
    // 6. CART ITEMS
    // ============================
    await CartItem.create({
      usuario: cliente1._id,
      producto: productos[0]._id,
      cantidad: 1
    });

    await CartItem.create({
      usuario: cliente1._id,
      producto: productos[3]._id,
      cantidad: 2
    });

    console.log('✅ 6/11 - Items de carrito creados (2)');

    // ============================
    // 7. ÓRDENES
    // ============================
    const orden1 = await Order.create({
      usuario: cliente1._id,
      productos: [
        { producto: productos[1]._id, nombre: 'Samsung Galaxy S24 Ultra', imagen: '/samsung-s24.png', precio: 26999, cantidad: 1 }
      ],
      direccionEnvio: {
        calle: 'Av. Tecnológico #1234',
        ciudad: 'Chihuahua',
        estado: 'Chihuahua',
        codigoPostal: '31100',
        telefono: '614-987-6543'
      },
      metodoPago: 'tarjeta',
      subtotal: 26999,
      costoEnvio: 0,
      impuestos: 4319.84,
      total: 31318.84,
      estadoPago: 'pagado',
      estadoEnvio: 'entregado',
      fechaPago: new Date()
    });

    const orden2 = await Order.create({
      usuario: cliente2._id,
      productos: [
        { producto: productos[0]._id, nombre: 'iPhone 15 Pro Max', imagen: '/iphone15.png', precio: 28999, cantidad: 1 },
        { producto: productos[2]._id, nombre: 'Huawei Pura 70 Pro', imagen: '/huawei.png', precio: 18999, cantidad: 1 }
      ],
      direccionEnvio: {
        calle: 'Calle Reforma #890',
        ciudad: 'Chihuahua',
        estado: 'Chihuahua',
        codigoPostal: '31000',
        telefono: '614-555-1234'
      },
      metodoPago: 'paypal',
      subtotal: 47998,
      costoEnvio: 0,
      impuestos: 7679.68,
      total: 55677.68,
      estadoPago: 'pagado',
      estadoEnvio: 'enviado',
      fechaPago: new Date()
    });

    console.log('✅ 7/11 - Órdenes creadas (2)');

    // ============================
    // 8. ORDER ITEMS
    // ============================
    await OrderItem.create({
      orden: orden1._id,
      producto: productos[1]._id,
      nombre: 'Samsung Galaxy S24 Ultra',
      sku: 'SAM-S24U-256',
      imagen: '/samsung-s24.png',
      precio: 26999,
      cantidad: 1,
      subtotal: 26999
    });

    await OrderItem.create({
      orden: orden2._id,
      producto: productos[0]._id,
      nombre: 'iPhone 15 Pro Max',
      sku: 'APL-IP15PM-256',
      imagen: '/iphone15.png',
      precio: 28999,
      cantidad: 1,
      subtotal: 28999
    });

    await OrderItem.create({
      orden: orden2._id,
      producto: productos[2]._id,
      nombre: 'Huawei Pura 70 Pro',
      sku: 'HUA-P70P-512',
      imagen: '/huawei.png',
      precio: 18999,
      cantidad: 1,
      subtotal: 18999
    });

    console.log('✅ 8/11 - Order Items creados (3)');

    // ============================
    // 9. REVIEWS
    // ============================
    await Review.insertMany([
      { producto: productos[0]._id, usuario: cliente1._id, rating: 5, comentario: 'Excelente teléfono, la cámara es increíble.' },
      { producto: productos[0]._id, usuario: cliente2._id, rating: 5, comentario: 'El mejor iPhone que he tenido.' },
      { producto: productos[1]._id, usuario: cliente1._id, rating: 5, comentario: 'La pantalla es espectacular, me encanta.' },
      { producto: productos[1]._id, usuario: cliente2._id, rating: 4, comentario: 'Muy bueno pero un poco pesado.' },
      { producto: productos[2]._id, usuario: cliente2._id, rating: 5, comentario: 'La cámara Leica no decepciona.' },
      { producto: productos[3]._id, usuario: cliente1._id, rating: 5, comentario: 'Mejor que muchos flagships más caros.' },
      { producto: productos[4]._id, usuario: cliente2._id, rating: 4, comentario: 'Buen teléfono, las fotos son geniales.' }
    ]);

    console.log('✅ 9/11 - Reviews creadas (7)');

    // ============================
    // 10. MENSAJES DE CONTACTO
    // ============================
    await ContactMessage.insertMany([
      {
        nombre: 'Carlos García',
        email: 'carlos@gmail.com',
        asunto: 'Duda sobre envío',
        mensaje: '¿Cuánto tarda el envío a Monterrey?',
        estado: 'respondido',
        respondidoPor: admin._id,
        respuesta: 'El envío a Monterrey tarda de 2 a 3 días hábiles.'
      },
      {
        nombre: 'Ana Torres',
        email: 'ana@gmail.com',
        asunto: 'Garantía iPhone',
        mensaje: '¿La garantía del iPhone cubre daños por agua?',
        estado: 'leido'
      },
      {
        nombre: 'Pedro Sánchez',
        email: 'pedro@hotmail.com',
        asunto: 'Disponibilidad Samsung',
        mensaje: '¿Cuándo tendrán el Samsung S24 en color amarillo?',
        estado: 'nuevo'
      }
    ]);

    console.log('✅ 10/11 - Mensajes de contacto creados (3)');

    // ============================
    // 11. CONFIGURACIÓN
    // ============================
    await Setting.insertMany([
      { clave: 'nombre_tienda', valor: 'MovilStore', tipo: 'string', descripcion: 'Nombre de la tienda' },
      { clave: 'email_contacto', valor: 'contacto@movilstore.com', tipo: 'string', descripcion: 'Email de contacto' },
      { clave: 'telefono', valor: '+52 614 123 4567', tipo: 'string', descripcion: 'Teléfono de atención' },
      { clave: 'envio_gratis_minimo', valor: '5000', tipo: 'number', descripcion: 'Mínimo para envío gratis' },
      { clave: 'costo_envio', valor: '150', tipo: 'number', descripcion: 'Costo de envío estándar' },
      { clave: 'iva_porcentaje', valor: '16', tipo: 'number', descripcion: 'Porcentaje de IVA' },
      { clave: 'mantenimiento', valor: 'false', tipo: 'boolean', descripcion: 'Modo mantenimiento' }
    ]);

    console.log('✅ 11/11 - Configuración creada (7)');

    console.log('\n========================================');
    console.log('✅ BASE DE DATOS POBLADA CORRECTAMENTE');
    console.log('========================================');
    console.log('👤 Admin: admin@movilstore.com / Admin123!');
    console.log('👤 Cliente: juan@gmail.com / Cliente123!');
    console.log('👤 Cliente: maria@gmail.com / Cliente123!');
    console.log('========================================\n');

    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDB();
