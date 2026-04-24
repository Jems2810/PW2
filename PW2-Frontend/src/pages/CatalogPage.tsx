import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

const products = [
  { id: 1, name: 'iPhone 15 Pro', price: 24999, image: 'iphone.jpg' },
  { id: 2, name: 'Samsung Galaxy S24', price: 19999, image: 'galaxy.jpg' },
  { id: 3, name: 'Xiaomi 14 Ultra', price: 14999, image: 'xiaomi.jpg' },
  { id: 4, name: 'Google Pixel 8 Pro', price: 17999, image: 'google.jpg' },
  { id: 5, name: 'Motorola Edge 40', price: 10999, image: 'motorola.jpg' },
  { id: 6, name: 'Huawei P60 Pro', price: 41999, image: 'huawei.png' },
];

const CatalogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold uppercase text-sm mb-2">
              Catálogo
            </p>
            <h1 className="text-4xl font-bold text-gray-900">
              Todos nuestros <span className="text-primary-500">celulares</span>
            </h1>
            <p className="text-gray-600 mt-4">
              Explora nuestros smartphones disponibles
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CatalogPage;