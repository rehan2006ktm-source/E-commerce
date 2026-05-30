import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSingleProduct } from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useReviewStore } from '../store/reviewStore';
import Canvas3D from '../components/3d/Canvas3D';
import { ShoppingCart, Star, Box, Check, ArrowLeft, ShieldAlert, MessageSquare, Trash2 } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { product, isLoading, error } = useSingleProduct(productId);
  const { addToCart, isLoading: isCartLoading } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { setActiveParticipant, setChatOpen } = useChatStore();
  const { fetchProductReviews, productReviews, addReview, deleteReview, isLoading: isReviewLoading } = useReviewStore();

  const [activeTab, setActiveTab] = useState<'image' | '3d'>('image');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('Standard Version');

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const reviews = productReviews[productId || ''] || [];

  useEffect(() => {
    if (productId) {
      fetchProductReviews(productId);
    }
  }, [productId, fetchProductReviews]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (product?.owner) {
      setActiveParticipant({
        _id: product.owner,
        name: 'Product Vendor',
      });
      setChatOpen(true);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setReviewError(null);
    try {
      await addReview(productId, reviewRating, reviewComment);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      if (productId) {
        await fetchProductReviews(productId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Syncing product data layers...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-grow max-w-7xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="inline-flex p-4 rounded-full bg-red-650/15 border border-red-500/35 text-red-500">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">Failed to retrieve product details</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          {error || 'The requested product could not be found. It may have been deleted by the seller.'}
        </p>
        <button
          onClick={() => navigate('/catalog')}
          className="px-6 py-3 bg-slate-900 border border-white/5 text-purple-400 hover:bg-slate-800 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const hasStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const currentImages = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'];

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Back to results</span>
      </button>

      {/* Split layout: Left (Gallery/3D Inspector) | Right (Meta specs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* LEFT COLUMN: Visual Media Drawer */}
        <div className="space-y-6">
          
          {/* Tab selector */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('image')}
              className={`pb-4 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'image'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              High-Res Image
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`pb-4 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === '3d'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              Interactive 3D View
            </button>
          </div>

          {/* Media panel display */}
          <div className="glass rounded-3xl overflow-hidden aspect-square flex items-center justify-center bg-slate-950/30 relative">
            {activeTab === 'image' ? (
              <img
                src={currentImages[selectedImageIdx]}
                alt={product.title}
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <div className="w-full h-full">
                <Canvas3D />
              </div>
            )}
          </div>

          {/* Image Gallery thumbnails (if showing image tab) */}
          {activeTab === 'image' && currentImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {currentImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 bg-slate-950 transition-all cursor-pointer ${
                    selectedImageIdx === idx ? 'border-purple-500 scale-95' : 'border-transparent hover:border-white/20'
                  }`}
                >
                  <img src={imgUrl} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Spec Sheet & Purchase controls */}
        <div className="space-y-8">
          
          {/* Header titles & ratings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-slate-900 border border-white/5 text-[10px] uppercase font-bold text-gray-400 px-3 py-1 rounded-full">
                {product.category ? 'Exclusive collection' : 'Premium item'}
              </span>
              
              {/* Stock status indicator */}
              {hasStock ? (
                isLowStock ? (
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                    Low Stock: {product.stock} left
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                    In Stock
                  </span>
                )
              ) : (
                <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none m-0">
              {product.title}
            </h1>

            {product.rating !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      className={idx < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-700'}
                      fill={idx < Math.floor(product.rating || 0) ? 'currentColor' : 'transparent'}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-bold">
                  ({product.rating.toFixed(1)} / 5.0 Rating value)
                </span>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="p-6 rounded-2xl glass space-y-1">
            <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">Purchase Price</span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-gradient">${product.price.toLocaleString()}</span>
              <span className="text-xs text-gray-500 line-through">${(product.price * 1.25).toFixed(0)}</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/10 px-2 py-0.5 rounded">
                Save 25%
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-white tracking-wider">Product Overview</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {product.description || 'Elevate your tech setup with this custom luxury item. Crafted from high-durability composites and designed with a premium sleek finish. Incorporates advanced performance parameters.'}
            </p>
          </div>

          {/* Variant Selectors */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-white tracking-wider">Select Version</h3>
            <div className="flex flex-wrap gap-3">
              {['Standard Version', 'Deluxe Bundle (+ $100)', 'Carbon Fiber Special'].map((variant) => (
                <button
                  key={variant}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-5 py-3 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    selectedVariant === variant
                      ? 'border-purple-500 bg-purple-950/20 text-purple-300'
                      : 'border-white/5 bg-slate-900/40 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>

          {/* Purchase Actions: Quantity modifier + CTA Button */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* Quantity */}
              {hasStock && (
                <div className="flex items-center border border-white/5 rounded-xl bg-slate-950 overflow-hidden w-full sm:w-auto h-[52px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 h-full text-gray-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-6 text-sm font-bold text-white select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 h-full text-gray-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Add To Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!hasStock || isCartLoading}
                className={`flex-grow h-[52px] w-full rounded-xl flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-wider transition-all select-none ${
                  hasStock
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/45 cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={18} />
                <span>{hasStock ? 'Add to Cart Drawer' : 'Out of Stock'}</span>
              </button>
            </div>

            {/* Micro details */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-gray-550">
              <div className="flex items-center gap-2">
                <Box size={14} className="text-purple-500" />
                <span>Original Packaging included</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-purple-500" />
                <span>1 Year Manufacturer Warranty</span>
              </div>
            </div>

            {/* Contact Seller Button */}
            {(!isAuthenticated || user?._id !== product.owner) && product.owner && (
              <button
                onClick={handleContactSeller}
                className="w-full h-[52px] rounded-xl flex items-center justify-center gap-3 border border-purple-500/30 bg-purple-950/10 hover:bg-purple-950/20 text-purple-400 font-bold text-sm uppercase tracking-wider transition-all select-none cursor-pointer mt-4"
              >
                <MessageSquare size={18} />
                <span>Contact Seller</span>
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Reviews Section */}
      <div className="mt-20 border-t border-white/5 pt-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Customer Reviews</h2>
            <p className="text-xs text-gray-500 mt-1">Real feedback from verified purchasers and users</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-extrabold text-white">
                {reviews.length > 0
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'}
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Average Rating</p>
            </div>
            <div className="h-10 w-px bg-white/5" />
            <div>
              <div className="flex items-center gap-0.5 text-yellow-400">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
                  return (
                    <Star
                      key={idx}
                      size={16}
                      className={idx < Math.floor(avg) ? 'text-yellow-400' : 'text-gray-700'}
                      fill={idx < Math.floor(avg) ? 'currentColor' : 'transparent'}
                    />
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{reviews.length} reviews submitted</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Review write panel */}
          <div className="glass p-6 rounded-2xl space-y-5 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Write a Review</h3>
            {user?._id === product.owner ? (
              <p className="text-xs text-gray-550 leading-normal">
                Sellers cannot write reviews for their own catalog products.
              </p>
            ) : !isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-550 leading-normal">
                  You must be signed in to submit product feedback.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Select Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-gray-600 hover:text-yellow-450 transition-colors cursor-pointer font-bold"
                      >
                        <Star
                          size={24}
                          className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-700'}
                          fill={star <= reviewRating ? 'currentColor' : 'transparent'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Review details</label>
                  <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your experience with this product..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {reviewError && (
                  <p className="text-[10px] text-red-500 leading-normal">{reviewError}</p>
                )}

                <button
                  type="submit"
                  disabled={isReviewLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isReviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-white/5 rounded-2xl text-xs text-gray-550">
                No reviews have been posted for this product yet. Be the first to share your thoughts!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const revUserId = typeof rev.user === 'object' ? rev.user?._id : rev.user;
                  const revUserName = typeof rev.user === 'object' ? rev.user?.name : 'Verified Customer';
                  const revUserAvatar = typeof rev.user === 'object' ? rev.user?.avatar : undefined;
                  const isMine = revUserId === user?._id;

                  return (
                    <div key={rev._id} className="p-5 rounded-2xl border border-white/5 bg-slate-950/45 flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 overflow-hidden shrink-0 flex items-center justify-center font-bold text-white text-xs">
                        {revUserAvatar ? (
                          <img src={revUserAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          revUserName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold text-gray-200">{revUserName}</h4>
                          <span className="text-[10px] text-gray-550">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-yellow-400 mt-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              size={12}
                              className={idx < rev.rating ? 'text-yellow-400' : 'text-gray-700'}
                              fill={idx < rev.rating ? 'currentColor' : 'transparent'}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mt-2.5 break-words">
                          {rev.comment}
                        </p>
                      </div>
                      {isMine && (
                        <button
                          onClick={() => handleReviewDelete(rev._id)}
                          className="p-2 bg-slate-900 hover:bg-red-950/30 text-gray-500 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-xl transition-all cursor-pointer shrink-0"
                          title="Delete review"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
