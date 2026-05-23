import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_URL } from '../lib/catalog';

interface AddressForm {
  calle: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  telefono: string;
}

interface SavedAddress extends AddressForm {
  _id: string;
  alias?: string;
  esPrincipal?: boolean;
}

const emptyAddress: AddressForm = {
  calle: '',
  ciudad: '',
  estado: '',
  codigoPostal: '',
  telefono: ''
};

type PaymentMethod = 'tarjeta' | 'paypal' | 'transferencia' | 'efectivo';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { state, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!user?.token) return;
    let cancelled = false;
    (async () => {
      try {
        // Intentar cargar direcciones guardadas del Address model
        const [addrRes, profileRes] = await Promise.allSettled([
          fetch(`${API_URL}/addresses`, { headers: { Authorization: `Bearer ${user.token}` } }),
          fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${user.token}` } })
        ]);

        if (cancelled) return;

        let savedList: SavedAddress[] = [];
        if (addrRes.status === 'fulfilled' && addrRes.value.ok) {
          savedList = (await addrRes.value.json()) as SavedAddress[];
        }

        setSavedAddresses(savedList);

        if (savedList.length > 0) {
          // Usar la dirección principal o la primera guardada
          const principal = savedList.find((d) => d.esPrincipal) || savedList[0];
          setSelectedAddressId(principal._id);
          setAddress({
            calle: principal.calle,
            ciudad: principal.ciudad,
            estado: principal.estado,
            codigoPostal: principal.codigoPostal,
            telefono: principal.telefono || ''
          });
        } else if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          // Fallback: usar la dirección guardada en el perfil del usuario
          const profile = await profileRes.value.json();
          const dir = profile?.direccion;
          if (dir?.calle || dir?.ciudad) {
            setAddress({
              calle: dir.calle || '',
              ciudad: dir.ciudad || '',
              estado: dir.estado || '',
              codigoPostal: dir.codigoPostal || '',
              telefono: profile.telefono || ''
            });
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setAddress(emptyAddress);
      return;
    }
    const found = savedAddresses.find((s) => s._id === id);
    if (found) {
      setAddress({
        calle: found.calle,
        ciudad: found.ciudad,
        estado: found.estado,
        codigoPostal: found.codigoPostal,
        telefono: found.telefono || ''
      });
    }
  };

  const { subtotal, shippingCost, taxes, total } = useMemo(() => {
    const sub = state.total;
    const shipping = sub > 5000 ? 0 : 150;
    const tax = sub * 0.16;
    return {
      subtotal: sub,
      shippingCost: shipping,
      taxes: tax,
      total: sub + shipping + tax
    };
  }, [state.total]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (state.items.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    const productosNumericos = state.items.some((item) => typeof item.id === 'number');
    if (productosNumericos) {
      setError('Algunos productos del carrito no provienen del catálogo real. Limpia el carrito y vuelve a agregarlos desde el sitio.');
      return;
    }

    const camposVacios = !address.calle.trim() || !address.ciudad.trim() || !address.estado.trim() || !address.codigoPostal.trim() || !address.telefono.trim();
    if (camposVacios) {
      setError('Completa todos los campos de la dirección de envío antes de continuar.');
      return;
    }

    setShowConfirm(true);
  };

  const confirmAndSubmit = async () => {
    if (!user) return;
    setShowConfirm(false);
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        productos: state.items.map((item) => ({
          producto: item.id,
          nombre: item.name,
          imagen: item.image,
          precio: item.price,
          cantidad: item.quantity
        })),
        direccionEnvio: {
          calle: address.calle,
          ciudad: address.ciudad,
          estado: address.estado,
          codigoPostal: address.codigoPostal,
          telefono: address.telefono
        },
        metodoPago: paymentMethod
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo procesar el pedido');
      }

      setSuccessOrderId(data._id);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (successOrderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-20 pt-32 text-center">
          <CheckCircleIcon style={{ fontSize: 72 }} className="text-emerald-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">¡Pedido confirmado!</h1>
          <p className="mt-3 text-gray-600">
            Tu orden <span className="font-mono font-semibold">#{successOrderId.slice(-8).toUpperCase()}</span> fue registrada correctamente.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Recibirás actualizaciones del estado de envío en tu correo registrado.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/mis-pedidos" className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700">
              Ver mis pedidos
            </Link>
            <Link to="/catalog" className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-white">
              Seguir comprando
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-12 pt-28 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Finaliza tu compra</h1>
        <p className="mt-2 text-gray-600">Completa los datos de envío y selecciona método de pago.</p>

        {!isAuthenticated ? (
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
            <LockIcon className="text-amber-600" style={{ fontSize: 40 }} />
            <h2 className="mt-2 text-xl font-bold text-gray-900">Necesitas iniciar sesión</h2>
            <p className="mt-1 text-sm text-gray-600">
              Para concretar el pedido y guardar tu historial, ingresa con tu cuenta.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : state.items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-12 text-center">
            <h2 className="text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
            <Link
              to="/catalog"
              className="mt-4 inline-flex rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr,1fr]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Dirección de envío</h2>

                {savedAddresses.length > 0 ? (
                  <div className="mb-5 space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Usar una dirección guardada</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {savedAddresses.map((sa) => (
                        <label
                          key={sa._id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${selectedAddressId === sa._id ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        >
                          <input
                            type="radio"
                            name="saved-address"
                            className="mt-1"
                            checked={selectedAddressId === sa._id}
                            onChange={() => handleSelectAddress(sa._id)}
                          />
                          <div className="text-sm">
                            <p className="flex items-center gap-1 font-semibold text-gray-900">
                              <HomeWorkIcon fontSize="inherit" />
                              {sa.alias || 'Dirección'}
                              {sa.esPrincipal ? (
                                <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Principal</span>
                              ) : null}
                            </p>
                            <p className="text-gray-700">{sa.calle}</p>
                            <p className="text-gray-500">{sa.ciudad}, {sa.estado} {sa.codigoPostal}</p>
                          </div>
                        </label>
                      ))}
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${selectedAddressId === 'new' ? 'border-primary-400 bg-primary-50' : 'border-dashed border-gray-300 bg-white hover:border-gray-400'}`}
                      >
                        <input
                          type="radio"
                          name="saved-address"
                          checked={selectedAddressId === 'new'}
                          onChange={() => handleSelectAddress('new')}
                        />
                        <span className="text-sm font-semibold text-gray-700">+ Usar una nueva dirección</span>
                      </label>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="calle" className="mb-1 block text-sm font-medium text-gray-700">Calle y número</label>
                    <input
                      id="calle"
                      required
                      value={address.calle}
                      onChange={(e) => setAddress((a) => ({ ...a, calle: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                      placeholder="Av. Reforma 123, Col. Centro"
                    />
                  </div>
                  <div>
                    <label htmlFor="ciudad" className="mb-1 block text-sm font-medium text-gray-700">Ciudad</label>
                    <input
                      id="ciudad"
                      required
                      value={address.ciudad}
                      onChange={(e) => setAddress((a) => ({ ...a, ciudad: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="estado" className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
                    <input
                      id="estado"
                      required
                      value={address.estado}
                      onChange={(e) => setAddress((a) => ({ ...a, estado: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="cp" className="mb-1 block text-sm font-medium text-gray-700">Código postal</label>
                    <input
                      id="cp"
                      required
                      value={address.codigoPostal}
                      onChange={(e) => setAddress((a) => ({ ...a, codigoPostal: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="tel" className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
                    <input
                      id="tel"
                      type="tel"
                      value={address.telefono}
                      onChange={(e) => setAddress((a) => ({ ...a, telefono: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-primary-400 focus:bg-white"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Método de pago</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      { value: 'tarjeta', label: 'Tarjeta de crédito/débito' },
                      { value: 'paypal', label: 'PayPal' },
                      { value: 'transferencia', label: 'Transferencia bancaria' },
                      { value: 'efectivo', label: 'Efectivo al recibir' }
                    ] as { value: PaymentMethod; label: string }[]
                  ).map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${paymentMethod === option.value ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.value}
                        checked={paymentMethod === option.value}
                        onChange={() => setPaymentMethod(option.value)}
                      />
                      <span className="text-sm font-medium text-gray-800">{option.label}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  El cobro real no se realiza en esta versión académica. La orden quedará registrada como <strong>pendiente</strong> de pago.
                </p>
              </section>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}
            </div>

            <aside className="space-y-4 self-start rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Resumen del pedido</h2>

              <ul className="divide-y divide-gray-100">
                {state.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>

              <div className="space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-700">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span>Envío</span><span>{shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost)}</span></div>
                <div className="flex justify-between"><span>IVA (16%)</span><span>{formatCurrency(taxes)}</span></div>
                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
              >
                <LockIcon fontSize="small" />
                {submitting ? 'Procesando...' : 'Confirmar pedido'}
              </button>

              <p className="text-center text-xs text-gray-500">
                Transacción segura · Datos cifrados en tránsito
              </p>
            </aside>
          </form>
        )}
      </div>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <LockIcon />
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Confirmar pedido</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Revisa los datos antes de finalizar. Una vez confirmado, generaremos la orden.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl bg-gray-50 p-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Envío a</p>
                <p className="font-medium text-gray-800">{address.calle}</p>
                <p className="text-gray-600">{address.ciudad}, {address.estado} · CP {address.codigoPostal}</p>
                <p className="text-gray-600">Tel: {address.telefono}</p>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-gray-600">Método de pago</span>
                <span className="font-semibold capitalize text-gray-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Artículos</span>
                <span className="font-semibold text-gray-800">{state.items.reduce((n, i) => n + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
                <span>Total a pagar</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmAndSubmit()}
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Sí, confirmar pedido
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
};

export default CheckoutPage;
