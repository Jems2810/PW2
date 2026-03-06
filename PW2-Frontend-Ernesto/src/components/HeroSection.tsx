import React from 'react';
import EastIcon from '@mui/icons-material/East';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50 overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-3xl"></div>
      
      {/* Patrón de puntos decorativo */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle, #10B981 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative max-w-6xl mx-auto px-4 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Contenido de texto */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
              Nuevos modelos 2026 disponibles
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
              Tecnología
              <span className="block text-primary-500">sin límites</span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0">
              Explora nuestra colección premium de smartphones. Calidad garantizada, 
              precios justos y la mejor experiencia de compra.
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="group flex items-center justify-center gap-3 px-8 py-4 bg-primary-500 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300">
                Explorar catálogo
                <EastIcon className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-800 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-300">
                <span className="text-amber-500">🔥</span>
                Ver ofertas
              </button>
            </div>

            {/* Características */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
              {[
                { icon: VerifiedIcon, text: 'Garantía 2 años' },
                { icon: LocalShippingOutlinedIcon, text: 'Envío express' },
                { icon: SupportAgentIcon, text: 'Soporte 24/7' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600">
                  <item.icon className="text-primary-500" fontSize="small" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual/Imagen */}
          <div className="relative">
            {/* Card principal del teléfono */}
            <div className="relative z-10 bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 mx-auto max-w-sm">
              <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-primary-50 rounded-3xl flex items-center justify-center">
                <img 
                  src="/huawei.png" 
                  alt="Smartphone destacado" 
                  className="w-4/5 h-auto drop-shadow-2xl"
                />
              </div>
              
              {/* Info flotante */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">$41,999</p>
                    <p className="text-xs text-gray-500">Desde</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-lg">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          
          </div>
        </div>

        {/* Stats en la parte inferior */}
        <div className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-gray-200/50">
          {[
            { value: '50K+', label: 'Clientes felices' },
            { value: '99%', label: 'Satisfacción' },
            { value: '24h', label: 'Entrega rápida' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;