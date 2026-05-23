import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BoltIcon from '@mui/icons-material/Bolt';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchPublicProducts, resolveProductImage, PRODUCT_PLACEHOLDER, type PublicProduct } from '../lib/catalog';
import { useCart } from '../context/CartContext';

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

const OfertasPage: React.FC = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPublicProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las ofertas');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const offers = useMemo(
    () =>
      products
        .filter((p) => typeof p.precioOferta === 'number' && p.precioOferta! > 0 && p.precioOferta! < p.precio)
        .map((p) => ({
          ...p,
          descuento: Math.round(((p.precio - (p.precioOferta as number)) / p.precio) * 100)
        }))
        .sort((a, b) => b.descuento - a.descuento),
    [products]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      <Navbar />

      <section className="relative overflow-hidden pt-32 pb-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              <BoltIcon fontSize="small" /> Ofertas activas
            </span>
            <h1 className="text-4xl font-bold text-gray-900 lg:text-5xl">Promociones de la semana</h1>
            <p className="max-w-2xl text-gray-600">
              Productos seleccionados con descuento directo aplicado. Stock limitado, precios actualizados en tiempo real desde la base de datos.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-8">
        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Cargando ofertas...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</div>
        ) : offers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <LocalOfferIcon className="text-amber-500" style={{ fontSize: 48 }} />
            <h2 className="mt-3 text-xl font-bold text-gray-900">No hay ofertas activas en este momento</h2>
            <p className="mt-2 text-gray-500">
              Vuelve más tarde o explora todo el catálogo mientras tanto.
            </p>
            <Link
              to="/catalog"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Ver catálogo completo
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((product) => (
              <article
                key={product._id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">
                  <LocalOfferIcon fontSize="inherit" /> -{product.descuento}%
                </span>

                <Link
                  to={`/producto/${product._id}`}
                  className="flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
                >
                  <img
                    src={resolveProductImage(product.imagen)}
                    alt={product.nombre}
                    className="h-44 w-44 object-contain transition duration-500 group-hover:scale-105"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (!target.src.includes(PRODUCT_PLACEHOLDER)) {
                        target.src = PRODUCT_PLACEHOLDER;
                      }
                    }}
                  />
                </Link>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-600">{product.marca}</p>
                  <Link
                    to={`/producto/${product._id}`}
                    className="text-lg font-bold text-gray-900 transition hover:text-amber-600"
                  >
                    {product.nombre}
                  </Link>
                  <p className="line-clamp-2 text-sm text-gray-500">{product.descripcion}</p>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                    <div>
                      <p className="text-xs text-gray-400 line-through">{formatCurrency(product.precio)}</p>
                      <p className="text-2xl font-bold text-amber-600">{formatCurrency(product.precioOferta as number)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          id: product._id,
                          name: product.nombre,
                          price: product.precioOferta as number,
                          originalPrice: product.precio,
                          image: resolveProductImage(product.imagen)
                        })
                      }
                      className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default OfertasPage;
