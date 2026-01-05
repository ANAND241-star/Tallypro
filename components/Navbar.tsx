
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleDashboardClick = () => {
    if (user?.role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-slate-200 dark:border-white/5 py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                T
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Tally<span className="text-blue-500">Pro</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium transition-all hover:text-blue-600 dark:hover:text-white ${isActive(link.path) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleDashboardClick}
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-500"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium text-sm transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/signup"
                  className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition-all"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-slate-200 dark:border-white/10 animate-fade-in absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-4 rounded-md text-base font-medium border-b border-slate-200 dark:border-white/5 ${isActive(link.path) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { setIsOpen(false); handleDashboardClick(); }}
                  className="block w-full text-left px-3 py-4 text-slate-600 dark:text-slate-300 font-medium"
                >
                  My Dashboard
                </button>
                <button
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="block w-full text-left px-3 py-4 text-red-500 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center text-slate-600 dark:text-slate-300 font-medium py-2"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-bold"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
