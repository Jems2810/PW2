import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const offers = [
  { id: 1, name: 'iPhone 17 Pro', price: 28999, image: 'iphone17.png' },
  { id: 2, name: 'Samsung Galaxy A27', price: 7999, image: 'samsungA27.png' },
  { id: 3, name: 'Google Pixel 10', price: 15999, image: 'googlepixel.png' },
];

const OffersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-br from-orange-50 to-primary-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-orange-500 font-semibold uppercase text-sm mb-2">
              Promociones
            </p>
            <h1 className="text-4xl font-bold text-gray-900">
              Ofertas <span className="text-primary-500">especiales</span>
            </h1>
            <p className="text-gray-600 mt-4">
              Aprovecha descuentos por tiempo limitado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OffersPage;