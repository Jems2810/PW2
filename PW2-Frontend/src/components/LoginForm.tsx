import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Iconos de Material UI
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../context/AuthContext';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const user = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      setFeedback({
        type: 'success',
        text: user.rol === 'admin' ? 'Sesión iniciada. Ya puedes entrar al panel de administración desde Inicio.' : 'Sesión iniciada correctamente.'
      });

      navigate('/');
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'No se pudo iniciar sesión'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary-100/30 rounded-full blur-2xl"></div>

      <div className="relative max-w-md w-full">
        
        {/* Contenedor principal */}
        <div className="bg-white rounded-3xl shadow-xl shadow-primary-500/10 border border-gray-100 p-8 space-y-8">
          
          {/* Header con logo */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary-500 rounded-2xl">
                <PhoneIphoneIcon className="text-white" fontSize="large" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
            <p className="text-gray-500">Accede a tu cuenta para continuar</p>
          </div>

          {feedback ? (
            <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {feedback.text}
            </div>
          ) : null}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campo Email */}
            <div className="space-y-2">
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
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
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
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-300"
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

            {/* Recordarme y Olvidé contraseña */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600">
                  Recordarme
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center space-x-2 disabled:cursor-not-allowed disabled:bg-primary-300 disabled:shadow-none"
              disabled={submitting}
            >
              {submitting ? <AdminPanelSettingsIcon fontSize="small" /> : <LoginIcon fontSize="small" />}
              <span>{submitting ? 'Validando acceso...' : 'Iniciar Sesión'}</span>
            </button>
          </form>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">O continúa con</span>
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

          {/* Enlace para registrarse */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-300 inline-flex items-center space-x-1"
              >
                <PersonAddIcon fontSize="small" />
                <span>Regístrate aquí</span>
              </Link>
            </p>
          </div>
        </div>

        {/* Texto adicional debajo */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700 transition-colors duration-300">
              Términos y Condiciones
            </Link>
            {' '}y{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-700 transition-colors duration-300">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
