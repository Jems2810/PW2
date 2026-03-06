import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Login: React.FC = () => {
  return (
    <div className="relative">
      {/* Botón de regreso */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-300"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Componente principal de login */}
      <LoginForm />
    </div>
  );
};

export default Login;
