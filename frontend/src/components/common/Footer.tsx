import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-white/5 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Brand details */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <Layers className="text-purple-500" size={22} />
              <span className="font-extrabold text-lg uppercase tracking-wider font-mono">
                Antigravity<span className="text-purple-500">.</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              Leading the next-generation e-commerce experience with interactive 3D WebGL graphics and modern design systems.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2.5 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white hover:border-purple-500/30 transition-all">
                <Twitter size={14} />
              </a>
              <a href="#" className="p-2.5 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white hover:border-purple-500/30 transition-all">
                <Instagram size={14} />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white hover:border-purple-500/30 transition-all">
                <Github size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-5">Shop Categories</h4>
            <ul className="space-y-3 text-xs text-gray-500">
              <li>
                <Link to="/catalog" className="hover:text-purple-400 transition-colors">Wearables & Gadgets</Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-purple-400 transition-colors">Audio Equipment</Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-purple-400 transition-colors">Smart Living</Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-purple-400 transition-colors">Digital Assets</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal/Support */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-5">Resources</h4>
            <ul className="space-y-3 text-xs text-gray-500">
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">Customer Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition-colors">3D Engine License</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-5">Stay Connected</h4>
            <p className="text-xs text-gray-500 leading-normal">
              Subscribe to unlock early drops, product updates, and interactive design releases.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="flex-grow px-4 py-2.5 rounded-lg bg-slate-900 border border-white/5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Separator / Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-600">
          <span>&copy; {new Date().getFullYear()} Antigravity Store Corp. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-400 transition-colors">Security Details</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
