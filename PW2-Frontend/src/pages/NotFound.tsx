import React from 'react';
import { Link } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        <div className="max-w-lg w-full text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
          <SentimentDissatisfiedIcon style={{ fontSize: 96 }} className="text-primary-400" />
          <p className="mt-3 text-7xl font-extrabold text-gray-900">404</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Página no encontrada</h1>
          <p className="mt-2 text-gray-600">
            La dirección que intentas visitar no existe o fue movida.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
            >
              Volver al inicio
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
