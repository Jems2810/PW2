import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  precioOferta?: number;
  rating?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, precioOferta, rating }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState(() => resolveProductImage(image));
  const { addItem } = useCart();

  useEffect(() => {
    setImageSrc(resolveProductImage(image));
  }, [image]);

  const hasOffer = typeof precioOferta === 'number' && precioOferta > 0 && precioOferta < price;
  const displayPrice = hasOffer ? (precioOferta as number) : price;
  const discount = hasOffer ? Math.round(((price - (precioOferta as number)) / price) * 100) : 0;
  const ratingValue = typeof rating === 'number' && rating > 0 ? rating : null;

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price: displayPrice,
      originalPrice: hasOffer ? price : undefined,
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
        {hasOffer ? (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full">
              -{discount}%
            </span>
          </div>
        ) : null}

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
          <Link
            to={`/producto/${id}`}
            className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-primary-50 transition-all duration-300"
            title="Ver detalle"
          >
            <VisibilityOutlinedIcon className="text-gray-400" fontSize="small" />
          </Link>
        </div>

        <Link to={`/producto/${id}`} className="block h-full w-full">
          <img 
            src={imageSrc} 
            alt={name} 
            onError={() => setImageSrc(PRODUCT_PLACEHOLDER)}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
          />
        </Link>
      </div>

      {/* Información del producto */}
      <div className="p-5 space-y-3">
        {/* Rating */}
        {ratingValue !== null ? (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < Math.floor(ratingValue) ? 'text-amber-400' : 'text-gray-200'}`}
              >
                ★
              </span>
            ))}
            <span className="text-xs text-gray-400 ml-1">({ratingValue.toFixed(1)})</span>
          </div>
        ) : (
          <div className="text-xs text-gray-400">Sin reseñas aún</div>
        )}

        {/* Nombre */}
        <Link to={`/producto/${id}`} className="block">
          <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors duration-300">
            {name}
          </h3>
        </Link>

        {/* Precios y botón */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ${displayPrice.toLocaleString()}
            </span>
            {hasOffer ? (
              <span className="text-sm text-gray-400 line-through ml-2">
                ${price.toLocaleString()}
              </span>
            ) : null}
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
