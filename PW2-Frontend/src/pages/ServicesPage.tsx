import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  LocalShipping,
  Security,
  SupportAgent,
  Smartphone,
  Build,
  CreditCard
} from '@mui/icons-material';

const services = [
  {
    title: 'Envío express',
    description: 'Recibe tu celular de forma rápida y segura',
    icon: <LocalShipping fontSize="large" />
  },
  {
    title: 'Garantía 2 años',
    description: 'Todos nuestros productos cuentan con garantía',
    icon: <Security fontSize="large" />
  },
  {
    title: 'Soporte 24/7',
    description: 'Te ayudamos antes y después de tu compra',
    icon: <SupportAgent fontSize="large" />
  },
  {
    title: 'Venta de smartphones',
    description: 'Celulares nuevos de las mejores marcas',
    icon: <Smartphone fontSize="large" />
  },
  {
    title: 'Revisión técnica',
    description: 'Diagnóstico y asesoría para tu dispositivo',
    icon: <Build fontSize="large" />
  },
  {
    title: 'Pagos seguros',
    description: 'Compra con tarjeta, transferencia o efectivo',
    icon: <CreditCard fontSize="large" />
  }
];

const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold uppercase text-sm mb-2">
              Servicios
            </p>
            <h1 className="text-4xl font-bold text-gray-900">
              Servicios de <span className="text-primary-500">MóvilStore</span>
            </h1>
            <p className="text-gray-600 mt-4">
              Todo lo que necesitas para comprar con confianza
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary-500 text-white rounded-2xl flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;