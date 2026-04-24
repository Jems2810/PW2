import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { fetchPublicProducts, type PublicProduct } from '../lib/catalog';

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await fetchPublicProducts({
          busqueda: searchTerm,
          marca: selectedBrand,
          ordenar: sortOrder
        });

        setProducts(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el catálogo');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = window.setTimeout(() => {
      void loadProducts();
    }, searchTerm ? 250 : 0);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, selectedBrand, sortOrder]);

  const brands = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.marca).filter(Boolean))
    ).sort((left, right) => left.localeCompare(right));
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="px-4 pb-16 pt-28 lg:px-8">
        <section className="mx-auto mb-8 max-w-6xl text-center">
          <p className="text-primary-600 mb-2 text-sm font-semibold uppercase">
            Catálogo
          </p>
          <h1 className="text-4xl font-bold text-gray-900">
            Todos nuestros <span className="text-primary-500">celulares</span>
          </h1>
          <p className="mt-4 text-gray-600">
            Explora nuestros smartphones disponibles.
          </p>
        </section>

        <section className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Buscar producto
              </span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nombre, marca o modelo"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Marca
              </span>
              <select
                value={selectedBrand}
                onChange={(event) => setSelectedBrand(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white"
              >
                <option value="">Todas las marcas</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Ordenar por
              </span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white"
              >
                <option value="">Más recientes</option>
                <option value="nombre">Nombre</option>
                <option value="precio-asc">Precio menor a mayor</option>
                <option value="precio-desc">Precio mayor a menor</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-6xl">
          {loading ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
              Cargando catálogo...
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 p-12 text-center text-red-700 shadow-sm">
              {error}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.nombre}
                  price={product.precio}
                  image={product.imagen}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
              No hay productos que coincidan con los filtros actuales.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogPage;