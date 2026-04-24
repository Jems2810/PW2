import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { state } = useCart();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-primary-500/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`p-2 rounded-xl transition-all duration-300 ${isScrolled ? 'bg-primary-500' : 'bg-white/20 backdrop-blur-sm'} group-hover:scale-110`}>
              <PhoneIphoneIcon className={`${isScrolled ? 'text-white' : 'text-primary-600'}`} />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${isScrolled ? 'text-gray-900' : 'text-gray-800'}`}>
              Móvil<span className="text-primary-500">Store</span>
            </span>
          </Link>

          {/* Navegación Central */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { name: 'Inicio', to: '/', active: true },
              { name: 'Catálogo', to: '/catalog' },
              { name: 'Ofertas', to: '/offers', highlight: true },
              { name: 'Servicios', to: '/services' },
              { name: 'Contacto', to: '/contact' },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full
                  ${item.highlight 
                    ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' 
                    : isScrolled 
                      ? 'text-gray-600 hover:text-primary-600 hover:bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-white/50'
                  }
                `}
              >
                {item.name}
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Link
                to="/admin"
                className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 lg:inline-flex ${
                  isScrolled
                    ? 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                    : 'bg-white/70 text-violet-700 hover:bg-white'
                }`}
              >
                <AdminPanelSettingsIcon fontSize="small" />
                Administración
              </Link>
            ) : null}

            {/* Búsqueda expandible */}
            <div className={`flex items-center transition-all duration-300 ${searchOpen ? 'w-48' : 'w-10'}`}>
              {searchOpen && (
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 text-sm bg-gray-100 rounded-l-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  searchOpen 
                    ? 'bg-gray-100 rounded-l-none' 
                    : isScrolled 
                      ? 'hover:bg-primary-50 text-gray-600 hover:text-primary-600' 
                      : 'hover:bg-white/30 text-gray-700'
                }`}
              >
                {searchOpen ? <CloseIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
              </button>
            </div>

            {isAuthenticated ? (
              <button
                onClick={logout}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isScrolled
                    ? 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                    : 'hover:bg-white/30 text-gray-700'
                }`}
                title="Cerrar sesión"
              >
                <LogoutIcon fontSize="small" />
              </button>
            ) : (
              <Link 
                to="/login" 
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isScrolled 
                    ? 'hover:bg-primary-50 text-gray-600 hover:text-primary-600' 
                    : 'hover:bg-white/30 text-gray-700'
                }`}
              >
                <PersonOutlineIcon fontSize="small" />
              </Link>
            )}

            {/* Carrito */}
            <Link 
              to="/cart" 
              className={`relative p-2.5 rounded-full transition-all duration-300 ${
                isScrolled 
                  ? 'bg-primary-500 text-white hover:bg-primary-600' 
                  : 'bg-primary-500/90 text-white hover:bg-primary-600'
              }`}
            >
              <ShoppingBagOutlinedIcon fontSize="small" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-amber-500 text-white rounded-full border-2 border-white">
                  {state.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;