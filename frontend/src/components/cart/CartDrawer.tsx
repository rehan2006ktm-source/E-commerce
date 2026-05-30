import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, updateCartQuantity, removeFromCart, fetchCart, isLoading } = useCartStore();
  const { isCartOpen, setCartOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isCartOpen) {
      fetchCart();
    }
  }, [isCartOpen, fetchCart]);

  const handleCheckout = () => {
    setCartOpen(false);
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Cart Panel Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 w-full sm:w-[440px] h-screen bg-slate-950/95 border-l border-white/5 backdrop-blur-xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-purple-500" size={22} />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Your Cart</h2>
                <span className="bg-purple-600/20 text-purple-400 text-xs px-2.5 py-1 rounded-full font-bold">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* List of items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {isLoading && items.length === 0 ? (
                <div className="h-full flex items-center justify-center flex-col space-y-3">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500">Retrieving cart details...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-gray-600">
                    <ShoppingBag size={32} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-300">Your cart is empty</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto leading-normal">
                      Fill it with our premium digital assets and luxury collections.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      navigate('/catalog');
                    }}
                    className="px-6 py-2.5 bg-slate-900 border border-white/5 text-purple-400 hover:bg-slate-800 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    Start Browsing
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const img = item.product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
                  return (
                    <motion.div
                      key={item.product._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex gap-4"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/5 bg-slate-950 shrink-0">
                        <img src={img} alt={item.product.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-grow flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-semibold text-gray-200 line-clamp-1 leading-snug">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-white/5 rounded-lg bg-slate-950 overflow-hidden">
                            <button
                              onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                              className="px-2.5 py-1 text-gray-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-semibold text-white select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                              className="px-2.5 py-1 text-gray-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-purple-400">
                            ${(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-slate-950 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-lg font-bold text-white">${totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Shipping fees and local taxes calculated at checkout steps. Safe SSL secured data environment.
                </p>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all cursor-pointer"
                >
                  Proceed To Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
