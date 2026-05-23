import React from 'react';
import { Link } from 'react-router-dom';
import { FaApple, FaGoogle } from 'react-icons/fa';
import { SiSamsung, SiXiaomi, SiHuawei, SiOneplus, SiSony, SiNokia, SiMotorola, SiOppo } from 'react-icons/si';
import type { IconType } from 'react-icons';

const brands: { name: string; icon: IconType }[] = [
  { name: 'Apple', icon: FaApple },
  { name: 'Samsung', icon: SiSamsung },
  { name: 'Xiaomi', icon: SiXiaomi },
  { name: 'Huawei', icon: SiHuawei },
  { name: 'OnePlus', icon: SiOneplus },
  { name: 'Google', icon: FaGoogle },
  { name: 'Sony', icon: SiSony },
  { name: 'Nokia', icon: SiNokia },
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

        {/* Grid de marcas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {brands.map((brand, index) => {
            const Icon = brand.icon;
            return (
              <Link
                to={`/catalog?marca=${encodeURIComponent(brand.name)}`}
                key={index}
                className="group relative bg-gray-50 hover:bg-primary-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center gap-3">
                  <Icon className="w-12 h-12 text-gray-700 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-300" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">
                    {brand.name}
                  </span>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary-500 rounded-full group-hover:w-12 transition-all duration-300"></div>
              </Link>
            );
          })}
        </div>

        <p className="text-center text-gray-500 mt-10 text-sm">
          Y muchas más marcas disponibles en nuestra tienda
        </p>
      </div>
    </section>
  );
};

export default BrandCarousel;
