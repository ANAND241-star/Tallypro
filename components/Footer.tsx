
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#05080F] border-t border-slate-200 dark:border-white/5 pt-20 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white">T</div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tally<span className="text-blue-500">Pro</span></span>
            </div>

            <div className="flex space-x-4">
              {['twitter', 'linkedin', 'instagram'].map(icon => (
                <div key={icon} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-blue-100 dark:hover:bg-blue-600/20 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  <span className="capitalize text-xs">{icon[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 text-lg">Platform</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400">
              <li><Link to="/products" className="hover:text-blue-500 transition-colors">TDL Store</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Consultation</Link></li>
              <li><Link to="/" className="hover:text-blue-500 transition-colors">Free Tools</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 text-lg">Contact</h4>
            <ul className="space-y-4 text-slate-500 dark:text-slate-400">
              <li className="flex items-center space-x-3">
                <span className="text-blue-500">📧</span>
                <span>info.g.rservies@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-blue-500">📞</span>
                <span>+91 95877 42740</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-blue-500">📍</span>
                <span>Didwana Kuchaman, Rajasthan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} AndurilTech.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Terms of Service</span>
            <Link to="/admin-login" className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
