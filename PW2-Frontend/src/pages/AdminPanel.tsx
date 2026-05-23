import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

type AdminSection = 'dashboard' | 'products' | 'brands' | 'categories' | 'orders' | 'messages' | 'reviews' | 'users' | 'settings';

interface Product {
  _id: string;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  stock: number;
  imagen: string;
  destacado: boolean;
  activo: boolean;
  coloresDisponibles?: string[];
  especificaciones?: {
    pantalla?: string;
    procesador?: string;
    ram?: string;
    almacenamiento?: string;
    camara?: string;
    bateria?: string;
    sistemaOperativo?: string;
  };
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
  respondidoPor?: { _id: string; nombre: string } | string;
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
  precioOferta: string;
  stock: string;
  imagen: string;
  destacado: boolean;
  activo: boolean;
  coloresDisponibles: string[];
  pantalla: string;
  procesador: string;
  ram: string;
  almacenamiento: string;
  camara: string;
  bateria: string;
  sistemaOperativo: string;
}

interface BrandFormState {
  nombre: string;
  logo: string;
  activo: boolean;
}

interface Category {
  _id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagen?: string;
  activo: boolean;
}

interface CategoryFormState {
  nombre: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
}

interface AppUser {
  _id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'admin' | 'usuario';
  createdAt: string;
}

interface ReviewItem {
  _id: string;
  rating: number;
  comentario?: string;
  aprobado: boolean;
  createdAt: string;
  usuario: { _id: string; nombre: string; email: string } | null;
  producto: { _id: string; nombre: string; imagen?: string } | null;
}

interface SettingItem {
  _id: string;
  clave: string;
  valor: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  descripcion?: string;
  updatedBy?: { _id: string; nombre: string } | null;
  updatedAt: string;
}

interface SettingFormState {
  clave: string;
  valor: string;
}

const emptyProductForm: ProductFormState = {
  nombre: '',
  marca: '',
  modelo: '',
  descripcion: '',
  precio: '',
  precioOferta: '',
  stock: '',
  imagen: '',
  destacado: false,
  activo: true,
  coloresDisponibles: [],
  pantalla: '',
  procesador: '',
  ram: '',
  almacenamiento: '',
  camara: '',
  bateria: '',
  sistemaOperativo: ''
};

const emptyBrandForm: BrandFormState = {
  nombre: '',
  logo: '',
  activo: true
};

const emptyCategoryForm: CategoryFormState = {
  nombre: '',
  descripcion: '',
  imagen: '',
  activo: true
};

const emptySettingForm: SettingFormState = {
  clave: '',
  valor: ''
};

const DEFAULT_SETTING_KEYS: Array<{ clave: string; descripcion: string; placeholder: string }> = [
  { clave: 'site_name', descripcion: 'Nombre público de la tienda', placeholder: 'MovilStore' },
  { clave: 'site_email', descripcion: 'Email de contacto público', placeholder: 'contacto@movilstore.mx' },
  { clave: 'site_phone', descripcion: 'Teléfono de atención', placeholder: '+52 ...' },
  { clave: 'envio_gratis_min', descripcion: 'Monto mínimo para envío gratis', placeholder: '5000' },
  { clave: 'iva_porcentaje', descripcion: 'IVA aplicado al checkout (%)', placeholder: '16' }
];

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
  categories: {
    label: 'Categorías',
    description: 'Agrupaciones temáticas usadas por el catálogo.'
  },
  orders: {
    label: 'Pedidos',
    description: 'Seguimiento operativo de órdenes, pago y envío.'
  },
  messages: {
    label: 'Mensajes',
    description: 'Bandeja de contacto: lee, responde y archiva mensajes.'
  },
  reviews: {
    label: 'Reseñas',
    description: 'Modera, aprueba u oculta reseñas de productos.'
  },
  users: {
    label: 'Usuarios',
    description: 'Gestiona cuentas registradas y sus roles.'
  },
  settings: {
    label: 'Configuración',
    description: 'Parámetros generales del sitio (clave / valor).'
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

const MAX_IMAGE_BYTES = 500 * 1024; // 500 KB

const ImageUpload: React.FC<{
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  label?: string;
}> = ({ value, onChange, placeholder = 'https://... o sube un archivo', label = 'Imagen' }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`La imagen supera ${Math.round(MAX_IMAGE_BYTES / 1024)} KB. Usa una más pequeña.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result);
    };
    reader.onerror = () => setError('No se pudo leer el archivo.');
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-3">
        {value ? (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img src={value} alt="preview" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-2">
          <input
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none transition focus:border-primary-400 focus:bg-white"
            placeholder={placeholder}
            disabled={value.startsWith('data:')}
          />
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">
              Subir archivo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = '';
                }}
              />
            </label>
            {value ? (
              <button type="button" onClick={() => { onChange(''); setError(null); }} className="text-xs font-semibold text-red-600 hover:text-red-700">
                Quitar
              </button>
            ) : null}
            <span className="text-[10px] text-gray-400">JPG/PNG/WEBP · máx 500 KB</span>
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
};
const SettingRow: React.FC<{
  clave: string;
  descripcion: string;
  placeholder: string;
  initialValue: string;
  updatedAt?: string;
  updatedBy?: string;
  onSave: (value: string) => void | Promise<void>;
  disabled: boolean;
}> = ({ clave, descripcion, placeholder, initialValue, updatedAt, updatedBy, onSave, disabled }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const dirty = value !== initialValue;

  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-gray-500">{clave}</p>
          <p className="text-sm text-gray-700">{descripcion}</p>
        </div>
        {updatedAt ? (
          <span className="text-right text-[10px] text-gray-400">
            {updatedBy ? `Por ${updatedBy}` : ''}<br />{formatDate(updatedAt)}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:bg-white"
        />
        <button
          type="button"
          onClick={() => void onSave(value)}
          disabled={disabled || !dirty}
          className="inline-flex items-center gap-1 rounded-xl bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          <SaveIcon fontSize="inherit" /> Guardar
        </button>
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
  } | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const askConfirm = (opts: { title: string; message: string; confirmText?: string; danger?: boolean }) =>
    new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmDialog(opts);
    });

  const resolveConfirm = (value: boolean) => {
    const resolver = confirmResolverRef.current;
    confirmResolverRef.current = null;
    setConfirmDialog(null);
    resolver?.(value);
  };
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
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [messageFilter, setMessageFilter] = useState<'todos' | 'nuevo' | 'leido' | 'respondido'>('todos');

  // Categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);

  // Usuarios
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Reseñas
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'todas' | 'aprobadas' | 'ocultas'>('todas');

  // Configuración
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingForm, setSettingForm] = useState<SettingFormState>(emptySettingForm);

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

    if ((activeSection === 'dashboard' || activeSection === 'messages') && isAdmin && user?.token) {
      void loadContactMessages(user.token);
    }

    if (!isAdmin) {
      setOrders([]);
      setSelectedOrder(null);
      setContactMessages([]);
      setSelectedMessage(null);
      setAppUsers([]);
      setAllReviews([]);
      setSettings([]);
    }

    if (activeSection === 'categories' && user?.token) {
      void loadCategories(isAdmin ? user.token : undefined);
    }
    if (activeSection === 'users' && isAdmin && user?.token) {
      void loadAppUsers(user.token);
    }
    if (activeSection === 'reviews' && isAdmin && user?.token) {
      void loadAllReviews(user.token);
    }
    if (activeSection === 'settings' && isAdmin && user?.token) {
      void loadSettings(user.token);
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

  const loadCategories = async (token?: string) => {
    setCategoriesLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const suffix = token ? '?includeInactive=true' : '';
      const data = await fetchJson<Category[]>(`${API_URL}/categories${suffix}`, { headers });
      setCategories(data);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudieron cargar las categorías'
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadAppUsers = async (token?: string) => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const data = await fetchJson<AppUser[]>(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppUsers(data);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudieron cargar los usuarios'
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAllReviews = async (token?: string) => {
    if (!token) return;
    setReviewsLoading(true);
    try {
      const data = await fetchJson<ReviewItem[]>(`${API_URL}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllReviews(data);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudieron cargar las reseñas'
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadSettings = async (token?: string) => {
    if (!token) return;
    setSettingsLoading(true);
    try {
      const data = await fetchJson<SettingItem[]>(`${API_URL}/settings/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(data);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo cargar la configuración'
      });
    } finally {
      setSettingsLoading(false);
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

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        nombre: categoryForm.nombre.trim(),
        descripcion: categoryForm.descripcion.trim(),
        imagen: categoryForm.imagen.trim(),
        activo: categoryForm.activo
      };
      if (!payload.nombre) throw new Error('El nombre es obligatorio.');

      if (editingCategoryId) {
        await adminRequest(`/categories/${editingCategoryId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', text: 'Categoría actualizada correctamente.' });
      } else {
        await adminRequest('/categories', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', text: 'Categoría creada correctamente.' });
      }
      resetCategoryForm();
      await loadCategories(user?.token);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo guardar la categoría'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const ok = await askConfirm({
      title: 'Eliminar categoría',
      message: `¿Seguro que quieres eliminar la categoría "${category.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      danger: true
    });
    if (!ok) return;
    setSubmitting(true);
    try {
      await adminRequest(`/categories/${category._id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', text: 'Categoría eliminada correctamente.' });
      if (editingCategoryId === category._id) resetCategoryForm();
      await loadCategories(user?.token);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo eliminar la categoría'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserRoleChange = async (target: AppUser, nextRol: 'admin' | 'usuario') => {
    if (target.rol === nextRol) return;
    const ok = await askConfirm({
      title: 'Cambiar rol',
      message: `¿Cambiar el rol de "${target.nombre}" a ${nextRol}?`,
      confirmText: 'Cambiar rol'
    });
    if (!ok) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const updated = await adminRequest<AppUser>(`/users/${target._id}/rol`, {
        method: 'PUT',
        body: JSON.stringify({ rol: nextRol })
      });
      setAppUsers((current) => current.map((u) => (u._id === updated._id ? updated : u)));
      setFeedback({ type: 'success', text: `Rol actualizado a ${nextRol}.` });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo cambiar el rol'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (target: AppUser) => {
    const ok = await askConfirm({
      title: 'Eliminar usuario',
      message: `¿Eliminar la cuenta de "${target.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar cuenta',
      danger: true
    });
    if (!ok) return;
    setSubmitting(true);
    try {
      await adminRequest(`/users/${target._id}`, { method: 'DELETE' });
      setAppUsers((current) => current.filter((u) => u._id !== target._id));
      setFeedback({ type: 'success', text: 'Usuario eliminado correctamente.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo eliminar el usuario'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleReview = async (review: ReviewItem) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const updated = await adminRequest<ReviewItem>(`/reviews/${review._id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ aprobado: !review.aprobado })
      });
      setAllReviews((current) => current.map((r) => (r._id === review._id ? { ...r, aprobado: updated.aprobado } : r)));
      setFeedback({
        type: 'success',
        text: updated.aprobado ? 'Reseña aprobada.' : 'Reseña ocultada.'
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo actualizar la reseña'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (review: ReviewItem) => {
    const ok = await askConfirm({
      title: 'Eliminar reseña',
      message: '¿Seguro que quieres eliminar esta reseña? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      danger: true
    });
    if (!ok) return;
    setSubmitting(true);
    try {
      await adminRequest(`/reviews/${review._id}`, { method: 'DELETE' });
      setAllReviews((current) => current.filter((r) => r._id !== review._id));
      setFeedback({ type: 'success', text: 'Reseña eliminada.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo eliminar la reseña'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettingSave = async (clave: string, valor: string) => {
    if (!clave.trim()) {
      setFeedback({ type: 'error', text: 'La clave no puede estar vacía.' });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await adminRequest(`/settings/${encodeURIComponent(clave.trim())}`, {
        method: 'PUT',
        body: JSON.stringify({ valor })
      });
      setFeedback({ type: 'success', text: `Configuración "${clave}" guardada.` });
      await loadSettings(user?.token);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo guardar la configuración'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const precioOfertaTrimmed = productForm.precioOferta.trim();
      const precioOfertaNum = precioOfertaTrimmed === '' ? null : Number(precioOfertaTrimmed);

      if (precioOfertaNum !== null && (Number.isNaN(precioOfertaNum) || precioOfertaNum < 0)) {
        throw new Error('El precio de oferta debe ser un número válido o quedar vacío.');
      }

      if (precioOfertaNum !== null && precioOfertaNum >= Number(productForm.precio)) {
        throw new Error('El precio de oferta debe ser menor al precio regular.');
      }

      const especificacionesPayload: Record<string, string> = {};
      if (productForm.pantalla.trim()) especificacionesPayload.pantalla = productForm.pantalla.trim();
      if (productForm.procesador.trim()) especificacionesPayload.procesador = productForm.procesador.trim();
      if (productForm.ram.trim()) especificacionesPayload.ram = productForm.ram.trim();
      if (productForm.almacenamiento.trim()) especificacionesPayload.almacenamiento = productForm.almacenamiento.trim();
      if (productForm.camara.trim()) especificacionesPayload.camara = productForm.camara.trim();
      if (productForm.bateria.trim()) especificacionesPayload.bateria = productForm.bateria.trim();
      if (productForm.sistemaOperativo.trim()) especificacionesPayload.sistemaOperativo = productForm.sistemaOperativo.trim();

      const payload = {
        nombre: productForm.nombre.trim(),
        marca: productForm.marca.trim(),
        modelo: productForm.modelo.trim(),
        descripcion: productForm.descripcion.trim(),
        precio: Number(productForm.precio),
        precioOferta: precioOfertaNum,
        stock: Number(productForm.stock),
        imagen: productForm.imagen.trim() || '/placeholder.png',
        destacado: productForm.destacado,
        activo: productForm.activo,
        coloresDisponibles: productForm.coloresDisponibles,
        especificaciones: especificacionesPayload
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
    const ok = await askConfirm({
      title: 'Eliminar producto',
      message: `¿Seguro que quieres eliminar "${product.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      danger: true
    });
    if (!ok) {
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
    const ok = await askConfirm({
      title: 'Eliminar marca',
      message: `¿Seguro que quieres eliminar la marca "${brand.nombre}"?`,
      confirmText: 'Eliminar',
      danger: true
    });
    if (!ok) {
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

  const handleSelectMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyText(message.respuesta || '');

    if (message.estado === 'nuevo' && user?.token) {
      try {
        const updated = await adminRequest<ContactMessage>(`/contact/${message._id}`, {
          method: 'PUT',
          body: JSON.stringify({ estado: 'leido' })
        });
        setContactMessages((current) => current.map((m) => (m._id === updated._id ? { ...m, ...updated } : m)));
        setSelectedMessage((current) => (current && current._id === updated._id ? { ...current, ...updated } : current));
      } catch {
        // silencioso: la marca como leído no es crítica
      }
    }
  };

  const handleReplyMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMessage) return;

    const trimmed = replyText.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', text: 'Escribe una respuesta antes de enviar.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const updated = await adminRequest<ContactMessage>(`/contact/${selectedMessage._id}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'respondido', respuesta: trimmed })
      });

      setContactMessages((current) => current.map((m) => (m._id === updated._id ? { ...m, ...updated } : m)));
      setSelectedMessage((current) => (current && current._id === updated._id ? { ...current, ...updated } : current));
      setFeedback({ type: 'success', text: 'Respuesta guardada y mensaje marcado como respondido.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo guardar la respuesta'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = async (message: ContactMessage) => {
    const ok = await askConfirm({
      title: 'Eliminar mensaje',
      message: `¿Seguro que quieres eliminar el mensaje de "${message.nombre}"?`,
      confirmText: 'Eliminar',
      danger: true
    });
    if (!ok) {
      return;
    }

    setSubmitting(true);
    try {
      await adminRequest(`/contact/${message._id}`, { method: 'DELETE' });
      setContactMessages((current) => current.filter((m) => m._id !== message._id));
      if (selectedMessage?._id === message._id) {
        setSelectedMessage(null);
        setReplyText('');
      }
      setFeedback({ type: 'success', text: 'Mensaje eliminado correctamente.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo eliminar el mensaje'
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

  const handleOrderPaymentUpdate = async (orderId: string) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      await adminRequest<Order>(`/orders/${orderId}/pay`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'COMPLETED', updateTime: new Date().toISOString() })
      });
      setFeedback({ type: 'success', text: 'Pago registrado correctamente.' });
      await loadOrders(isAdmin ? user?.token : undefined);
      await loadOrderDetail(orderId);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo registrar el pago'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderRecalculate = async (orderId: string) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      await adminRequest<Order>(`/orders/${orderId}/recalculate`, { method: 'PUT' });
      setFeedback({ type: 'success', text: 'Totales recalculados a partir de los precios guardados.' });
      await loadOrders(isAdmin ? user?.token : undefined);
      await loadOrderDetail(orderId);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo recalcular el pedido'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const ok = await askConfirm({
      title: 'Eliminar pedido',
      message: '¿Eliminar permanentemente este pedido? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      danger: true
    });
    if (!ok) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await adminRequest(`/orders/${orderId}`, { method: 'DELETE' });
      setFeedback({ type: 'success', text: 'Pedido eliminado correctamente.' });
      setSelectedOrder(null);
      await loadOrders(isAdmin ? user?.token : undefined);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo eliminar el pedido'
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

  const filteredMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = contactMessages;

    if (messageFilter !== 'todos') {
      list = list.filter((message) => message.estado === messageFilter);
    }

    if (!term) {
      return list;
    }

    return list.filter((message) =>
      [message.nombre, message.email, message.asunto || '', message.mensaje].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [contactMessages, searchTerm, messageFilter]);

  const lowStockProducts = useMemo(() => products.filter((product) => product.stock <= 5), [products]);
  const featuredProducts = useMemo(() => products.filter((product) => product.destacado), [products]);
  const unreadMessages = useMemo(() => contactMessages.filter((message) => message.estado === 'nuevo'), [contactMessages]);
  const paidOrders = useMemo(() => orders.filter((order) => order.estadoPago === 'pagado'), [orders]);
  const revenueTotal = useMemo(() => paidOrders.reduce((sum, order) => sum + order.total, 0), [paidOrders]);
  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);
  const recentMessages = useMemo(() => contactMessages.slice(0, 4), [contactMessages]);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) =>
      [c.nombre, c.slug, c.descripcion || ''].some((v) => v.toLowerCase().includes(term))
    );
  }, [categories, searchTerm]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return appUsers;
    return appUsers.filter((u) =>
      [u.nombre, u.email, u.telefono || ''].some((v) => v.toLowerCase().includes(term))
    );
  }, [appUsers, searchTerm]);

  const filteredReviews = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = allReviews;
    if (reviewFilter === 'aprobadas') list = list.filter((r) => r.aprobado);
    if (reviewFilter === 'ocultas') list = list.filter((r) => !r.aprobado);
    if (!term) return list;
    return list.filter((r) =>
      [r.comentario || '', r.usuario?.nombre || '', r.producto?.nombre || ''].some((v) => v.toLowerCase().includes(term))
    );
  }, [allReviews, reviewFilter, searchTerm]);

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

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {(['dashboard', 'products', 'brands', 'categories', 'orders', 'messages', 'reviews', 'users', 'settings'] as AdminSection[]).map((section) => {
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="product-price" className="mb-2 block text-sm font-medium text-gray-700">Precio</label>
                    <input id="product-price" type="number" min="0" value={productForm.precio} onChange={(event) => setProductForm((current) => ({ ...current, precio: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="0" />
                  </div>

                  <div>
                    <label htmlFor="product-offer" className="mb-2 block text-sm font-medium text-gray-700">
                      Precio de oferta <span className="text-xs text-gray-400">(opcional)</span>
                    </label>
                    <input id="product-offer" type="number" min="0" value={productForm.precioOferta} onChange={(event) => setProductForm((current) => ({ ...current, precioOferta: event.target.value }))} className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 outline-none transition focus:border-amber-400 focus:bg-white" placeholder="Vacío = sin oferta" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="product-stock" className="mb-2 block text-sm font-medium text-gray-700">Stock</label>
                    <input id="product-stock" type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="0" />
                  </div>

                  <div>
                    <ImageUpload
                      label="Imagen"
                      value={productForm.imagen}
                      onChange={(next) => setProductForm((current) => ({ ...current, imagen: next }))}
                      placeholder="/placeholder.png o URL"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Colores disponibles <span className="text-xs text-gray-400">(opcional)</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                    {productForm.coloresDisponibles.map((color) => (
                      <span key={color} className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                        {color}
                        <button
                          type="button"
                          aria-label={`Eliminar ${color}`}
                          onClick={() => setProductForm((current) => ({ ...current, coloresDisponibles: current.coloresDisponibles.filter((c) => c !== color) }))}
                          className="text-primary-700 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Escribe un color y presiona Enter"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ',') {
                          event.preventDefault();
                          const value = event.currentTarget.value.trim();
                          if (value) {
                            setProductForm((current) => current.coloresDisponibles.includes(value)
                              ? current
                              : { ...current, coloresDisponibles: [...current.coloresDisponibles, value] });
                            event.currentTarget.value = '';
                          }
                        }
                      }}
                      className="min-w-[180px] flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Especificaciones técnicas <span className="text-xs text-gray-400">(opcionales)</span></p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input value={productForm.pantalla} onChange={(e) => setProductForm((c) => ({ ...c, pantalla: e.target.value }))} placeholder="Pantalla (ej. 6.7'' OLED 120Hz)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white" />
                    <input value={productForm.procesador} onChange={(e) => setProductForm((c) => ({ ...c, procesador: e.target.value }))} placeholder="Procesador (ej. Snapdragon 8 Gen 3)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white" />
                    <input value={productForm.ram} onChange={(e) => setProductForm((c) => ({ ...c, ram: e.target.value }))} placeholder="RAM (ej. 12 GB)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white" />
                    <input value={productForm.almacenamiento} onChange={(e) => setProductForm((c) => ({ ...c, almacenamiento: e.target.value }))} placeholder="Almacenamiento (ej. 256 GB)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white" />
                    <input value={productForm.camara} onChange={(e) => setProductForm((c) => ({ ...c, camara: e.target.value }))} placeholder="Cámara (ej. 50 MP + 12 MP)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white" />
                    <input value={productForm.bateria} onChange={(e) => setProductForm((c) => ({ ...c, bateria: e.target.value }))} placeholder="Batería (ej. 5000 mAh)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white" />
                    <input value={productForm.sistemaOperativo} onChange={(e) => setProductForm((c) => ({ ...c, sistemaOperativo: e.target.value }))} placeholder="Sistema operativo (ej. Android 14)" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-400 focus:bg-white md:col-span-2" />
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
                          <td className="px-6 py-4 font-semibold text-green-600">
                            {product.precioOferta != null && product.precioOferta < product.precio ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 line-through">${product.precio.toLocaleString()}</span>
                                <span className="text-amber-600">${product.precioOferta.toLocaleString()}</span>
                              </div>
                            ) : (
                              <span>${product.precio.toLocaleString()}</span>
                            )}
                          </td>
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
                                    precioOferta: product.precioOferta != null ? String(product.precioOferta) : '',
                                    stock: String(product.stock),
                                    imagen: product.imagen || '',
                                    destacado: product.destacado,
                                    activo: product.activo,
                                    coloresDisponibles: product.coloresDisponibles || [],
                                    pantalla: product.especificaciones?.pantalla || '',
                                    procesador: product.especificaciones?.procesador || '',
                                    ram: product.especificaciones?.ram || '',
                                    almacenamiento: product.especificaciones?.almacenamiento || '',
                                    camara: product.especificaciones?.camara || '',
                                    bateria: product.especificaciones?.bateria || '',
                                    sistemaOperativo: product.especificaciones?.sistemaOperativo || ''
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
                  <ImageUpload
                    label="Logo"
                    value={brandForm.logo}
                    onChange={(next) => setBrandForm((current) => ({ ...current, logo: next }))}
                  />
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
                      onClick={() => handleOrderPaymentUpdate(selectedOrder._id)}
                      disabled={!isAuthenticated || submitting || selectedOrder.estadoPago === 'pagado'}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300 md:col-span-2"
                    >
                      <CheckCircleIcon fontSize="small" />
                      {selectedOrder.estadoPago === 'pagado' ? 'Pago ya registrado' : 'Marcar pago como recibido'}
                    </button>

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

                    <button
                      type="button"
                      onClick={() => handleOrderRecalculate(selectedOrder._id)}
                      disabled={!isAuthenticated || submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshIcon fontSize="small" />
                      Recalcular totales
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(selectedOrder._id)}
                      disabled={!isAuthenticated || submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <DeleteIcon fontSize="small" />
                      Eliminar pedido
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

        {activeSection === 'messages' ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr,1.2fr]">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Bandeja de mensajes</h2>
                  <p className="text-sm text-gray-500">
                    {hasAdminAccess
                      ? `${filteredMessages.length} mensaje(s) · ${unreadMessages.length} sin leer`
                      : 'Inicia sesión como administrador para revisar la bandeja.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['todos', 'nuevo', 'leido', 'respondido'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setMessageFilter(filter)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${messageFilter === filter ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {!hasAdminAccess ? (
                <div className="p-12 text-center text-gray-500">
                  Esta sección requiere una cuenta con rol de administrador.
                </div>
              ) : messagesLoading ? (
                <div className="p-12 text-center text-gray-500">Cargando mensajes...</div>
              ) : filteredMessages.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {filteredMessages.map((message) => {
                    const isSelected = selectedMessage?._id === message._id;
                    return (
                      <li key={message._id}>
                        <button
                          type="button"
                          onClick={() => handleSelectMessage(message)}
                          className={`flex w-full flex-col gap-1 px-6 py-4 text-left transition ${isSelected ? 'bg-sky-50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className={`font-semibold ${message.estado === 'nuevo' ? 'text-gray-900' : 'text-gray-700'}`}>
                              {message.nombre}
                            </p>
                            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${message.estado === 'nuevo' ? 'bg-amber-100 text-amber-700' : message.estado === 'respondido' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'}`}>
                              {message.estado}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">{message.asunto || 'Sin asunto'}</p>
                          <p className="line-clamp-2 text-xs text-gray-500">{message.mensaje}</p>
                          <p className="mt-1 text-xs text-gray-400">{formatDate(message.createdAt)} · {message.email}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-12 text-center text-gray-500">No hay mensajes que coincidan con el filtro.</div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detalle del mensaje</h2>
                  <p className="text-sm text-gray-500">Lee el contenido completo y responde al cliente.</p>
                </div>

                {selectedMessage ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(selectedMessage)}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed"
                  >
                    <DeleteIcon fontSize="small" />
                    Eliminar
                  </button>
                ) : null}
              </div>

              {selectedMessage ? (
                <div className="space-y-5 text-sm text-gray-700">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">De</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">{selectedMessage.nombre}</p>
                    <p className="text-gray-500">{selectedMessage.email}</p>
                    <p className="mt-1 text-xs text-gray-400">Recibido el {formatDate(selectedMessage.createdAt)}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Asunto</p>
                    <p className="mt-1 font-semibold text-gray-900">{selectedMessage.asunto || 'Sin asunto'}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Mensaje</p>
                    <p className="mt-2 whitespace-pre-wrap text-gray-700">{selectedMessage.mensaje}</p>
                  </div>

                  {selectedMessage.estado === 'respondido' && selectedMessage.respuesta ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Respuesta enviada</p>
                        {typeof selectedMessage.respondidoPor === 'object' && selectedMessage.respondidoPor?.nombre ? (
                          <p className="text-xs text-emerald-700">Por {selectedMessage.respondidoPor.nombre}</p>
                        ) : null}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{selectedMessage.respuesta}</p>
                    </div>
                  ) : null}

                  <form onSubmit={handleReplyMessage} className="space-y-3">
                    <label htmlFor="reply-text" className="block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      {selectedMessage.estado === 'respondido' ? 'Editar respuesta' : 'Escribir respuesta'}
                    </label>
                    <textarea
                      id="reply-text"
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      rows={5}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-sky-400 focus:bg-white"
                      placeholder="Hola, gracias por contactarnos..."
                    />
                    <p className="text-xs text-gray-400">
                      Al guardar, el mensaje queda marcado como <span className="font-semibold">respondido</span> y la respuesta queda registrada en el historial.
                    </p>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
                    >
                      <SaveIcon fontSize="small" />
                      {selectedMessage.estado === 'respondido' ? 'Actualizar respuesta' : 'Guardar respuesta'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                  {hasAdminAccess ? 'Selecciona un mensaje de la bandeja para abrir su detalle.' : 'Inicia sesión con una cuenta admin para acceder a los mensajes.'}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {activeSection === 'categories' ? (
          <div className="grid gap-6 xl:grid-cols-[0.95fr,1.7fr]">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de categorías</h2>
                  <p className="text-sm text-gray-500">Las categorías se publican automáticamente en el catálogo cuando están activas.</p>
                </div>
                {editingCategoryId ? (
                  <button type="button" onClick={resetCategoryForm} className="text-sm font-semibold text-gray-500 transition hover:text-gray-800">
                    Cancelar edición
                  </button>
                ) : null}
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Nombre</label>
                  <input value={categoryForm.nombre} onChange={(e) => setCategoryForm((c) => ({ ...c, nombre: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="Smartphones" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea value={categoryForm.descripcion} onChange={(e) => setCategoryForm((c) => ({ ...c, descripcion: e.target.value }))} rows={3} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white" placeholder="Breve descripción para el catálogo" />
                </div>
                <div>
                  <ImageUpload
                    label="Imagen"
                    value={categoryForm.imagen}
                    onChange={(next) => setCategoryForm((c) => ({ ...c, imagen: next }))}
                  />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" checked={categoryForm.activo} onChange={(e) => setCategoryForm((c) => ({ ...c, activo: e.target.checked }))} />
                  Categoría activa
                </label>
                <button type="submit" disabled={!isAuthenticated || submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300">
                  {editingCategoryId ? <SaveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                  {editingCategoryId ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Listado de categorías</h2>
                  <p className="text-sm text-gray-500">{filteredCategories.length} resultado(s).</p>
                </div>
              </div>
              {categoriesLoading ? (
                <div className="p-12 text-center text-gray-500">Cargando categorías...</div>
              ) : filteredCategories.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 text-left text-sm text-gray-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Categoría</th>
                        <th className="px-6 py-4 font-semibold">Slug</th>
                        <th className="px-6 py-4 font-semibold">Estado</th>
                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((category) => (
                        <tr key={category._id} className="border-t border-gray-100 text-sm text-gray-700">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{category.nombre}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{category.descripcion || 'Sin descripción'}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{category.slug}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                              {category.activo ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setEditingCategoryId(category._id); setCategoryForm({ nombre: category.nombre, descripcion: category.descripcion || '', imagen: category.imagen || '', activo: category.activo }); }} className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" disabled={!isAuthenticated}>
                                <EditIcon fontSize="small" />
                              </button>
                              <button type="button" onClick={() => handleDeleteCategory(category)} className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-300" disabled={!isAuthenticated}>
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
                <div className="p-12 text-center text-gray-500">No hay categorías registradas.</div>
              )}
            </div>
          </div>
        ) : null}

        {activeSection === 'users' ? (
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Usuarios registrados</h2>
                <p className="text-sm text-gray-500">
                  {hasAdminAccess ? `${filteredUsers.length} usuario(s).` : 'Acceso sólo para administradores.'}
                </p>
              </div>
              <button type="button" onClick={() => user?.token && loadAppUsers(user.token)} disabled={usersLoading} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                <RefreshIcon fontSize="small" /> Recargar
              </button>
            </div>
            {!hasAdminAccess ? (
              <div className="p-12 text-center text-gray-500">Esta sección requiere una cuenta con rol de administrador.</div>
            ) : usersLoading ? (
              <div className="p-12 text-center text-gray-500">Cargando usuarios...</div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 text-left text-sm text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Usuario</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Teléfono</th>
                      <th className="px-6 py-4 font-semibold">Rol</th>
                      <th className="px-6 py-4 font-semibold">Registrado</th>
                      <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isSelf = u._id === user?._id;
                      return (
                        <tr key={u._id} className="border-t border-gray-100 text-sm text-gray-700">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{u.nombre} {isSelf ? <span className="ml-1 rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">Tº</span> : null}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{u.email}</td>
                          <td className="px-6 py-4 text-gray-600">{u.telefono || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${u.rol === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'}`}>
                              {u.rol}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              {u.rol === 'admin' ? (
                                <button type="button" disabled={isSelf || submitting} onClick={() => handleUserRoleChange(u, 'usuario')} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
                                  Quitar admin
                                </button>
                              ) : (
                                <button type="button" disabled={submitting} onClick={() => handleUserRoleChange(u, 'admin')} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50">
                                  Hacer admin
                                </button>
                              )}
                              <button type="button" disabled={isSelf || submitting} onClick={() => handleDeleteUser(u)} className="rounded-lg border border-red-100 p-1.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">
                                <DeleteIcon fontSize="small" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">No hay usuarios registrados.</div>
            )}
          </div>
        ) : null}

        {activeSection === 'reviews' ? (
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Moderación de reseñas</h2>
                <p className="text-sm text-gray-500">
                  {hasAdminAccess ? `${filteredReviews.length} reseña(s).` : 'Acceso sólo para administradores.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['todas', 'aprobadas', 'ocultas'] as const).map((filter) => (
                  <button key={filter} type="button" onClick={() => setReviewFilter(filter)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${reviewFilter === filter ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            {!hasAdminAccess ? (
              <div className="p-12 text-center text-gray-500">Esta sección requiere una cuenta con rol de administrador.</div>
            ) : reviewsLoading ? (
              <div className="p-12 text-center text-gray-500">Cargando reseñas...</div>
            ) : filteredReviews.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredReviews.map((r) => (
                  <li key={r._id} className="px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-1 items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold uppercase text-primary-700">
                          {(r.usuario?.nombre || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{r.usuario?.nombre || 'Usuario eliminado'}</p>
                          <p className="text-xs text-gray-500">{r.usuario?.email}</p>
                          <p className="mt-1 text-xs text-gray-400">{formatDate(r.createdAt)} · Producto: <span className="font-medium text-gray-600">{r.producto?.nombre || '—'}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          <StarIcon fontSize="inherit" /> {r.rating}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.aprobado ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {r.aprobado ? 'Visible' : 'Oculta'}
                        </span>
                      </div>
                    </div>
                    {r.comentario ? <p className="mt-3 whitespace-pre-line rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{r.comentario}</p> : null}
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <button type="button" onClick={() => handleToggleReview(r)} disabled={submitting} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${r.aprobado ? 'border-gray-200 text-gray-700 hover:bg-gray-50' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                        {r.aprobado ? <><VisibilityOffIcon fontSize="inherit" /> Ocultar</> : <><VisibilityIcon fontSize="inherit" /> Aprobar</>}
                      </button>
                      <button type="button" onClick={() => handleDeleteReview(r)} disabled={submitting} className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                        <DeleteIcon fontSize="inherit" /> Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-gray-500">No hay reseñas que coincidan con el filtro.</div>
            )}
          </div>
        ) : null}

        {activeSection === 'settings' ? (
          <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Configuración del sitio</h2>
              <p className="text-sm text-gray-500">Parámetros recomendados. Edita cualquiera y guarda los cambios.</p>
              <p className="mt-1 text-xs text-amber-700">Nota: actualmente los valores se almacenan pero el frontend aún no los consume en runtime; el envio gratis e IVA siguen hardcodeados en checkout.</p>

              {!hasAdminAccess ? (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">Inicia sesión como administrador.</div>
              ) : settingsLoading ? (
                <div className="mt-6 text-center text-gray-500">Cargando configuración...</div>
              ) : (
                <div className="mt-6 space-y-4">
                  {DEFAULT_SETTING_KEYS.map((tpl) => {
                    const existing = settings.find((s) => s.clave === tpl.clave);
                    const current = existing?.valor ?? '';
                    return (
                      <SettingRow
                        key={tpl.clave}
                        clave={tpl.clave}
                        descripcion={tpl.descripcion}
                        placeholder={tpl.placeholder}
                        initialValue={current}
                        updatedAt={existing?.updatedAt}
                        updatedBy={existing?.updatedBy?.nombre}
                        onSave={(value) => handleSettingSave(tpl.clave, value)}
                        disabled={submitting}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">Agregar parámetro personalizado</h3>
                <p className="text-sm text-gray-500">Crea cualquier clave/valor adicional (texto libre).</p>
                <form onSubmit={(e) => { e.preventDefault(); void handleSettingSave(settingForm.clave, settingForm.valor); setSettingForm(emptySettingForm); }} className="mt-4 space-y-3">
                  <input value={settingForm.clave} onChange={(e) => setSettingForm((c) => ({ ...c, clave: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-primary-400" placeholder="clave (sin espacios)" />
                  <input value={settingForm.valor} onChange={(e) => setSettingForm((c) => ({ ...c, valor: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-primary-400" placeholder="valor" />
                  <button type="submit" disabled={!hasAdminAccess || submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60">
                    <SaveIcon fontSize="small" /> Guardar parámetro
                  </button>
                </form>
              </div>

              {hasAdminAccess && settings.length > 0 ? (
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900">Todos los parámetros</h3>
                  <ul className="mt-3 divide-y divide-gray-100 text-sm">
                    {settings.map((s) => (
                      <li key={s._id} className="flex items-start justify-between gap-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-xs text-gray-500">{s.clave}</p>
                          <p className="truncate font-medium text-gray-800">{s.valor}</p>
                        </div>
                        <span className="whitespace-nowrap text-xs text-gray-400">{formatDate(s.updatedAt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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

      {confirmDialog ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">{confirmDialog.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{confirmDialog.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => resolveConfirm(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => resolveConfirm(true)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                  confirmDialog.danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {confirmDialog.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPanel;
