import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import StorageIcon from '@mui/icons-material/Storage';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const API_URL = 'http://localhost:5000/api';

interface Product {
  _id: string;
  nombre: string;
  marca: string;
  modelo: string;
  precio: number;
  stock: number;
  imagen: string;
}

interface Brand {
  _id: string;
  nombre: string;
  slug: string;
}

interface Category {
  _id: string;
  nombre: string;
  slug: string;
}

interface ConnectionStatus {
  backend: boolean;
  mongodb: boolean;
  message: string;
}

interface TestProductPayload {
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
}

const buildTestProduct = (): TestProductPayload => {
  const suffix = Date.now().toString().slice(-6);

  return {
    nombre: `Producto de Prueba ${suffix}`,
    marca: 'Xiaomi',
    modelo: `Test-${suffix}`,
    descripcion: 'Producto creado para demostrar conexión entre React, Express y MongoDB.',
    precio: 9999,
    stock: 5,
    imagen: '/placeholder.png'
  };
};

const AdminPanel: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: false,
    mongodb: false,
    message: 'Verificando conexión...'
  });
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Verificar conexión y cargar productos
  const checkConnection = async () => {
    setLoading(true);
    try {
      // Verificar backend
      const backendRes = await fetch(`${API_URL.replace('/api', '')}/`);

      if (!backendRes.ok) {
        throw new Error('El backend no respondió correctamente');
      }
      
      // Cargar productos (esto verifica MongoDB)
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/brands`),
        fetch(`${API_URL}/categories`)
      ]);

      if (!productsRes.ok || !brandsRes.ok || !categoriesRes.ok) {
        throw new Error('No se pudieron obtener los productos desde MongoDB');
      }

      const [productsData, brandsData, categoriesData] = await Promise.all([
        productsRes.json(),
        brandsRes.json(),
        categoriesRes.json()
      ]);
      
      setProducts(productsData);
      setBrands(brandsData);
      setCategories(categoriesData);
      setStatus({
        backend: true,
        mongodb: true,
        message: `Conectado - ${productsData.length + brandsData.length + categoriesData.length} documentos configurados en MongoDB`
      });
    } catch (error) {
      setStatus({
        backend: false,
        mongodb: false,
        message: 'Error de conexión. ¿Está el backend corriendo en puerto 5000?'
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  // Crear producto de prueba
  const createTestProduct = async () => {
    try {
      setActionMessage('Creando producto...');
      const testProduct = buildTestProduct();
      
      // Primero hacer login como admin para obtener token
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@movilstore.com',
          password: 'Admin123!'
        })
      });
      
      if (!loginRes.ok) {
        setActionMessage('Error: No se pudo autenticar como admin');
        return;
      }
      
      const { token } = await loginRes.json();
      
      // Crear producto
      const createRes = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testProduct)
      });
      
      if (createRes.ok) {
        setActionMessage('✅ Producto creado exitosamente en MongoDB');
        checkConnection(); // Recargar productos
      } else {
        const errorData = await createRes.json().catch(() => null);
        setActionMessage(errorData?.message ? `Error al crear producto: ${errorData.message}` : 'Error al crear producto');
      }
    } catch (error) {
      setActionMessage(error instanceof Error ? `Error de conexión: ${error.message}` : 'Error de conexión');
    }
  };

  // Eliminar producto
  const deleteProduct = async (id: string, nombre: string) => {
    try {
      setActionMessage(`Eliminando ${nombre}...`);
      
      // Login como admin
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@movilstore.com',
          password: 'Admin123!'
        })
      });
      
      const { token } = await loginRes.json();
      
      // Eliminar
      const deleteRes = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (deleteRes.ok) {
        setActionMessage(`✅ "${nombre}" eliminado de MongoDB`);
        checkConnection();
      } else {
        const errorData = await deleteRes.json().catch(() => null);
        setActionMessage(errorData?.message ? `Error al eliminar: ${errorData.message}` : 'Error al eliminar');
      }
    } catch (error) {
      setActionMessage(error instanceof Error ? `Error al eliminar: ${error.message}` : 'Error al eliminar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12 pt-24">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Demostración de conexión Backend + MongoDB
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
          {/* Backend Status */}
          <div className={`p-6 rounded-2xl border-2 ${status.backend ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              {status.backend ? (
                <CheckCircleIcon className="text-green-500" fontSize="large" />
              ) : (
                <ErrorIcon className="text-red-500" fontSize="large" />
              )}
              <h3 className="text-lg font-semibold">Backend (Express)</h3>
            </div>
            <p className="text-sm text-gray-600">
              {status.backend ? 'Conectado en puerto 5000' : 'Desconectado'}
            </p>
          </div>

          {/* MongoDB Status */}
          <div className={`p-6 rounded-2xl border-2 ${status.mongodb ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              {status.mongodb ? (
                <CheckCircleIcon className="text-green-500" fontSize="large" />
              ) : (
                <ErrorIcon className="text-red-500" fontSize="large" />
              )}
              <h3 className="text-lg font-semibold">MongoDB</h3>
            </div>
            <p className="text-sm text-gray-600">
              {status.mongodb ? 'Base de datos PW2 conectada' : 'Sin conexión'}
            </p>
          </div>

          {/* Products Count */}
          <div className="p-6 rounded-2xl border-2 bg-primary-50 border-primary-200">
            <div className="flex items-center gap-3 mb-2">
              <StorageIcon className="text-primary-500" fontSize="large" />
              <h3 className="text-lg font-semibold">Productos</h3>
            </div>
            <p className="text-sm text-gray-600">
              {products.length} documentos en la colección
            </p>
          </div>

          <div className="p-6 rounded-2xl border-2 bg-white border-sky-200">
            <div className="flex items-center gap-3 mb-2">
              <StorageIcon className="text-sky-500" fontSize="large" />
              <h3 className="text-lg font-semibold">Marcas</h3>
            </div>
            <p className="text-sm text-gray-600">
              {brands.length} documentos en la colección
            </p>
          </div>

          <div className="p-6 rounded-2xl border-2 bg-white border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <StorageIcon className="text-amber-500" fontSize="large" />
              <h3 className="text-lg font-semibold">Categorías</h3>
            </div>
            <p className="text-sm text-gray-600">
              {categories.length} documentos en la colección
            </p>
          </div>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center text-blue-700 font-medium">
            {actionMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button
            onClick={checkConnection}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
          >
            <RefreshIcon />
            Actualizar Datos
          </button>
          
          <button
            onClick={createTestProduct}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            <AddIcon />
            Crear Producto de Prueba
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <StorageIcon className="text-primary-500" />
              Productos en MongoDB (Tiempo Real)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Estos datos vienen directamente de la base de datos MongoDB
            </p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando desde MongoDB...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">ID MongoDB</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Producto</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Marca</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Precio</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-4 font-mono text-xs text-gray-500">
                        {product._id.substring(0, 12)}...
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-800">{product.nombre}</span>
                      </td>
                      <td className="p-4 text-gray-600">{product.marca}</td>
                      <td className="p-4 text-green-600 font-semibold">
                        ${product.precio.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10 ? 'bg-green-100 text-green-700' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => deleteProduct(product._id, product.nombre)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar producto"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No hay productos en la base de datos
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-10">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Marcas en MongoDB</h2>
              <p className="text-sm text-gray-500 mt-1">Coleccion `brands` consultada desde la API.</p>
            </div>
            <div className="p-6 space-y-3">
              {brands.slice(0, 6).map((brand) => (
                <div key={brand._id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                  <span className="font-medium text-gray-800">{brand.nombre}</span>
                  <span className="text-xs text-gray-500">{brand.slug}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Categorías en MongoDB</h2>
              <p className="text-sm text-gray-500 mt-1">Coleccion `categories` consultada desde la API.</p>
            </div>
            <div className="p-6 space-y-3">
              {categories.slice(0, 6).map((category) => (
                <div key={category._id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                  <span className="font-medium text-gray-800">{category.nombre}</span>
                  <span className="text-xs text-gray-500">{category.slug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-10 p-6 bg-gray-800 rounded-2xl text-white">
          <h3 className="text-lg font-bold mb-4">📋 Información Técnica</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <p className="text-gray-400">Backend URL:</p>
              <p className="text-green-400">http://localhost:5000</p>
            </div>
            <div>
              <p className="text-gray-400">MongoDB URI:</p>
              <p className="text-green-400">mongodb://localhost:27017/PW2</p>
            </div>
            <div>
              <p className="text-gray-400">API Endpoint:</p>
              <p className="text-green-400">GET /api/products</p>
            </div>
            <div>
              <p className="text-gray-400">Colección:</p>
              <p className="text-green-400">products</p>
            </div>
            <div>
              <p className="text-gray-400">Endpoints extra:</p>
              <p className="text-green-400">/api/brands, /api/categories</p>
            </div>
            <div>
              <p className="text-gray-400">Colecciones demo:</p>
              <p className="text-green-400">products, brands, categories</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
