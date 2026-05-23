import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { fetchPublicProducts, type PublicProduct } from '../lib/catalog';

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('busqueda') ?? '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('marca') ?? '');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Sync from URL (e.g. when navigating from navbar search)
  useEffect(() => {
    const q = searchParams.get('busqueda') ?? '';
    setSearchTerm((prev) => (prev === q ? prev : q));
    const m = searchParams.get('marca') ?? '';
    setSelectedBrand((prev) => (prev === m ? prev : m));
  }, [searchParams]);

  // Reflect search term into URL
  useEffect(() => {
    const current = searchParams.get('busqueda') ?? '';
    if (current === searchTerm) return;
    const next = new URLSearchParams(searchParams);
    if (searchTerm) next.set('busqueda', searchTerm);
    else next.delete('busqueda');
    setSearchParams(next, { replace: true });
  }, [searchTerm, searchParams, setSearchParams]);

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
    return Array.from(new Set(products.map((product) => product.marca).filter(Boolean))).sort((left, right) => left.localeCompare(right));
  }, [products]);

  // Reiniciar a página 1 cuando cambian filtros o resultados
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBrand, sortOrder, products.length]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(
    () => products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [products, safePage]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="px-4 pb-16 pt-28 lg:px-8">
        <section className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Buscar producto</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nombre, marca o modelo"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Marca</span>
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
              <span className="mb-2 block text-sm font-semibold text-slate-700">Ordenar por</span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white"
              >
                <option value="">Mas recientes</option>
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
              Cargando catalogo...
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 p-12 text-center text-red-700 shadow-sm">
              {error}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
                <span>
                  Mostrando <strong className="text-slate-700">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, products.length)}</strong> de <strong className="text-slate-700">{products.length}</strong> productos
                </span>
                <span>Página {safePage} de {totalPages}</span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.nombre}
                    price={product.precio}
                    image={product.imagen}
                    precioOferta={product.precioOferta}
                    rating={product.rating}
                  />
                ))}
              </div>
              {totalPages > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        page === safePage
                          ? 'bg-primary-600 text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              ) : null}
            </>
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
