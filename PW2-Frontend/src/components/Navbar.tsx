import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { name: 'Inicio', to: '/' },
  { name: 'Catálogo', to: '/catalog' },
  { name: 'Ofertas', to: '/ofertas', highlight: true },
  { name: 'Servicios', to: '/servicios' },
  { name: 'Contacto', to: '/contact' },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state } = useCart();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  // Cerrar el menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
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

            {/* Navegación Central — solo escritorio */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((item) => (
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
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
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

              {isAuthenticated && !isAdmin ? (
                <Link
                  to="/mis-pedidos"
                  className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 lg:inline-flex ${
                    isScrolled
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      : 'bg-white/70 text-primary-700 hover:bg-white'
                  }`}
                >
                  <ReceiptLongIcon fontSize="small" />
                  Mis pedidos
                </Link>
              ) : null}

              {isAuthenticated ? (
                <Link
                  to="/perfil"
                  className={`p-2.5 rounded-full transition-all duration-300 ${
                    isScrolled
                      ? 'hover:bg-primary-50 text-gray-600 hover:text-primary-600'
                      : 'hover:bg-white/30 text-gray-700'
                  }`}
                  title="Mi perfil"
                >
                  <PersonOutlineIcon fontSize="small" />
                </Link>
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

              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className={`hidden p-2.5 rounded-full transition-all duration-300 lg:block ${
                    isScrolled
                      ? 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                      : 'hover:bg-white/30 text-gray-700'
                  }`}
                  title="Cerrar sesión"
                >
                  <LogoutIcon fontSize="small" />
                </button>
              ) : null}

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

              {/* Botón hamburguesa — solo móvil */}
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className={`lg:hidden p-2.5 rounded-full transition-all duration-300 ${
                  isScrolled
                    ? 'hover:bg-gray-100 text-gray-700'
                    : 'hover:bg-white/30 text-gray-800'
                }`}
                aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {mobileOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay oscuro */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Panel lateral móvil */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera del panel */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
          <span className="text-lg font-bold text-gray-900">
            Móvil<span className="text-primary-500">Store</span>
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Cerrar menú"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Links de navegación */}
        <nav className="flex flex-col gap-1 px-4 py-4">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                item.highlight
                  ? 'text-amber-600 hover:bg-amber-50'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
              }`}
            >
              {item.name}
              {item.highlight && (
                <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">OFERTA</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Separador */}
        <div className="mx-4 border-t border-gray-100" />

        {/* Acciones de cuenta */}
        <div className="flex flex-col gap-1 px-4 py-4">
          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-violet-700 hover:bg-violet-50"
            >
              <AdminPanelSettingsIcon fontSize="small" />
              Administración
            </Link>
          ) : null}

          {isAuthenticated && !isAdmin ? (
            <Link
              to="/mis-pedidos"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
            >
              <ReceiptLongIcon fontSize="small" />
              Mis pedidos
            </Link>
          ) : null}

          {isAuthenticated ? (
            <>
              <Link
                to="/perfil"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
              >
                <PersonOutlineIcon fontSize="small" />
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogoutIcon fontSize="small" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
            >
              <PersonOutlineIcon fontSize="small" />
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;