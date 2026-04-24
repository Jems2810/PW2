import React from 'react';

import { SiMotorola, SiOppo } from 'react-icons/si';

const brands = [
  { name: 'Apple', logo: '/apple.svg' },
  { name: 'Samsung', logo: '/samsung.svg' },
  { name: 'Xiaomi', logo: '/xiaomi.svg' },
  { name: 'Huawei', logo: '/huawei.svg' },
  { name: 'OnePlus', logo: '/oneplus.svg' },
  { name: 'Google', logo: '/google.svg' },
  { name: 'Sony', logo: '/sony.svg' },
  { name: 'Nokia', logo: '/nokia.svg' },
  { name: 'Motorola', icon: SiMotorola },
  { name: 'Oppo', icon: SiOppo },
];

const BrandCarousel: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary-600 font-semibold text-sm tracking-wider uppercase mb-2">
            Nuestras marcas
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Trabajamos con los{' '}
            <span className="text-primary-500">mejores</span>
          </h2>
        </div>

        {/* Grid de marcas en lugar de carrusel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="group relative bg-gray-50 hover:bg-primary-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-3">
                {brand.logo ? (
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                ) : brand.icon ? (
                  <brand.icon className="w-12 h-12 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
                ) : null}
              </div>
              
              {/* Línea decorativa inferior */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary-500 rounded-full group-hover:w-12 transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Texto adicional */}
        <p className="text-center text-gray-500 mt-10 text-sm">
          Y muchas más marcas disponibles en nuestra tienda
        </p>
      </div>
    </section>
  );
};

export default BrandCarousel;
