
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#05080F] border-t border-slate-200 dark:border-white/5 pt-20 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center group w-fit">
              <img
                src="/logo.png"
                alt="AndurilTech — Tally Add-ons & Automation"
                className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="items-center space-x-2 hidden">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">A</div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Anduril<span className="text-blue-500">Tech</span></span>
              </div>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              India's trusted Tally TDL developer & accounting automation partner. Helping MSMEs save time, reduce errors and grow faster since 2019.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/919587742740"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-green-100 dark:hover:bg-green-600/20 flex items-center justify-center transition-all border border-slate-200 dark:border-white/10 text-slate-500 hover:text-green-600 dark:hover:text-green-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.831 3.013 1.27 4.673 1.271 5.233 0 9.492-4.258 9.495-9.493.002-2.537-.987-4.922-2.787-6.723s-4.187-2.79-6.723-2.791c-5.233 0-9.491 4.258-9.494 9.493-.001 2.133.569 4.212 1.648 6.007l.199.333-1.082 3.95 4.04-1.06z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-blue-100 dark:hover:bg-blue-600/20 flex items-center justify-center transition-all border border-slate-200 dark:border-white/10 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-pink-100 dark:hover:bg-pink-600/20 flex items-center justify-center transition-all border border-slate-200 dark:border-white/10 text-slate-500 hover:text-pink-500 dark:hover:text-pink-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com/@tallytechservices?si=vRONp_N-RXNZ9rUC"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube — TallyTech Services"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-red-100 dark:hover:bg-red-600/20 flex items-center justify-center transition-all border border-slate-200 dark:border-white/10 text-slate-500 hover:text-red-600 dark:hover:text-red-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Certified Tally Developer · GST Expert
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-slate-500 dark:text-slate-400 text-sm">
              <li><Link to="/" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span>→</span> Home</Link></li>
              <li><Link to="/products" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span>→</span> TDL Products</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span>→</span> Contact Us</Link></li>
              <li><Link to="/login" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span>→</span> Customer Login</Link></li>
              <li><Link to="/signup" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span>→</span> Create Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
                <span className="text-blue-500 mt-0.5">📧</span>
                <a href="mailto:info.g.rservies@gmail.com" className="hover:text-blue-500 transition-colors break-all">info.g.rservies@gmail.com</a>
              </li>
              <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
                <span className="text-green-500 mt-0.5">📞</span>
                <a href="tel:+919587742740" className="hover:text-blue-500 transition-colors">+91 95877 42740</a>
              </li>
              <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
                <span className="text-blue-500 mt-0.5">📍</span>
                <span>Ladnun, Didwana Kuchaman,<br />Rajasthan, India</span>
              </li>
              <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
                <span className="text-yellow-500 mt-0.5">🕐</span>
                <span>Mon – Sat: 9AM – 7PM IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">
          <p>© {new Date().getFullYear()} <span className="font-semibold text-slate-700 dark:text-slate-300">AndurilTech</span>. All rights reserved. Made with ❤️ in Rajasthan, India.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <Link to="/admin-login" className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
