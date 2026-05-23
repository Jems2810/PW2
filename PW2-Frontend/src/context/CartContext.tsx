import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';

const CART_STORAGE_KEY = 'pw2_cart_state_v1';
export const CART_STORAGE_KEY_NAME = CART_STORAGE_KEY;

// Tipos para el carrito
export type CartItemId = number | string;

export interface CartItem {
  id: CartItemId;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  color?: string;
  storage?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: CartItemId }
  | { type: 'UPDATE_QUANTITY'; payload: { id: CartItemId; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: CartItemId) => void;
  updateQuantity: (id: CartItemId, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Reducer para manejar las acciones del carrito
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          items: updatedItems,
          total,
          itemCount
        };
      }
      
      const newItems = [...state.items, { ...action.payload, quantity: 1 }];
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        items: newItems,
        total,
        itemCount
      };
    }
    
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const total = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        items: filteredItems,
        total,
        itemCount
      };
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.id });
      }
      
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        items: updatedItems,
        total,
        itemCount
      };
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0
      };
    
    default:
      return state;
  }
};

// Estado inicial
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
};

const recalculate = (items: CartItem[]): CartState => ({
  items,
  total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
});

const loadInitialState = (): CartState => {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as { items?: unknown };
    if (!parsed || !Array.isArray(parsed.items)) return initialState;

    const sanitized: CartItem[] = [];
    for (const entry of parsed.items) {
      if (!entry || typeof entry !== 'object') continue;
      const item = entry as Partial<CartItem>;
      if (
        (typeof item.id !== 'string' && typeof item.id !== 'number') ||
        typeof item.name !== 'string' ||
        typeof item.price !== 'number' ||
        typeof item.image !== 'string' ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0
      ) {
        continue;
      }
      sanitized.push({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: typeof item.originalPrice === 'number' ? item.originalPrice : undefined,
        image: item.image,
        quantity: Math.floor(item.quantity),
        color: typeof item.color === 'string' ? item.color : undefined,
        storage: typeof item.storage === 'string' ? item.storage : undefined,
      });
    }
    return recalculate(sanitized);
  } catch {
    return initialState;
  }
};

// Provider del contexto
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items: state.items })
      );
    } catch {
      // ignore quota / serialization errors
    }
  }, [state.items]);

  // Vaciar el carrito cuando el usuario cierra sesión
  useEffect(() => {
    const handleLogout = () => dispatch({ type: 'CLEAR_CART' });
    window.addEventListener('pw2-auth-logout', handleLogout);
    return () => window.removeEventListener('pw2-auth-logout', handleLogout);
  }, []);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: CartItemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: CartItemId, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
