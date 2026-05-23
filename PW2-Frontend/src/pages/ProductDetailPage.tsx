import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BoltIcon from '@mui/icons-material/Bolt';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductReviews from '../components/ProductReviews';
import { API_URL, PRODUCT_PLACEHOLDER, resolveProductImage } from '../lib/catalog';
import { useCart } from '../context/CartContext';

interface ProductDetail {
  _id: string;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  stock: number;
  imagen: string;
  imagenes?: string[];
  especificaciones?: {
    pantalla?: string;
    procesador?: string;
    ram?: string;
    almacenamiento?: string;
    camara?: string;
    bateria?: string;
    sistemaOperativo?: string;
  };
  color?: string;
  coloresDisponibles?: string[];
  rating?: number;
  numReviews?: number;
  destacado?: boolean;
}

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>(PRODUCT_PLACEHOLDER);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleRatingChange = useCallback((avg: number, count: number) => {
    setProduct((prev) => {
      if (!prev) return prev;
      if (prev.rating === avg && prev.numReviews === count) return prev;
      return { ...prev, rating: avg, numReviews: count };
    });
  }, []);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Producto no encontrado');
        }
        const data = (await response.json()) as ProductDetail;
        setProduct(data);
        setImageSrc(resolveProductImage(data.imagen));
        if (data.coloresDisponibles && data.coloresDisponibles.length > 0) {
          setSelectedColor(data.color || data.coloresDisponibles[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const finalPrice = product.precioOferta && product.precioOferta < product.precio
      ? product.precioOferta
      : product.precio;

    const displayName = selectedColor ? `${product.nombre} (${selectedColor})` : product.nombre;

    for (let i = 0; i < quantity; i += 1) {
      addItem({
        id: product._id,
        name: displayName,
        price: finalPrice,
        originalPrice: product.precio,
        image: resolveProductImage(product.imagen)
      });
    }
    setFeedback(`Agregado al carrito (${quantity} unidad${quantity > 1 ? 'es' : ''}).`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const finalPrice = product?.precioOferta && product.precioOferta < product.precio
    ? product.precioOferta
    : product?.precio ?? 0;

  const discount = product?.precioOferta && product.precioOferta < product.precio
    ? Math.round(((product.precio - product.precioOferta) / product.precio) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-12 pt-28 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-primary-600"
        >
          <ArrowBackIcon fontSize="small" /> Volver
        </button>

        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Cargando producto...
          </div>
        ) : error || !product ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-700">{error || 'Producto no disponible'}</p>
            <Link to="/catalog" className="mt-4 inline-block text-sm font-semibold text-primary-600 hover:underline">
              Volver al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr]">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex h-96 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-primary-50">
                <img
                  src={imageSrc}
                  alt={product.nombre}
                  onError={() => setImageSrc(PRODUCT_PLACEHOLDER)}
                  className="h-80 w-80 object-contain"
                />
              </div>

              {product.imagenes && product.imagenes.length > 0 ? (
                <div className="mt-4 flex gap-3 overflow-x-auto">
                  {[product.imagen, ...product.imagenes].map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setImageSrc(resolveProductImage(img))}
                      className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 transition hover:border-primary-300"
                    >
                      <img
                        src={resolveProductImage(img)}
                        alt={`${product.nombre}-${idx}`}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          if (!e.currentTarget.src.includes(PRODUCT_PLACEHOLDER)) {
                            e.currentTarget.src = PRODUCT_PLACEHOLDER;
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">{product.marca}</p>
                <h1 className="mt-2 text-3xl font-bold text-gray-900 lg:text-4xl">{product.nombre}</h1>
                <p className="mt-1 text-sm text-gray-500">Modelo: {product.modelo}</p>
              </div>

              <div className="flex items-end gap-3">
                {discount > 0 ? (
                  <>
                    <span className="text-4xl font-bold text-amber-600">{formatCurrency(finalPrice)}</span>
                    <span className="text-lg text-gray-400 line-through">{formatCurrency(product.precio)}</span>
                    <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">-{discount}%</span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">{formatCurrency(product.precio)}</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className={`rounded-full px-3 py-1 font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </span>
                {product.destacado ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 font-semibold text-violet-700">
                    <BoltIcon fontSize="inherit" /> Destacado
                  </span>
                ) : null}
              </div>

              <p className="text-gray-600">{product.descripcion}</p>

              {product.coloresDisponibles && product.coloresDisponibles.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Color: <span className="font-normal text-gray-500">{selectedColor || 'Selecciona uno'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.coloresDisponibles.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${selectedColor === color ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {product.especificaciones ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">Especificaciones</h2>
                  <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    {Object.entries(product.especificaciones).map(([key, value]) =>
                      value ? (
                        <div key={key} className="flex justify-between gap-2 border-b border-gray-100 py-1">
                          <dt className="capitalize text-gray-500">{key}</dt>
                          <dd className="font-medium text-gray-800">{value}</dd>
                        </div>
                      ) : null
                    )}
                  </dl>
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <label htmlFor="qty" className="text-sm font-medium text-gray-700">Cantidad:</label>
                <div className="inline-flex items-center rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-lg font-bold text-gray-500 hover:text-gray-900"
                  >
                    −
                  </button>
                  <input
                    id="qty"
                    type="number"
                    min={1}
                    max={product.stock || 99}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock || 99)))}
                    className="w-14 border-x border-gray-200 bg-white px-2 py-2 text-center text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                    className="px-3 py-2 text-lg font-bold text-gray-500 hover:text-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>

              {feedback ? (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                  {feedback}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-white px-5 py-3 font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <AddShoppingCartIcon fontSize="small" /> Agregar al carrito
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Comprar ahora
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 text-xs text-gray-600">
                <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-3">
                  <LocalShippingIcon fontSize="small" className="text-primary-500" />
                  Envío gratis +$5,000
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-3">
                  <VerifiedIcon fontSize="small" className="text-emerald-500" />
                  Garantía oficial
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-3">
                  <BoltIcon fontSize="small" className="text-amber-500" />
                  Envío express CDMX/MTY
                </div>
              </div>
            </div>
          </div>
        )}

        {product ? (
          <ProductReviews
            productId={product._id}
            onRatingChange={handleRatingChange}
          />
        ) : null}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
