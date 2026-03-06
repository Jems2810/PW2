import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Iconos de Material UI
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    newsletter: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-primary-100/30 rounded-full blur-2xl"></div>

      <div className="relative max-w-2xl w-full">
        
        {/* Contenedor principal */}
        <div className="bg-white rounded-3xl shadow-xl shadow-primary-500/10 border border-gray-100 p-8 space-y-6">
          
          {/* Header con logo */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center mb-2">
              <div className="p-3 bg-primary-500 rounded-2xl">
                <PhoneIphoneIcon className="text-white" fontSize="large" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-gray-500">Únete a la mejor tienda de celulares</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nombres en fila */}
            <div className="grid grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PersonIcon className="text-gray-400" fontSize="small" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300"
                    placeholder="Juan"
                  />
                </div>
              </div>

              {/* Apellido */}
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PersonIcon className="text-gray-400" fontSize="small" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300"
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            {/* Email y Teléfono en fila */}
            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EmailIcon className="text-gray-400" fontSize="small" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PhoneIcon className="text-gray-400" fontSize="small" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300"
                    placeholder="+52 (81) 1234-5678"
                  />
                </div>
              </div>
            </div>

            {/* Contraseñas en fila */}
            <div className="grid grid-cols-2 gap-4">
              {/* Contraseña */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockIcon className="text-gray-400" fontSize="small" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors duration-300"
                  >
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockIcon className="text-gray-400" fontSize="small" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors duration-300"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              {/* Términos y condiciones */}
              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 mt-0.5 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-3 block text-sm text-gray-600">
                  Acepto los{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300">
                    Términos y Condiciones
                  </Link>
                  {' '}y la{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300">
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              {/* Newsletter */}
              <div className="flex items-center">
                <input
                  id="newsletter"
                  name="newsletter"
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="newsletter" className="ml-3 block text-sm text-gray-600">
                  Quiero recibir ofertas exclusivas y noticias por email
                </label>
              </div>
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <PersonAddIcon fontSize="small" />
              <span>Crear Cuenta</span>
            </button>
          </form>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">O regístrate con</span>
            </div>
          </div>

          {/* Botones de redes sociales */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl transition-all duration-300">
              <GoogleIcon fontSize="small" className="text-red-500" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl transition-all duration-300">
              <FacebookIcon fontSize="small" className="text-blue-600" />
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>

          {/* Enlace para iniciar sesión */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-300 inline-flex items-center space-x-1"
              >
                <LoginIcon fontSize="small" />
                <span>Inicia sesión aquí</span>
              </Link>
            </p>
          </div>
        </div>

        {/* Beneficios de registrarse */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg shadow-primary-500/5 border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Al registrarte obtienes:
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            {['Envío gratis', 'Ofertas exclusivas', 'Historial de compras', 'Soporte prioritario'].map((benefit, i) => (
              <div key={i} className="flex items-center space-x-2">
                <CheckCircleIcon className="text-primary-500" fontSize="small" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
