import React from 'react';
import { Link } from 'react-router-dom';

import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcApplePay } from 'react-icons/fa';

const quickLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Catálogo', href: '#' },
  { name: 'Ofertas', href: '#' },
  { name: 'Servicios', href: '#' },
  { name: 'Contacto', href: '/contact' }
];

const brands = [
  { name: 'Apple' },
  { name: 'Samsung' },
  { name: 'Xiaomi' },
  { name: 'Google' },
  { name: 'OnePlus' }
];

const socialLinks = [
  { name: 'Facebook', icon: FacebookIcon, color: 'hover:bg-blue-600' },
  { name: 'Instagram', icon: InstagramIcon, color: 'hover:bg-pink-600' },
  { name: 'X', icon: XIcon, color: 'hover:bg-gray-700' },
  { name: 'YouTube', icon: YouTubeIcon, color: 'hover:bg-red-600' }
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-primary-500">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Suscríbete a nuestras ofertas</h3>
              <p className="text-primary-100">Recibe las mejores promociones directamente en tu correo</p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 lg:w-72 px-5 py-3 rounded-l-xl bg-white/20 backdrop-blur text-white placeholder-primary-200 border-0 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-r-xl hover:bg-amber-600 transition-colors duration-300">
                Suscribir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-primary-500 rounded-xl">
                <PhoneIphoneIcon className="text-white" />
              </div>
              <span className="text-xl font-bold">
                Móvil<span className="text-primary-500">Store</span>
              </span>
            </Link>
            
            <p className="text-gray-400 leading-relaxed">
              Tu tienda de confianza para smartphones y accesorios. Calidad garantizada y los mejores precios.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors cursor-pointer">
                <PhoneOutlinedIcon fontSize="small" />
                <span>+52 (81) 1234-5678</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors cursor-pointer">
                <EmailOutlinedIcon fontSize="small" />
                <span>hola@movilstore.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors cursor-pointer">
                <PlaceOutlinedIcon fontSize="small" />
                <span>Monterrey, México</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Enlaces</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Marcas</h4>
            <ul className="space-y-3">
              {brands.map((brand, i) => (
                <li key={i}>
                  <a 
                    href="#"
                    className="text-gray-400 hover:text-amber-400 transition-colors duration-300"
                  >
                    {brand.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Síguenos</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className={`w-12 h-12 bg-gray-800 ${social.color} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110`}
                  title={social.name}
                >
                  <social.icon className="text-white" />
                </a>
              ))}
            </div>
            
            <div className="mt-8">
              <h5 className="text-sm font-semibold mb-3 text-gray-300">Métodos de pago</h5>
              <div className="flex gap-3">
                <div className="w-12 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors" title="Visa">
                  <FaCcVisa className="text-2xl text-blue-400" />
                </div>
                <div className="w-12 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors" title="MasterCard">
                  <FaCcMastercard className="text-2xl text-orange-400" />
                </div>
                <div className="w-12 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors" title="PayPal">
                  <FaCcPaypal className="text-2xl text-blue-500" />
                </div>
                <div className="w-12 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors" title="Apple Pay">
                  <FaCcApplePay className="text-2xl text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {currentYear} MóvilStore. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary-400 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Términos</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
