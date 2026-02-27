
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category, TDLProduct } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { dbService as db } from '../services/mockDatabase';
import { openCheckout } from '../services/razorpayService';

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<TDLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [guestModal, setGuestModal] = useState<{ product: TDLProduct } | null>(null);
  const [guestInfo, setGuestInfo] = useState({ email: '', phone: '', tallySerial: '' });
  const [youtubeModal, setYoutubeModal] = useState<{ url: string; name: string } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ name: string, email: string } | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const { user, isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await db.getProducts();
      setProducts(data.filter(p => p.active));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Clear localStorage so products reload fresh with new categories
  useEffect(() => {
    // Only clear if the stored products still have old categories
    const stored = localStorage.getItem('tallypro_products');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const hasOldCategory = parsed.some((p: any) => p.category === 'GST' || p.category === 'Automation' || p.category === 'Inventory');
        if (hasOldCategory) {
          localStorage.removeItem('tallypro_products');
          window.location.reload();
        }
      } catch { }
    }
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPhone = (phone: string) => /^[0-9]{10}$/.test(phone.trim());

  const handleBuyNow = async (product: TDLProduct, info?: { email: string, phone: string, tallySerial: string }) => {
    if (!isAuthenticated || !user) {
      if (!info) {
        setGuestModal({ product });
        return;
      }
      if (!isValidEmail(info.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      if (!isValidPhone(info.phone)) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
      }
      setPurchasingId(product.id);
      setGuestModal(null);
      await openCheckout(
        product,
        { id: info.email, name: info.email.split('@')[0], email: info.email, phoneNumber: info.phone } as any,
        async () => {
          await db.createGuestOrder(info.email, product, { phoneNumber: info.phone, tallySerial: info.tallySerial });
          showToast(`Purchase successful! Receipt sent to ${info.email}`, 'success');
          setGuestInfo({ email: '', phone: '', tallySerial: '' });
          setPurchasingId(null);
          setFeedbackModal({ name: info.email.split('@')[0], email: info.email });
        },
        (error) => {
          showToast(error.description || 'Payment failed', 'error');
          setPurchasingId(null);
        }
      );
      return;
    }

    if (user.purchasedProducts?.includes(product.id)) {
      showToast('You already own this product!', 'info');
      navigate('/dashboard');
      return;
    }

    setPurchasingId(product.id);
    await openCheckout(
      product,
      user,
      async (paymentId) => {
        const updatedUser = await db.createOrder(user.id, product);
        if (updatedUser) {
          await refreshUser();
          showToast(`Purchase Successful! Ref: ${paymentId}`, 'success');
          setFeedbackModal({ name: user.name, email: user.email });
        } else {
          showToast('Payment success but order creation failed. Contact support.', 'error');
        }
        setPurchasingId(null);
      },
      (error) => {
        console.error('Payment failed', error);
        showToast(error.description || 'Payment failed', 'error');
        setPurchasingId(null);
      }
    );
  };

  const handleAddToCart = (product: TDLProduct) => {
    addToCart(product);
    showToast(`"${product.name}" added to cart!`, 'success');
  };

  const submitFeedback = async () => {
    if (!feedbackModal) return;
    setSubmittingFeedback(true);
    await db.createFeedback(feedbackModal.name, feedbackModal.email, feedbackForm.rating, feedbackForm.comment);
    setSubmittingFeedback(false);
    setFeedbackModal(null);
    setFeedbackForm({ rating: 5, comment: '' });
    showToast('Thank you for your feedback!', 'success');
    if (isAuthenticated) navigate('/dashboard');
  };

  const skipFeedback = () => {
    setFeedbackModal(null);
    setFeedbackForm({ rating: 5, comment: '' });
    if (isAuthenticated) navigate('/dashboard');
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : '';
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-dark transition-colors">

      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider uppercase mb-4">
          Tally Addons Store
        </span>
        <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          Premium <span className="text-gradient">Tally Addons</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Industrial-grade Tally extensions. Instant download. Expert support included.
        </p>
      </div>

      {/* Search + Category Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto mb-12">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Tally Addons..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Category Dropdown — table-format like the image */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
            className="appearance-none w-full sm:w-64 px-5 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-medium focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer pr-10"
          >
            <option value="All">Select Category</option>
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Active Filter Badge */}
      {selectedCategory !== 'All' && (
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-semibold">
            <span>📂 {selectedCategory}</span>
            <button onClick={() => setSelectedCategory('All')} className="ml-1 text-blue-400 hover:text-blue-700 dark:hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 text-sm animate-pulse">Loading Tally Addons...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">No addons found</p>
          <p className="text-slate-400 mt-2">Try a different search or category</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => {
            const isOwned = user?.purchasedProducts?.includes(p.id);
            const inCart = isInCart(p.id);
            const hasYoutube = !!p.youtubeUrl;

            return (
              <div key={p.id} className="glass-card rounded-2xl flex flex-col group h-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 overflow-hidden hover:border-blue-500/30 transition-all hover:-translate-y-1">

                {/* Product Image */}
                <div className="h-48 relative overflow-hidden rounded-t-2xl">
                  <img
                    src={p.imageUrl || 'https://picsum.photos/seed/' + p.id + '/400/300'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/' + p.id + '/400/300'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60"></div>
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                    {p.category}
                  </div>
                  {/* Owned Badge */}
                  {isOwned && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      ✓ Owned
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {p.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">{p.description}</p>

                  {/* Features */}
                  <div className="space-y-2 mb-5">
                    {p.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* Price + Buttons */}
                  <div className="mt-auto pt-5 border-t border-slate-100 dark:border-white/5">
                    {/* Price Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="block text-xs text-slate-400 line-through">₹{Math.floor(p.price * 1.3).toLocaleString('en-IN')}</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{p.price.toLocaleString('en-IN')}</span>
                      </div>
                      {p.licenseType && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
                          {p.licenseType}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {/* YouTube Demo Button */}
                      {hasYoutube && (
                        <button
                          onClick={() => setYoutubeModal({ url: p.youtubeUrl!, name: p.name })}
                          title="Watch Demo Video"
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-all shadow-md shadow-red-500/30 whitespace-nowrap"
                        >
                          <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                          </svg>
                          Demo
                        </button>
                      )}

                      {/* Add to Cart */}
                      {!isOwned && (
                        <button
                          onClick={() => handleAddToCart(p)}
                          disabled={inCart}
                          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border ${inCart
                            ? 'bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30 text-green-600 dark:text-green-400 cursor-default'
                            : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                        >
                          {inCart ? '✓ In Cart' : '🛒 Cart'}
                        </button>
                      )}

                      {/* Buy Now */}
                      <button
                        onClick={() => handleBuyNow(p)}
                        disabled={purchasingId === p.id}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${isOwned
                          ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20 w-full'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 disabled:opacity-70 disabled:cursor-wait'
                          }`}
                      >
                        {purchasingId === p.id ? 'Processing...' : (isOwned ? '📥 Download' : 'Buy Now')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Request Banner */}
      <div className="mt-20 p-8 md:p-12 glass rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold text-white mb-2">Need a Custom Tally Addon?</h3>
          <p className="text-slate-300 max-w-lg">We build bespoke Tally addons tailored exactly to your business workflow. Free quote within 24 hours.</p>
        </div>
        <a
          href="https://wa.me/919587742740"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-8 py-3 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap shadow-lg"
        >
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.831 3.013 1.27 4.673 1.271 5.233 0 9.492-4.258 9.495-9.493.002-2.537-.987-4.922-2.787-6.723s-4.187-2.79-6.723-2.791c-5.233 0-9.491 4.258-9.494 9.493-.001 2.133.569 4.212 1.648 6.007l.199.333-1.082 3.95 4.04-1.06z" />
          </svg>
          Request Custom Addon
        </a>
      </div>

      {/* Direct Purchase Modal */}
      {guestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 118 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Direct Purchase</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Buying <span className="font-semibold text-blue-600">{guestModal.product.name}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gmail / Email *</label>
                <input
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  placeholder="yourname@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tally Serial Number (Optional)</label>
                <input
                  type="text"
                  value={guestInfo.tallySerial}
                  onChange={(e) => setGuestInfo({ ...guestInfo, tallySerial: e.target.value })}
                  placeholder="e.g. 712345678"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setGuestModal(null); setGuestInfo({ email: '', phone: '', tallySerial: '' }); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBuyNow(guestModal.product, guestInfo)}
                disabled={!isValidEmail(guestInfo.email) || !isValidPhone(guestInfo.phone)}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
              >
                Pay ₹{guestModal.product.price.toLocaleString('en-IN')}
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">
              Instant delivery to your email after payment.
            </p>
          </div>
        </div>
      )}

      {/* YouTube Demo Modal */}
      {youtubeModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setYoutubeModal(null)}
        >
          <div
            className="w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{youtubeModal.name}</p>
                  <p className="text-slate-400 text-xs">Demo Video — How to Use this Addon</p>
                </div>
              </div>
              <button onClick={() => setYoutubeModal(null)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Embedded Video */}
            <div className="relative pt-[56.25%] bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getYoutubeEmbedUrl(youtubeModal.url)}
                title={`Demo: ${youtubeModal.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-slate-400 text-sm">Watch how this Tally Addon works before you buy.</p>
              <a href={youtubeModal.url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1">
                Open on YouTube →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">How was your experience?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Your feedback helps us improve our Tally Addons
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Rate your experience</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className={`text-3xl transition-transform hover:scale-110 ${feedbackForm.rating >= star ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Any comments? (Optional)</label>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  placeholder="Tell us what you liked or how we can improve..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={skipFeedback}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={submittingFeedback}
                  className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-40 disabled:cursor-wait shadow-lg shadow-blue-500/25"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
