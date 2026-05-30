import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import type { ProductDetails } from '../../store/cartStore';

interface CardProps {
  product: ProductDetails;
}

export const Card: React.FC<CardProps> = ({ product }) => {
  const { addToCart, isLoading } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const hasStock = product.stock > 0;
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="glass rounded-2xl overflow-hidden group flex flex-col h-full relative"
    >
      {/* Wishlist Button Overlay */}
      <button className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-950/60 border border-white/5 hover:border-red-500/30 hover:bg-slate-900 transition-colors text-gray-400 hover:text-red-500">
        <Heart size={16} />
      </button>

      <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-slate-950/30">
        {/* Rating Badge */}
        {product.rating !== undefined && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-slate-950/75 border border-white/5 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-yellow-400">
            <Star size={12} fill="currentColor" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Product Image */}
        <motion.img
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4 }}
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover select-none"
          loading="lazy"
        />

        {!hasStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
            <span className="px-4 py-2 bg-red-600/90 border border-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              Out Of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Details Content */}
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`} className="group-hover:text-purple-400 transition-colors">
          <h3 className="font-semibold text-gray-150 text-base leading-snug line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed flex-grow">
          {product.description || 'No description available for this premium selection.'}
        </p>

        {/* Pricing & Cart Action */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Price</span>
            <span className="text-lg font-bold text-gradient">${product.price.toLocaleString()}</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleAddToCart}
            disabled={!hasStock || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              hasStock
                ? 'bg-purple-600/90 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            title={hasStock ? 'Add to Cart' : 'Out of stock'}
          >
            <ShoppingCart size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
