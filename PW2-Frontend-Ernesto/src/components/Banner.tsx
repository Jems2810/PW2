import React from 'react';
import EastIcon from '@mui/icons-material/East';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Banner: React.FC = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-teal-500 p-8 lg:p-12">
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/10 rounded-full translate-y-1/2"></div>
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Contenido */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white/90 text-sm mb-4">
                <AccessTimeIcon fontSize="small" />
                <span>Oferta por tiempo limitado</span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                ¡Súper Ofertas de Temporada!
              </h3>
              <p className="text-primary-100 text-lg">
                Hasta <span className="font-bold text-amber-300 text-2xl">40% OFF</span> en smartphones seleccionados
              </p>
            </div>

            {/* CTA */}
            <button className="group flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-amber-50 transition-all duration-300 whitespace-nowrap">
              Ir a ofertas
              <EastIcon className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Contador o urgencia */}
          <div className="relative mt-8 flex justify-center lg:justify-start gap-4">
            {['2', '14', '35', '12'].map((num, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{num}</span>
                </div>
                <span className="text-xs text-primary-100 mt-1 block">
                  {['Días', 'Hrs', 'Min', 'Seg'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
