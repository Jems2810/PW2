import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import BrandCarousel from '../components/BrandCarousel';
import Banner from '../components/Banner';
import Footer from '../components/Footer';
import { fetchPublicProducts, type PublicProduct } from '../lib/catalog';

const Home: React.FC = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      setProductsError('');

      try {
        const featuredProducts = await fetchPublicProducts({ destacado: 'true' });

        if (featuredProducts.length > 0) {
          setProducts(featuredProducts.slice(0, 4));
          return;
        }

        const allProducts = await fetchPublicProducts();
        setProducts(allProducts.slice(0, 4));
      } catch (error) {
        setProductsError(error instanceof Error ? error.message : 'No se pudo cargar el catálogo público');
      } finally {
        setLoadingProducts(false);
      }
    };

    void loadProducts();
  }, []);

  const sectionDescription = useMemo(() => {
    if (products.length > 0) {
      return 'Estos productos se cargan en tiempo real desde MongoDB por medio de la API pública.';
    }

    return 'Descubre los smartphones más populares de nuestra tienda';
  }, [products.length]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <BrandCarousel />
      
      {/* Sección de productos destacados */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold text-sm tracking-wider uppercase mb-2">
              Lo más vendido
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Productos <span className="text-primary-500">Destacados</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {sectionDescription}
            </p>
          </div>
          
          {loadingProducts ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
              Cargando catálogo público desde MongoDB...
            </div>
          ) : productsError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center text-red-700 shadow-sm">
              {productsError}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
              Aún no hay productos activos para mostrar en la tienda pública.
            </div>
          )}

          {/* Ver más */}
          <div className="text-center mt-12">
            <Link to="/catalog" className="inline-flex px-8 py-3 border-2 border-primary-500 text-primary-600 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300">
              Ver todo el catálogo
            </Link>
          </div>
        </div>
      </section>

      <Banner />
      <Footer />
    </div>
  );
};

export default Home;
