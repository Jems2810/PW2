import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Phone,
  Email,
  LocationOn,
  Schedule,
  Send,
  Person,
  Message,
  Business,
  WhatsApp,
  Facebook,
  Instagram
} from '@mui/icons-material';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí manejarías el envío del formulario
    console.log('Formulario enviado:', formData);
    alert('¡Gracias por contactarnos! Te responderemos pronto.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-teal-600 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 bg-white/20 text-white/90 rounded-full text-sm font-medium mb-4">¿Necesitas ayuda?</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contáctanos
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              ¿Tienes alguna pregunta? Estamos aquí para ayudarte. 
              Ponte en contacto con nuestro equipo de expertos.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Información de Contacto */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Información de Contacto
                </h2>
                <p className="text-gray-600 mb-8">
                  Ubicados en el corazón de Monterrey, nuestro equipo está disponible 
                  para ayudarte con cualquier consulta sobre nuestros productos y servicios. 
                  Atendemos todo el área metropolitana de Monterrey.
                </p>
              </div>

              {/* Datos de Contacto */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                      <Phone className="text-white" fontSize="medium" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Teléfono</h3>
                    <p className="text-gray-600">+52 (81) 1234-5678</p>
                    <p className="text-gray-600">+52 (81) 8765-4321</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                      <Email className="text-white" fontSize="medium" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">hola@movilstore.com</p>
                    <p className="text-gray-600">soporte@movilstore.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                      <LocationOn className="text-white" fontSize="medium" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Dirección</h3>
                    <p className="text-gray-600">Av. Constitución 2450, Col. Obrera</p>
                    <p className="text-gray-600">Monterrey, Nuevo León 64010</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                      <Schedule className="text-white" fontSize="medium" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Horarios</h3>
                    <p className="text-gray-600">Lunes - Viernes: 10:00 AM - 8:00 PM</p>
                    <p className="text-gray-600">Sábados: 10:00 AM - 9:00 PM</p>
                    <p className="text-gray-600">Domingos: 12:00 PM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Síguenos en Redes Sociales
                </h3>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                  >
                    <Facebook className="text-white" fontSize="small" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors duration-300"
                  >
                    <Instagram className="text-white" fontSize="small" />
                  </a>
                  <a 
                    href="#" 
                    className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors duration-300"
                  >
                    <WhatsApp className="text-white" fontSize="small" />
                  </a>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Envíanos un Mensaje
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <Person className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fontSize="small" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-300"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fontSize="small" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-300"
                        placeholder="Tu teléfono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Email className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fontSize="small" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-300"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <div className="relative">
                    <Business className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fontSize="small" />
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-300"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <div className="relative">
                    <Message className="absolute left-3 top-4 text-gray-400" fontSize="small" />
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Send fontSize="small" />
                  <span>Enviar Mensaje</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
