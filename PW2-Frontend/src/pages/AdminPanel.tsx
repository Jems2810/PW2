import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SellIcon from '@mui/icons-material/Sell';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DashboardIcon from '@mui/icons-material/Dashboard';

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';
type AdminSection = 'dashboard' | 'products' | 'brands' | 'orders';

interface Product {
  _id: string;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  destacado: boolean;
  activo: boolean;
}

interface Brand {
  _id: string;
  nombre: string;
  slug: string;
  logo?: string;
  activo: boolean;
}

interface OrderUser {
  _id?: string;
  nombre: string;
  email: string;
}

interface OrderAddress {
  calle: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  telefono?: string;
}

interface OrderItem {
  producto?: string | { _id: string; nombre?: string };
  nombre?: string;
  imagen?: string;
  precio?: number;
  cantidad: number;
}

interface Order {
  _id: string;
  usuario: OrderUser;
  productos: OrderItem[];
  direccionEnvio: OrderAddress;
  metodoPago: 'tarjeta' | 'paypal' | 'transferencia' | 'efectivo';
  subtotal: number;
  costoEnvio: number;
  impuestos: number;
  total: number;
  estadoPago: 'pendiente' | 'pagado' | 'fallido';
  estadoEnvio: 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  fechaPago?: string;
  fechaEnvio?: string;
  fechaEntrega?: string;
  createdAt: string;
}

interface ContactMessage {
  _id: string;
  nombre: string;
  email: string;
  asunto?: string;
  mensaje: string;
  estado: 'nuevo' | 'leido' | 'respondido';
  respuesta?: string;
  createdAt: string;
}

interface ConnectionStatus {
  backend: boolean;
  mongodb: boolean;
  message: string;
}

interface Feedback {
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ProductFormState {
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio: string;
  stock: string;
  imagen: string;
  destacado: boolean;
  activo: boolean;
}

interface BrandFormState {
  nombre: string;
  logo: string;
  activo: boolean;
}

const emptyProductForm: ProductFormState = {
  nombre: '',
  marca: '',
  modelo: '',
  descripcion: '',
  precio: '',
  stock: '',
  imagen: '/placeholder.png',
  destacado: false,
  activo: true
};

const emptyBrandForm: BrandFormState = {
  nombre: '',
  logo: '',
  activo: true
};

const sectionMeta: Record<AdminSection, { label: string; description: string }> = {
  dashboard: {
    label: 'Dashboard',
    description: 'Resumen ejecutivo del catálogo y la operación actual.'
  },
  products: {
    label: 'Productos',
    description: 'Alta, edición, stock y activación de productos.'
  },
  brands: {
    label: 'Marcas',
    description: 'Catálogo de marcas disponible para todo el storefront.'
  },
  orders: {
    label: 'Pedidos',
    description: 'Seguimiento operativo de órdenes, pago y envío.'
  }
};

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

const formatDate = (value?: string) => {
  if (!value) {
    return 'Sin fecha';
  }

  return new Date(value).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const paymentBadgeClass: Record<Order['estadoPago'], string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagado: 'bg-green-100 text-green-700',
  fallido: 'bg-red-100 text-red-700'
};

const shippingBadgeClass: Record<Order['estadoEnvio'], string> = {
  procesando: 'bg-sky-100 text-sky-700',
  enviado: 'bg-violet-100 text-violet-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-gray-200 text-gray-700'
};

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: false,
    mongodb: false,
    message: 'Verificando conexión...'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [brandForm, setBrandForm] = useState<BrandFormState>(emptyBrandForm);

  const fetchJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(url, init);
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.message || 'Error de servidor';
      throw new Error(message);
    }

    return payload as T;
  };

  const loadCatalogData = async (token?: string) => {
    setLoading(true);

    try {
      const authHeaders = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;
      const querySuffix = token ? '?includeInactive=true' : '';

      const backendRes = await fetch(`${API_URL.replace('/api', '')}/`);

      if (!backendRes.ok) {
        throw new Error('El backend no respondió correctamente');
      }

      const [productsData, brandsData] = await Promise.all([
        fetchJson<Product[]>(`${API_URL}/products${querySuffix}`, { headers: authHeaders }),
        fetchJson<Brand[]>(`${API_URL}/brands${querySuffix}`, { headers: authHeaders })
      ]);

      setProducts(productsData);
      setBrands(brandsData);
      setStatus({
        backend: true,
        mongodb: true,
        message: `Conectado - ${productsData.length + brandsData.length} registros cargados`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar datos';

      if (token && /No autorizado/i.test(message)) {
        setFeedback({
          type: 'error',
          text: 'La sesión expiró o ya no tiene permisos de administrador.'
        });
      }

      setStatus({
        backend: false,
        mongodb: false,
        message: message || 'Error de conexión. ¿Está el backend corriendo en el puerto 5000?'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalogData(isAdmin ? user?.token : undefined);
  }, [isAdmin, user?.token]);

  useEffect(() => {
    if ((activeSection === 'orders' || activeSection === 'dashboard') && isAdmin && user?.token) {
      void loadOrders(user.token);
    }

    if (activeSection === 'dashboard' && isAdmin && user?.token) {
      void loadContactMessages(user.token);
    }

    if (!isAdmin) {
      setOrders([]);
      setSelectedOrder(null);
      setContactMessages([]);
    }
  }, [activeSection, isAdmin, user?.token]);

  const adminRequest = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    if (!user?.token || !isAdmin) {
      throw new Error('Inicia sesión como administrador para realizar esta acción');
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
      ...(init?.headers || {})
    };

    return fetchJson<T>(`${API_URL}${path}`, {
      ...init,
      headers
    });
  };

  const loadOrders = async (token?: string) => {
    if (!token) {
      setOrders([]);
      setSelectedOrder(null);
      return;
    }

    setOrdersLoading(true);

    try {
      const ordersData = await fetchJson<Order[]>(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(ordersData);

      if (selectedOrder) {
        const updatedSelection = ordersData.find((order) => order._id === selectedOrder._id);
        if (updatedSelection) {
          setSelectedOrder(updatedSelection);
        }
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudieron cargar los pedidos'
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadContactMessages = async (token?: string) => {
    if (!token) {
      setContactMessages([]);
      return;
    }

    setMessagesLoading(true);

    try {
      const messages = await fetchJson<ContactMessage[]>(`${API_URL}/contact`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setContactMessages(messages);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudieron cargar los mensajes de contacto'
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadOrderDetail = async (orderId: string) => {
    if (!user?.token || !isAdmin) {
      return;
    }

    setOrdersLoading(true);

    try {
      const orderDetail = await adminRequest<Order>(`/orders/${orderId}`);
      setSelectedOrder(orderDetail);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo abrir el detalle del pedido'
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = async () => {
    logout();
    setOrders([]);
    setSelectedOrder(null);
    setFeedback({ type: 'info', text: 'Sesión cerrada. El acceso administrativo quedó deshabilitado.' });
    await loadCatalogData();
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  };

  const resetBrandForm = () => {
    setEditingBrandId(null);
    setBrandForm(emptyBrandForm);
  };

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        nombre: productForm.nombre.trim(),
        marca: productForm.marca.trim(),
        modelo: productForm.modelo.trim(),
        descripcion: productForm.descripcion.trim(),
        precio: Number(productForm.precio),
        stock: Number(productForm.stock),
        imagen: productForm.imagen.trim() || '/placeholder.png',
        destacado: productForm.destacado,
        activo: productForm.activo
      };

      if (editingProductId) {
        await adminRequest(`/products/${editingProductId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', text: 'Producto actualizado correctamente.' });
      } else {
        await adminRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', text: 'Producto creado correctamente.' });
      }

      resetProductForm();
      await loadCatalogData(isAdmin ? user?.token : undefined);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo guardar el producto'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBrandSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        nombre: brandForm.nombre.trim(),
        logo: brandForm.logo.trim(),
        activo: brandForm.activo
      };

      if (editingBrandId) {
        await adminRequest(`/brands/${editingBrandId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', text: 'Marca actualizada correctamente.' });
      } else {
        await adminRequest('/brands', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', text: 'Marca creada correctamente.' });
      }

      resetBrandForm();
      await loadCatalogData(isAdmin ? user?.token : undefined);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo guardar la marca'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`¿Eliminar el producto "${product.nombre}"?`)) {
      return;
    }

    setSubmitting(true);
    try {
      await adminRequest(`/products/${product._id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', text: 'Producto eliminado correctamente.' });
      if (editingProductId === product._id) {
        resetProductForm();
      }
      await loadCatalogData(isAdmin ? user?.token : undefined);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo eliminar el producto'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (brand: Brand) => {
    if (!window.confirm(`¿Eliminar la marca "${brand.nombre}"?`)) {
      return;
    }

    setSubmitting(true);
    try {
      await adminRequest(`/brands/${brand._id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', text: 'Marca eliminada correctamente.' });
      if (editingBrandId === brand._id) {
        resetBrandForm();
      }
      await loadCatalogData(isAdmin ? user?.token : undefined);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo eliminar la marca'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, estadoEnvio: 'enviado' | 'entregado') => {
    setSubmitting(true);
    setFeedback(null);

    try {
      await adminRequest<Order>(`/orders/${orderId}/deliver`, {
        method: 'PUT',
        body: JSON.stringify({ estadoEnvio })
      });

      setFeedback({
        type: 'success',
        text: `Pedido actualizado a ${estadoEnvio}.`
      });

      await loadOrders(isAdmin ? user?.token : undefined);
      await loadOrderDetail(orderId);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo actualizar el pedido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return products;
    }

    return products.filter((product) =>
      [product.nombre, product.marca, product.modelo].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [products, searchTerm]);

  const filteredBrands = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return brands;
    }

    return brands.filter((brand) =>
      [brand.nombre, brand.slug].some((value) => value.toLowerCase().includes(term))
    );
  }, [brands, searchTerm]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return orders;
    }

    return orders.filter((order) =>
      [
        order._id,
        order.usuario?.nombre || '',
        order.usuario?.email || '',
        order.estadoPago,
        order.estadoEnvio,
        order.metodoPago
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [orders, searchTerm]);

  const lowStockProducts = useMemo(() => products.filter((product) => product.stock <= 5), [products]);
  const featuredProducts = useMemo(() => products.filter((product) => product.destacado), [products]);
  const unreadMessages = useMemo(() => contactMessages.filter((message) => message.estado === 'nuevo'), [contactMessages]);
  const paidOrders = useMemo(() => orders.filter((order) => order.estadoPago === 'pagado'), [orders]);
  const revenueTotal = useMemo(() => paidOrders.reduce((sum, order) => sum + order.total, 0), [paidOrders]);
  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);
  const recentMessages = useMemo(() => contactMessages.slice(0, 4), [contactMessages]);

  const activeProducts = products.filter((product) => product.activo).length;
  const activeBrands = brands.filter((brand) => brand.activo).length;
  const pendingOrders = orders.filter((order) => order.estadoEnvio === 'procesando').length;
  const deliveredOrders = orders.filter((order) => order.estadoEnvio === 'entregado').length;

  const hasAdminAccess = isAuthenticated && isAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 pt-24">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">
              Administración unificada
            </p>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard, catálogo y operación comercial</h1>
            <p className="mt-3 max-w-3xl text-gray-600">
              Este panel concentra el resumen ejecutivo del negocio, la gestión del catálogo y la operación comercial actual. Deja la lectura disponible para todos y habilita el CRUD completo al iniciar sesión como administrador.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => loadCatalogData(isAdmin ? user?.token : undefined)}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              disabled={loading}
            >
              <RefreshIcon fontSize="small" />
              Actualizar
            </button>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <LogoutIcon fontSize="small" />
                Cerrar sesión admin
              </button>
            ) : null}
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className={`rounded-2xl border-2 p-6 ${status.backend ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="mb-2 flex items-center gap-3">
              {status.backend ? <CheckCircleIcon className="text-green-500" fontSize="large" /> : <ErrorIcon className="text-red-500" fontSize="large" />}
              <h3 className="text-lg font-semibold">Backend</h3>
            </div>
            <p className="text-sm text-gray-600">{status.backend ? 'Express activo en puerto 5000' : 'Sin respuesta'}</p>
          </div>

          <div className={`rounded-2xl border-2 p-6 ${status.mongodb ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="mb-2 flex items-center gap-3">
              {status.mongodb ? <CheckCircleIcon className="text-green-500" fontSize="large" /> : <ErrorIcon className="text-red-500" fontSize="large" />}
              <h3 className="text-lg font-semibold">MongoDB</h3>
            </div>
            <p className="text-sm text-gray-600">{status.mongodb ? status.message : 'No fue posible cargar las colecciones'}</p>
          </div>

          <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-6">
            <div className="mb-2 flex items-center gap-3">
              <Inventory2Icon className="text-primary-600" fontSize="large" />
              <h3 className="text-lg font-semibold">Productos</h3>
            </div>
            <p className="text-sm text-gray-600">{activeProducts} activos / {products.length} totales</p>
          </div>

          <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-6">
            <div className="mb-2 flex items-center gap-3">
              <SellIcon className="text-sky-600" fontSize="large" />
              <h3 className="text-lg font-semibold">Marcas</h3>
            </div>
            <p className="text-sm text-gray-600">{activeBrands} activas / {brands.length} totales</p>
          </div>

          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-6">
            <div className="mb-2 flex items-center gap-3">
              <LocalShippingIcon className="text-violet-600" fontSize="large" />
              <h3 className="text-lg font-semibold">Pedidos</h3>
            </div>
            <p className="text-sm text-gray-600">
              {hasAdminAccess ? `${pendingOrders} procesando / ${deliveredOrders} entregados` : 'Acceso visible solo para administradores'}
            </p>
          </div>

        </div>

        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Módulos del panel</h2>
              <p className="text-sm text-gray-500">Una sola página, tres dominios de administración y una búsqueda contextual.</p>
            </div>

            <div className="w-full max-w-xs">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-400 focus:bg-white"
                placeholder="Buscar en la tabla actual..."
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(['dashboard', 'products', 'brands', 'orders'] as AdminSection[]).map((section) => {
              const isActive = activeSection === section;
              const meta = sectionMeta[section];

              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${isActive ? 'border-primary-300 bg-primary-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'}`}
                >
                  <p className="text-base font-semibold text-gray-900">{meta.label}</p>
                  <p className="mt-1 text-sm text-gray-500">{meta.description}</p>
                </button>
              );
            })}
          </div>

          {feedback ? (
            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : feedback.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
              {feedback.text}
            </div>
          ) : null}
        </div>

        {activeSection === 'dashboard' ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <DashboardIcon className="text-primary-600" />
                  <h2 className="text-lg font-bold text-gray-900">Resumen catálogo</h2>
                </div>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                <p className="mt-1 text-sm text-gray-500">productos totales, {featuredProducts.length} destacados</p>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <Inventory2Icon className="text-amber-600" />
                  <h2 className="text-lg font-bold text-gray-900">Stock bajo</h2>
                </div>
                <p className="text-3xl font-bold text-gray-900">{lowStockProducts.length}</p>
                <p className="mt-1 text-sm text-gray-500">productos con 5 unidades o menos</p>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <LocalShippingIcon className="text-violet-600" />
                  <h2 className="text-lg font-bold text-gray-900">Ventas</h2>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenueTotal)}</p>
                <p className="mt-1 text-sm text-gray-500">acumulado en pedidos pagados</p>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <MailOutlineIcon className="text-sky-600" />
                  <h2 className="text-lg font-bold text-gray-900">Mensajes</h2>
                </div>
                <p className="text-3xl font-bold text-gray-900">{hasAdminAccess ? unreadMessages.length : 0}</p>
                <p className="mt-1 text-sm text-gray-500">nuevos por revisar desde contacto</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Pedidos recientes</h2>
                    <p className="text-sm text-gray-500">Vista rápida de la operación comercial más reciente.</p>
                  </div>
                </div>

                {!hasAdminAccess ? (
                  <div className="p-12 text-center text-gray-500">Inicia sesión como administrador para ver métricas operativas.</div>
                ) : ordersLoading ? (
                  <div className="p-12 text-center text-gray-500">Cargando pedidos...</div>
                ) : recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 text-left text-sm text-gray-500">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Pedido</th>
                          <th className="px-6 py-4 font-semibold">Cliente</th>
                          <th className="px-6 py-4 font-semibold">Total</th>
                          <th className="px-6 py-4 font-semibold">Envío</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order._id} className="border-t border-gray-100 text-sm text-gray-700">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">{order.usuario?.nombre}</p>
                              <p className="text-xs text-gray-500">{order.usuario?.email}</p>
                            </td>
                            <td className="px-6 py-4 font-semibold text-emerald-600">{formatCurrency(order.total)}</td>
                            <td className="px-6 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${shippingBadgeClass[order.estadoEnvio]}`}>
                                {order.estadoEnvio}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500">No hay pedidos para resumir.</div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <MailOutlineIcon className="text-sky-600" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Mensajes recientes</h2>
                      <p className="text-sm text-gray-500">Últimos contactos recibidos desde la web.</p>
                    </div>
                  </div>

                  {!hasAdminAccess ? (
                    <p className="text-sm text-gray-500">Acceso disponible solo para administradores.</p>
                  ) : messagesLoading ? (
                    <p className="text-sm text-gray-500">Cargando mensajes...</p>
                  ) : recentMessages.length > 0 ? (
                    <div className="space-y-3">
                      {recentMessages.map((message) => (
                        <div key={message._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="font-semibold text-gray-900">{message.nombre}</p>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${message.estado === 'nuevo' ? 'bg-amber-100 text-amber-700' : message.estado === 'respondido' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'}`}>
                              {message.estado}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{message.asunto || 'Sin asunto'}</p>
                          <p className="mt-1 text-xs text-gray-500">{message.email}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay mensajes recientes.</p>
                  )}
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <Inventory2Icon className="text-amber-600" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Productos con bajo stock</h2>
                      <p className="text-sm text-gray-500">Prioriza reposición en estos modelos.</p>
                    </div>
                  </div>

                  {lowStockProducts.length > 0 ? (
                    <div className="space-y-3">
                      {lowStockProducts.slice(0, 5).map((product) => (
                        <div key={product._id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{product.nombre}</p>
                            <p className="text-xs text-gray-500">{product.marca} · {product.modelo}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {product.stock} en stock
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay productos con stock comprometido.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === 'products' ? (
          <div className="grid gap-6 xl:grid-cols-[1.05fr,1.6fr]">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de productos</h2>
                  <p className="text-sm text-gray-500">Usa marcas existentes o escribe una nueva. El backend ya admite nombres libres.</p>
                </div>

                {editingProductId ? (
                  <button type="button" onClick={resetProductForm} className="text-sm font-semibold text-gray-500 transition hover:text-gray-800">
                    Cancelar edición
                  </button>
                ) : null}
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label htmlFor="product-name" className="mb-2 block text-sm font-medium text-gray-700">Nombre</label>
                  <input id="product-name" value={productForm.nombre} onChange={(event) => setProductForm((current) => ({ ...current, nombre: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="iPhone 16 Pro" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="product-brand" className="mb-2 block text-sm font-medium text-gray-700">Marca</label>
                    <input id="product-brand" list="admin-brands" value={productForm.marca} onChange={(event) => setProductForm((current) => ({ ...current, marca: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="Apple" />
                    <datalist id="admin-brands">
                      {brands.map((brand) => (
                        <option key={brand._id} value={brand.nombre} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label htmlFor="product-model" className="mb-2 block text-sm font-medium text-gray-700">Modelo</label>
                    <input id="product-model" value={productForm.modelo} onChange={(event) => setProductForm((current) => ({ ...current, modelo: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="256 GB" />
                  </div>
                </div>

                <div>
                  <label htmlFor="product-description" className="mb-2 block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea id="product-description" value={productForm.descripcion} onChange={(event) => setProductForm((current) => ({ ...current, descripcion: event.target.value }))} rows={4} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="Resumen comercial del producto" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="product-price" className="mb-2 block text-sm font-medium text-gray-700">Precio</label>
                    <input id="product-price" type="number" min="0" value={productForm.precio} onChange={(event) => setProductForm((current) => ({ ...current, precio: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="0" />
                  </div>

                  <div>
                    <label htmlFor="product-stock" className="mb-2 block text-sm font-medium text-gray-700">Stock</label>
                    <input id="product-stock" type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="0" />
                  </div>

                  <div>
                    <label htmlFor="product-image" className="mb-2 block text-sm font-medium text-gray-700">Imagen</label>
                    <input id="product-image" value={productForm.imagen} onChange={(event) => setProductForm((current) => ({ ...current, imagen: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="/placeholder.png" />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={productForm.destacado} onChange={(event) => setProductForm((current) => ({ ...current, destacado: event.target.checked }))} />
                    Producto destacado
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <input type="checkbox" checked={productForm.activo} onChange={(event) => setProductForm((current) => ({ ...current, activo: event.target.checked }))} />
                    Producto activo
                  </label>
                </div>

                <button type="submit" disabled={!isAuthenticated || submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300">
                  {editingProductId ? <SaveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                  {editingProductId ? 'Guardar cambios del producto' : 'Crear producto'}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Listado de productos</h2>
                  <p className="text-sm text-gray-500">{filteredProducts.length} resultado(s) en el módulo actual.</p>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-500">Cargando productos...</div>
              ) : filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 text-left text-sm text-gray-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Producto</th>
                        <th className="px-6 py-4 font-semibold">Marca</th>
                        <th className="px-6 py-4 font-semibold">Precio</th>
                        <th className="px-6 py-4 font-semibold">Stock</th>
                        <th className="px-6 py-4 font-semibold">Estado</th>
                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product._id} className="border-t border-gray-100 text-sm text-gray-700">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{product.nombre}</p>
                            <p className="text-xs text-gray-500">{product.modelo}</p>
                          </td>
                          <td className="px-6 py-4">{product.marca}</td>
                          <td className="px-6 py-4 font-semibold text-green-600">${product.precio.toLocaleString()}</td>
                          <td className="px-6 py-4">{product.stock}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                              {product.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProductId(product._id);
                                  setProductForm({
                                    nombre: product.nombre,
                                    marca: product.marca,
                                    modelo: product.modelo,
                                    descripcion: product.descripcion,
                                    precio: String(product.precio),
                                    stock: String(product.stock),
                                    imagen: product.imagen || '/placeholder.png',
                                    destacado: product.destacado,
                                    activo: product.activo
                                  });
                                }}
                                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                                disabled={!isAuthenticated}
                              >
                                <EditIcon fontSize="small" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product)}
                                className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-300"
                                disabled={!isAuthenticated}
                              >
                                <DeleteIcon fontSize="small" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">No hay productos para mostrar.</div>
              )}
            </div>
          </div>
        ) : null}

        {activeSection === 'brands' ? (
          <div className="grid gap-6 xl:grid-cols-[0.95fr,1.7fr]">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de marcas</h2>
                  <p className="text-sm text-gray-500">Las marcas alimentan el selector de productos y el contenido público.</p>
                </div>

                {editingBrandId ? (
                  <button type="button" onClick={resetBrandForm} className="text-sm font-semibold text-gray-500 transition hover:text-gray-800">
                    Cancelar edición
                  </button>
                ) : null}
              </div>

              <form onSubmit={handleBrandSubmit} className="space-y-4">
                <div>
                  <label htmlFor="brand-name" className="mb-2 block text-sm font-medium text-gray-700">Nombre</label>
                  <input id="brand-name" value={brandForm.nombre} onChange={(event) => setBrandForm((current) => ({ ...current, nombre: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="Nothing" />
                </div>

                <div>
                  <label htmlFor="brand-logo" className="mb-2 block text-sm font-medium text-gray-700">Logo</label>
                  <input id="brand-logo" value={brandForm.logo} onChange={(event) => setBrandForm((current) => ({ ...current, logo: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="https://..." />
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" checked={brandForm.activo} onChange={(event) => setBrandForm((current) => ({ ...current, activo: event.target.checked }))} />
                  Marca activa
                </label>

                <button type="submit" disabled={!isAuthenticated || submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300">
                  {editingBrandId ? <SaveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                  {editingBrandId ? 'Guardar cambios de la marca' : 'Crear marca'}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Listado de marcas</h2>
                  <p className="text-sm text-gray-500">{filteredBrands.length} resultado(s) en el módulo actual.</p>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-500">Cargando marcas...</div>
              ) : filteredBrands.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 text-left text-sm text-gray-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Marca</th>
                        <th className="px-6 py-4 font-semibold">Slug</th>
                        <th className="px-6 py-4 font-semibold">Estado</th>
                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBrands.map((brand) => (
                        <tr key={brand._id} className="border-t border-gray-100 text-sm text-gray-700">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{brand.nombre}</p>
                            <p className="text-xs text-gray-500">{brand.logo || 'Sin logo registrado'}</p>
                          </td>
                          <td className="px-6 py-4">{brand.slug}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${brand.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                              {brand.activo ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBrandId(brand._id);
                                  setBrandForm({
                                    nombre: brand.nombre,
                                    logo: brand.logo || '',
                                    activo: brand.activo
                                  });
                                }}
                                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                                disabled={!isAuthenticated}
                              >
                                <EditIcon fontSize="small" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBrand(brand)}
                                className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-300"
                                disabled={!isAuthenticated}
                              >
                                <DeleteIcon fontSize="small" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">No hay marcas para mostrar.</div>
              )}
            </div>
          </div>
        ) : null}

        {activeSection === 'orders' ? (
          <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr]">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Listado de pedidos</h2>
                  <p className="text-sm text-gray-500">
                    {hasAdminAccess ? `${filteredOrders.length} pedido(s) visibles en el módulo actual.` : 'Inicia sesión con una cuenta admin para consultar y actualizar pedidos.'}
                  </p>
                </div>
              </div>

              {!hasAdminAccess ? (
                <div className="p-12 text-center text-gray-500">
                  Esta sección requiere una cuenta con rol de administrador.
                </div>
              ) : ordersLoading ? (
                <div className="p-12 text-center text-gray-500">Cargando pedidos...</div>
              ) : filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 text-left text-sm text-gray-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Pedido</th>
                        <th className="px-6 py-4 font-semibold">Cliente</th>
                        <th className="px-6 py-4 font-semibold">Total</th>
                        <th className="px-6 py-4 font-semibold">Pago</th>
                        <th className="px-6 py-4 font-semibold">Envío</th>
                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id} className="border-t border-gray-100 text-sm text-gray-700">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{order.usuario?.nombre || 'Cliente sin nombre'}</p>
                            <p className="text-xs text-gray-500">{order.usuario?.email || 'Sin email'}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold text-emerald-600">{formatCurrency(order.total)}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass[order.estadoPago]}`}>
                              {order.estadoPago}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${shippingBadgeClass[order.estadoEnvio]}`}>
                              {order.estadoEnvio}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => loadOrderDetail(order._id)}
                                className="rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
                              >
                                Ver detalle
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">No hay pedidos para mostrar.</div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detalle del pedido</h2>
                  <p className="text-sm text-gray-500">Selecciona una orden para revisar productos, dirección y estados.</p>
                </div>
              </div>

              {selectedOrder ? (
                <div className="space-y-5 text-sm text-gray-700">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Pedido</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">#{selectedOrder._id}</p>
                    <p className="mt-1 text-gray-500">Creado el {formatDate(selectedOrder.createdAt)}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="font-semibold text-gray-900">Cliente</p>
                      <p className="mt-2">{selectedOrder.usuario?.nombre}</p>
                      <p className="text-gray-500">{selectedOrder.usuario?.email}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-4">
                      <p className="font-semibold text-gray-900">Pago y envío</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass[selectedOrder.estadoPago]}`}>
                          Pago: {selectedOrder.estadoPago}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${shippingBadgeClass[selectedOrder.estadoEnvio]}`}>
                          Envío: {selectedOrder.estadoEnvio}
                        </span>
                      </div>
                      <p className="mt-3 text-gray-500">Método de pago: {selectedOrder.metodoPago}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900">Dirección de envío</p>
                    <p className="mt-2">{selectedOrder.direccionEnvio.calle}</p>
                    <p>{selectedOrder.direccionEnvio.ciudad}, {selectedOrder.direccionEnvio.estado} {selectedOrder.direccionEnvio.codigoPostal}</p>
                    <p className="text-gray-500">Teléfono: {selectedOrder.direccionEnvio.telefono || 'No registrado'}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900">Productos</p>
                    <div className="mt-3 space-y-3">
                      {selectedOrder.productos.map((item, index) => (
                        <div key={`${selectedOrder._id}-${index}`} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.nombre || (typeof item.producto === 'object' ? item.producto?.nombre : 'Producto')}</p>
                            <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
                          </div>
                          <p className="font-semibold text-gray-700">{formatCurrency((item.precio || 0) * item.cantidad)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="font-semibold text-gray-900">Totales</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                      <div className="flex items-center justify-between"><span>Envío</span><span>{formatCurrency(selectedOrder.costoEnvio)}</span></div>
                      <div className="flex items-center justify-between"><span>Impuestos</span><span>{formatCurrency(selectedOrder.impuestos)}</span></div>
                      <div className="flex items-center justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900"><span>Total</span><span>{formatCurrency(selectedOrder.total)}</span></div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'enviado')}
                      disabled={!isAuthenticated || submitting || selectedOrder.estadoEnvio === 'enviado' || selectedOrder.estadoEnvio === 'entregado'}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
                    >
                      <LocalShippingIcon fontSize="small" />
                      Marcar como enviado
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'entregado')}
                      disabled={!isAuthenticated || submitting || selectedOrder.estadoEnvio === 'entregado'}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      <CheckCircleIcon fontSize="small" />
                      Marcar como entregado
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                  {hasAdminAccess ? 'Selecciona un pedido de la tabla para abrir su detalle.' : 'Inicia sesión con una cuenta admin para acceder al detalle de pedidos.'}
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl bg-gray-900 px-6 py-5 text-sm text-gray-300 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="font-semibold text-white">Backend observado</p>
              <p>GET/POST/PUT/DELETE para productos y marcas, más consulta y actualización de pedidos.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Alcance de esta vista</p>
              <p>Un solo flujo para el catálogo y la operación comercial actual, con soporte de pedidos autenticados para admin.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Siguiente mejora natural</p>
              <p>Agregar bandeja de contacto o ajustes generales de tienda dentro del mismo panel.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
