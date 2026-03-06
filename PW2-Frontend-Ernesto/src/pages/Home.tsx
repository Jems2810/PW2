import React from 'react';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import BrandCarousel from '../components/BrandCarousel';
import Banner from '../components/Banner';
import Footer from '../components/Footer';

const phones = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 24999,
    image: 'iphone.jpg'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24',
    price: 19999,
    image: 'galaxy.jpg',
  },
  {
    id: 3,
    name: 'Xiaomi 14 Ultra',
    price: 14999,
    image: 'xiaomi.jpg',
  },
  {
    id: 4,
    name: 'Google Pixel 8 Pro',
    price: 17999,
    image: 'google.jpg',
  },
];

const Home: React.FC = () => (
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
            Descubre los smartphones más populares de nuestra tienda
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {phones.map(phone => (
            <ProductCard key={phone.id} {...phone} />
          ))}
        </div>

        {/* Ver más */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 border-2 border-primary-500 text-primary-600 rounded-xl font-semibold hover:bg-primary-500 hover:text-white transition-all duration-300">
            Ver todo el catálogo
          </button>
        </div>
      </div>
    </section>

    <Banner />
    <Footer />
  </div>
);

export default Home;
