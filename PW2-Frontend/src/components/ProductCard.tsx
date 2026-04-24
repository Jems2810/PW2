import React, { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useCart } from '../context/CartContext';
import type { CartItemId } from '../context/CartContext';
import { PRODUCT_PLACEHOLDER, resolveProductImage } from '../lib/catalog';

interface ProductCardProps {
  id: CartItemId;
  name: string;
  price: number;
  image: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => resolveProductImage(image));
  const { addItem } = useCart();

  useEffect(() => {
    setImageSrc(resolveProductImage(image));
  }, [image]);
  
  const discount = Math.floor(Math.random() * 30) + 10;
  const originalPrice = Math.floor(price * (1 + discount / 100));
  const rating = (4.2 + Math.random() * 0.7).toFixed(1);
  
  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      originalPrice,
      image
    });
  };

  return (
    <div 
      className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary-500/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen del producto */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-primary-50 p-6">
        {/* Badge de descuento */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full">
            -{discount}%
          </span>
        </div>

        {/* Acciones flotantes */}
        <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-primary-50 transition-all duration-300"
          >
            {isFavorite ? (
              <FavoriteIcon className="text-rose-500" fontSize="small" />
            ) : (
              <FavoriteBorderIcon className="text-gray-400" fontSize="small" />
            )}
          </button>
          <button className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-primary-50 transition-all duration-300">
            <VisibilityOutlinedIcon className="text-gray-400" fontSize="small" />
          </button>
        </div>

        <img 
          src={imageSrc} 
          alt={name} 
          onError={() => setImageSrc(PRODUCT_PLACEHOLDER)}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
        />
      </div>

      {/* Información del producto */}
      <div className="p-5 space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-sm ${i < Math.floor(parseFloat(rating)) ? 'text-amber-400' : 'text-gray-200'}`}
            >
              ★
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-1">({rating})</span>
        </div>

        {/* Nombre */}
        <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors duration-300">
          {name}
        </h3>

        {/* Precios y botón */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ${price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400 line-through ml-2">
              ${originalPrice.toLocaleString()}
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 active:scale-95"
          >
            <AddIcon fontSize="small" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex gap-2 pt-1">
          <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
            Envío gratis
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
