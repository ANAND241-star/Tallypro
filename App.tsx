
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const WhatsAppButton: React.FC = () => (
  <a
    href="https://wa.me/919587742740"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform animate-bounce"
    title="Chat on WhatsApp"
  >
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.831 3.013 1.27 4.673 1.271 5.233 0 9.492-4.258 9.495-9.493.002-2.537-.987-4.922-2.787-6.723s-4.187-2.79-6.723-2.791c-5.233 0-9.491 4.258-9.494 9.493-.001 2.133.569 4.212 1.648 6.007l.199.333-1.082 3.95 4.04-1.06z" />
    </svg>
  </a>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <ScrollToTop />
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <WhatsAppButton />
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
