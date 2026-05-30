import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, RotateCcw, ArrowRight } from 'lucide-react';
import Canvas3D from '../components/3d/Canvas3D';
import { useProducts } from '../hooks/useProducts';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export const Home: React.FC = () => {
  const { products, isLoading } = useProducts();

  // Pick top 4 products as featured
  const featuredProducts = products.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <div className="flex-grow">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Text panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-900/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <span>🚀 Web3D E-Commerce Unleashed</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] m-0">
              Experience Products In <span className="text-gradient">Real-Time 3D</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-xl">
              Interact, rotate, and customize your luxury gear before placing an order. Powered by cutting-edge WebGL technology and high-fidelity rendering engines.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/catalog">
                <Button variant="primary" size="lg" className="gap-2">
                  <span>Explore Catalog</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <a href="#featured">
                <Button variant="secondary" size="lg">
                  Featured Drops
                </Button>
              </a>
            </div>
          </motion.div>

          {/* 3D Canvas Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex justify-center items-center relative"
          >
            {/* Background glowing gradients */}
            <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute w-[200px] h-[200px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
            
            <Canvas3D />
          </motion.div>

        </div>
      </section>

      {/* 2. FLOATING VALUE CARDS */}
      <section className="py-12 border-y border-white/5 bg-slate-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl glass flex gap-4 items-start">
              <div className="p-3 bg-purple-600/10 rounded-xl border border-purple-500/20 text-purple-400">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Hyper-Speed Shipping</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Enjoy express localized delivery on orders over $150. Insured premium packaging.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass flex gap-4 items-start">
              <div className="p-3 bg-purple-600/10 rounded-xl border border-purple-500/20 text-purple-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Fully Encrypted Checkout</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Your payments are processed through secure global gateways. Strict privacy standards.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass flex gap-4 items-start">
              <div className="p-3 bg-purple-600/10 rounded-xl border border-purple-500/20 text-purple-400">
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Flexible returns</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Return your assets or items within 30 days. Seamless return authorization framework.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS GRID */}
      <section id="featured" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-block text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                Handpicked selection
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight m-0">
                Featured Collections
              </h2>
            </div>
            <Link to="/catalog" className="text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2 group">
              <span>View Full Catalog</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl h-[400px] animate-pulse flex flex-col p-5">
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
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/30 rounded-2xl border border-white/5">
              <p className="text-sm text-gray-500">No products found in stock. Visit later!</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <Card product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
