import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import Card from '../components/common/Card';
import { Search, SlidersHorizontal, RotateCcw, Star } from 'lucide-react';

export const Catalog: React.FC = () => {
  const { products, isLoading, searchProducts } = useProducts();
  const { categories, isLoading: isCategoriesLoading } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Trigger search on term change (with debouncing, or just instant submit)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts(searchTerm);
  };

  // Find price bounds from current product list
  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 3000;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  // Set default slider limit once products load
  useEffect(() => {
    if (products.length > 0) {
      setMaxPrice(Math.max(...products.map((p) => p.price)));
    }
  }, [products]);

  // Apply filters on client-side
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // 2. Price Filter
      if (product.price > maxPrice) {
        return false;
      }
      // 3. Rating Filter
      if (product.rating !== undefined && product.rating < minRating) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory, maxPrice, minRating]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMinRating(0);
    setMaxPrice(maxProductPrice);
    searchProducts(''); // Clear search
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-8">
        
        {/* Header / Title & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">
              Discover Premium Products
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Browse through our customized Web3D collections and tech gadgets.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
            >
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className="md:hidden flex items-center justify-center gap-2 w-full py-3 bg-slate-900 border border-white/5 rounded-xl text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer"
        >
          <SlidersHorizontal size={14} />
          <span>{showFiltersMobile ? 'Hide Filters' : 'Show Filters'}</span>
        </button>

        {/* Layout Grid: Sidebar + Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          
          {/* SIDEBAR FILTERS */}
          <aside className={`space-y-8 md:block ${showFiltersMobile ? 'block' : 'hidden'}`}>
            
            {/* Filter Section: Categories */}
            <div className="glass p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase text-white tracking-wider pb-3 border-b border-white/5">
                Categories
              </h3>
              {isCategoriesLoading ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 bg-slate-900 rounded" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 text-xs text-gray-450 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="accent-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <span>All Products</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat._id}
                        onChange={() => setSelectedCategory(cat._id)}
                        className="accent-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Section: Price Slider */}
            <div className="glass p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-xs font-bold uppercase text-white tracking-wider">
                  Max Price
                </h3>
                <span className="text-xs text-purple-400 font-bold">${maxPrice.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                  <span>$0</span>
                  <span>${maxProductPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Filter Section: Rating */}
            <div className="glass p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase text-white tracking-wider pb-3 border-b border-white/5">
                Minimum Rating
              </h3>
              <div className="flex flex-col gap-2.5">
                {[0, 4, 3, 2].map((ratingVal) => (
                  <button
                    key={ratingVal}
                    onClick={() => setMinRating(ratingVal)}
                    className={`flex items-center gap-2.5 text-xs text-left w-full p-2.5 rounded-xl border transition-all cursor-pointer ${
                      minRating === ratingVal
                        ? 'border-purple-500 bg-purple-950/20 text-purple-300'
                        : 'border-transparent text-gray-400 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={12}
                          className={idx < (ratingVal || 5) ? 'text-yellow-400' : 'text-gray-650'}
                          fill={idx < (ratingVal || 5) ? 'currentColor' : 'transparent'}
                        />
                      ))}
                    </span>
                    <span>{ratingVal === 0 ? 'Any Rating' : `${ratingVal}+ Stars`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Action */}
            <button
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-2 w-full py-4.5 bg-slate-950 border border-white/5 hover:border-purple-500/20 hover:text-purple-400 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>

          </aside>

          {/* CATALOG PRODUCT GRID */}
          <main className="md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass rounded-2xl h-[410px] animate-pulse flex flex-col p-5">
                    <div className="bg-slate-900 rounded-xl aspect-square w-full" />
                    <div className="h-4 bg-slate-900 rounded mt-5 w-3/4" />
                    <div className="h-3 bg-slate-900 rounded mt-3 w-1/2" />
                    <div className="flex justify-between items-center mt-auto">
                      <div className="h-6 bg-slate-900 rounded w-1/4" />
                      <div className="h-10 bg-slate-900 rounded w-10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 glass rounded-3xl p-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-gray-500">
                  <SlidersHorizontal size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No products match your criteria</h3>
                  <p className="text-xs text-gray-550 mt-1 max-w-[280px] leading-normal">
                    Try adjusting your search queries, category selections, or price limits.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <Card key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};

export default Catalog;
