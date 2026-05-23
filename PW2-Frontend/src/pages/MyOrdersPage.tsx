import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_URL, resolveProductImage, PRODUCT_PLACEHOLDER } from '../lib/catalog';

interface OrderItem {
  producto?: string | { _id: string; nombre?: string };
  nombre?: string;
  imagen?: string;
  precio?: number;
  cantidad: number;
}

interface OrderAddress {
  calle: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  telefono?: string;
}

interface Order {
  _id: string;
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user?.token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar tus pedidos');
      }

      const data = (await response.json()) as Order[];
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-12 pt-28 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">Mi cuenta</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Mis pedidos</h1>
            <p className="mt-1 text-sm text-gray-500">Consulta el estado de tus compras y revisa los productos enviados.</p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60 sm:self-auto"
          >
            <RefreshIcon fontSize="small" />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Cargando pedidos...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Inventory2Icon style={{ fontSize: 56 }} className="text-gray-300" />
            <h2 className="mt-3 text-xl font-bold text-gray-900">Aún no tienes pedidos</h2>
            <p className="mt-1 text-sm text-gray-500">Cuando realices tu primera compra aparecerá aquí.</p>
            <Link
              to="/catalog"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order._id} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <header className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Pedido</p>
                    <p className="font-mono text-sm font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">Realizado el {formatDate(order.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClass[order.estadoPago]}`}>
                      Pago: {order.estadoPago}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${shippingBadgeClass[order.estadoEnvio]}`}>
                      <LocalShippingIcon fontSize="inherit" />
                      {order.estadoEnvio}
                    </span>
                  </div>
                </header>

                <div className="grid gap-6 px-6 py-5 lg:grid-cols-[1.4fr,1fr]">
                  <ul className="space-y-3">
                    {order.productos.map((item, idx) => (
                      <li key={`${order._id}-${idx}`} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                        <img
                          src={resolveProductImage(item.imagen)}
                          alt={item.nombre || 'Producto'}
                          className="h-14 w-14 flex-shrink-0 object-contain"
                          onError={(e) => {
                            if (!e.currentTarget.src.includes(PRODUCT_PLACEHOLDER)) {
                              e.currentTarget.src = PRODUCT_PLACEHOLDER;
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.nombre || (typeof item.producto === 'object' ? item.producto?.nombre : 'Producto')}
                          </p>
                          <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {formatCurrency((item.precio || 0) * item.cantidad)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3 text-sm">
                    <div className="rounded-2xl border border-gray-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Envío a</p>
                      <p className="mt-1 text-gray-800">{order.direccionEnvio.calle}</p>
                      <p className="text-gray-600">
                        {order.direccionEnvio.ciudad}, {order.direccionEnvio.estado} {order.direccionEnvio.codigoPostal}
                      </p>
                      {order.direccionEnvio.telefono ? (
                        <p className="text-gray-600">Tel: {order.direccionEnvio.telefono}</p>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-gray-100 p-3 text-sm text-gray-700">
                      <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                      <div className="flex justify-between"><span>Envío</span><span>{order.costoEnvio === 0 ? 'Gratis' : formatCurrency(order.costoEnvio)}</span></div>
                      <div className="flex justify-between"><span>IVA</span><span>{formatCurrency(order.impuestos)}</span></div>
                      <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                        <span>Total</span><span>{formatCurrency(order.total)}</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Pago: {order.metodoPago}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 px-6 py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId((prev) => (prev === order._id ? null : order._id))}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    {expandedId === order._id ? (
                      <>Ocultar detalle <ExpandLessIcon fontSize="small" /></>
                    ) : (
                      <>Ver detalle completo <ExpandMoreIcon fontSize="small" /></>
                    )}
                  </button>

                  {expandedId === order._id ? (
                    <div className="mt-3 grid gap-3 rounded-2xl bg-gray-50 p-4 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Fecha de pago</p>
                        <p className="text-gray-800">{formatDate(order.fechaPago)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Fecha de envío</p>
                        <p className="text-gray-800">{formatDate(order.fechaEnvio)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Fecha de entrega</p>
                        <p className="text-gray-800">{formatDate(order.fechaEntrega)}</p>
                      </div>
                      <div className="sm:col-span-3 border-t border-gray-200 pt-3">
                        <p className="text-xs font-semibold uppercase text-gray-500">ID completo del pedido</p>
                        <p className="font-mono text-xs text-gray-700 break-all">{order._id}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyOrdersPage;
