# PW2

Proyecto de Programacion Web 2: tienda de celulares "MovilStore" con frontend en React + Vite y backend en Node.js + Express conectado a MongoDB.

## Estructura del proyecto

```text
PW2/
├── PW2-Frontend/
└── PW2-Backend/
```

## Tecnologias utilizadas

- Frontend: React, TypeScript, Vite, Tailwind CSS, Material UI
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs
- Base de datos: MongoDB

## Funcionalidades implementadas

- Catalogo visual de smartphones
- Login y registro de usuarios
- Carrito de compras
- Panel de administracion para demostrar conexion con backend y MongoDB
- API REST para productos, usuarios, ordenes, marcas, categorias, resenas y contacto

## Base de datos

La base de datos utilizada es `PW2` en MongoDB.

Colecciones principales:

- `users`
- `addresses`
- `categories`
- `brands`
- `products`
- `cartitems`
- `orders`
- `orderitems`
- `reviews`
- `contactmessages`
- `settings`

## Requisitos previos

- Node.js instalado
- MongoDB local ejecutandose en `mongodb://localhost:27017`
- Git

## Variables de entorno del backend

Crear el archivo `PW2-Backend/.env` con base en `PW2-Backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/PW2
JWT_SECRET=tu_clave_secreta
```

## Instalacion

### Frontend

```bash
cd PW2-Frontend
npm install
```

### Backend

```bash
cd PW2-Backend
npm install
```

## Ejecucion del proyecto

### 1. Ejecutar backend

```bash
cd PW2-Backend
npm run dev
```

Salida esperada:

```text
Servidor corriendo en puerto 5000
MongoDB Conectado: localhost
```

### 2. Ejecutar frontend

```bash
cd PW2-Frontend
npm run dev
```

Frontend disponible normalmente en:

```text
http://localhost:5173
```

## Poblar la base de datos con datos de prueba

```bash
cd PW2-Backend
node seed.js
```

Esto genera datos de prueba en las colecciones de MongoDB.

## Endpoints principales

- `GET /` - estado de la API
- `POST /api/auth/register` - registro de usuario
- `POST /api/auth/login` - inicio de sesion
- `GET /api/products` - obtener productos
- `GET /api/brands` - obtener marcas
- `GET /api/categories` - obtener categorias
- `GET /api/orders` - obtener ordenes
- `GET /api/reviews/product/:productId` - obtener resenas de un producto

## Validacion de conexion con MongoDB

La conexion backend -> MongoDB puede validarse de tres formas:

1. Revisar la terminal del backend:

```text
MongoDB Conectado: localhost
```

2. Abrir en navegador:

- `http://localhost:5000/api/products`
- `http://localhost:5000/api/brands`
- `http://localhost:5000/api/categories`

3. Abrir el panel de administracion del frontend:

```text
http://localhost:5173/admin
```

En esa pantalla se muestran datos en tiempo real obtenidos desde MongoDB por medio del backend.

## Credenciales de prueba

- Admin: `admin@movilstore.com` / `Admin123!`
- Cliente: `juan@gmail.com` / `Cliente123!`
- Cliente: `maria@gmail.com` / `Cliente123!`

## Autor

Proyecto academico para Programacion Web 2.