import React from 'react';
import { useCart } from '../context/CartContext';
import type { CartItemId } from '../context/CartContext';
import { 
  Add, 
  Remove, 
  Delete,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping,
  Security
} from '@mui/icons-material';

const ShoppingCart: React.FC = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const handleQuantityChange = (id: CartItemId, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  const shippingCost = state.total > 1000 ? 0 : 99;
  const finalTotal = state.total + shippingCost;

  if (state.items.length === 0) {
    return (
      <div className="bg-white pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-gray-50 rounded-2xl p-8 shadow-md border border-gray-100">
              <ShoppingCartIcon 
                className="mx-auto text-gray-400 mb-4" 
                style={{ fontSize: '80px' }}
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-600 text-base mb-6">
                Agrega algunos productos increíbles a tu carrito
              </p>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/30">
                Continuar Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header del carrito */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Carrito de Compras
          </h1>
          <p className="text-gray-600 text-base">
            {state.itemCount} {state.itemCount === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-3">
            {state.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg bg-gray-100"
                    />
                  </div>
                  
                  {/* Información del producto */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    
                    {item.color && (
                      <p className="text-gray-600 text-xs mb-1">
                        Color: {item.color}
                      </p>
                    )}
                    
                    {item.storage && (
                      <p className="text-gray-600 text-xs mb-2">
                        Almacenamiento: {item.storage}
                      </p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      
                      {/* Precio */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-base text-gray-500 line-through">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      {/* Controles de cantidad */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-xl px-3 py-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                          >
                            <Remove className="text-gray-700" fontSize="small" />
                          </button>
                          
                          <span className="text-gray-900 font-semibold min-w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                          >
                            <Add className="text-gray-700" fontSize="small" />
                          </button>
                        </div>
                        
                        {/* Botón eliminar */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-xl transition-all duration-200"
                        >
                          <Delete />
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtotal del producto */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-right text-lg font-bold text-gray-900">
                        Subtotal: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumen del Pedido
              </h2>
              
              {/* Detalles del costo */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-gray-900">
                  <span>Subtotal ({state.itemCount} productos)</span>
                  <span>{formatPrice(state.total)}</span>
                </div>
                
                <div className="flex justify-between text-gray-900">
                  <span className="flex items-center">
                    <LocalShipping className="mr-2" fontSize="small" />
                    Envío
                  </span>
                  <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                    {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
                  </span>
                </div>
                
                {shippingCost === 0 && (
                  <p className="text-green-600 text-sm">
                    ¡Felicidades! Tu pedido califica para envío gratuito
                  </p>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-900 text-xl font-bold">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
              
              {/* Garantías y beneficios */}
              <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-green-600 text-xs">
                  <Security className="mr-2" fontSize="small" />
                  <span>Garantía oficial</span>
                </div>
                <div className="flex items-center text-blue-600 text-xs">
                  <LocalShipping className="mr-2" fontSize="small" />
                  <span>Entrega en 24-48 horas</span>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="space-y-2">
                <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/30">
                  Proceder al Pago
                </button>
                
                <button className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 border border-gray-200">
                  Continuar Comprando
                </button>
                
                <button 
                  onClick={clearCart}
                  className="w-full text-red-600 py-2 px-4 rounded-xl font-medium hover:bg-red-50 transition-all duration-300"
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
