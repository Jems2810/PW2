import React from 'react';
import Navbar from '../components/Navbar';
import ShoppingCart from '../components/ShoppingCart';
import Footer from '../components/Footer';

const CartPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ShoppingCart />
      <Footer />
    </div>
  );
};

export default CartPage;
