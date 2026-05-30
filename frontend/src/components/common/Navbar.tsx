import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Layers } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const { toggleCart } = useUIStore();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/70 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group text-white">
          <Layers className="text-purple-500 group-hover:rotate-12 transition-transform duration-300" size={24} />
          <span className="font-extrabold text-lg uppercase tracking-wider font-mono">
            Antigravity<span className="text-purple-500">.</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-purple-400 ${
              isActive('/') ? 'text-purple-500' : 'text-gray-300'
            }`}
          >
            Home
          </Link>
          <Link
            to="/catalog"
            className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-purple-400 ${
              isActive('/catalog') ? 'text-purple-500' : 'text-gray-300'
            }`}
          >
            Shop
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-purple-400 ${
                isActive('/dashboard') ? 'text-purple-500' : 'text-gray-300'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Utility / Right actions */}
        <div className="hidden md:flex items-center gap-5">
          {/* Cart Icon Trigger */}
          <button
            onClick={toggleCart}
            className="relative p-2.5 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-purple-600 border-2 border-slate-950 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Authentication Actions */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-white/5 bg-slate-900/40 hover:bg-slate-900 transition-colors text-sm text-gray-300 hover:text-white cursor-pointer select-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500 bg-purple-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="font-semibold line-clamp-1 max-w-[100px]">{user?.name}</span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-3 w-48 rounded-xl bg-slate-950 border border-white/5 backdrop-blur-xl shadow-2xl p-2 z-20 space-y-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <UserIcon size={16} />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer text-left"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2.5 text-xs font-bold uppercase border border-white/10 rounded-xl bg-white/5 text-white hover:bg-white hover:text-black hover:border-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={toggleCart}
            className="relative p-2 rounded-lg border border-white/5 bg-slate-900/50 text-gray-300 hover:text-white cursor-pointer"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-white/5 bg-slate-900/50 text-gray-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-white/5 p-4 flex flex-col gap-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold uppercase ${
              isActive('/') ? 'bg-purple-900/20 text-purple-400' : 'text-gray-300'
            }`}
          >
            Home
          </Link>
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold uppercase ${
              isActive('/catalog') ? 'bg-purple-900/20 text-purple-400' : 'text-gray-300'
            }`}
          >
            Shop
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold uppercase ${
                  isActive('/dashboard') ? 'bg-purple-900/20 text-purple-400' : 'text-gray-300'
                }`}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold uppercase text-red-400 hover:bg-red-950/20 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 text-center py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
