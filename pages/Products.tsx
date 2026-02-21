
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category, TDLProduct } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { dbService as db } from '../services/firebaseService';
import { openCheckout } from '../services/razorpayService';

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<TDLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [guestModal, setGuestModal] = useState<{ product: TDLProduct } | null>(null);
  const [guestEmail, setGuestEmail] = useState('');

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

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleBuyNow = async (product: TDLProduct, overrideEmail?: string) => {
    if (!isAuthenticated || !user) {
      if (!overrideEmail) {
        setGuestModal({ product });
        return;
      }
      if (!isValidEmail(overrideEmail)) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      setPurchasingId(product.id);
      setGuestModal(null);
      await openCheckout(
        product,
        { id: overrideEmail, name: overrideEmail.split('@')[0], email: overrideEmail } as any,
        async () => {
          await db.createGuestOrder(overrideEmail, product);
          showToast(`Purchase successful! Receipt sent to ${overrideEmail}`, 'success');
          setGuestEmail('');
          setPurchasingId(null);
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
          navigate('/dashboard');
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

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-dark transition-colors">
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          Premium TDL <span className="text-gradient">Marketplace</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Industrial-grade Tally extensions. Instant download. Expert support.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, category..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {['All', ...Object.values(Category)].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as any)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${selectedCategory === cat
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
              : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">No products found</p>
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
            return (
              <div key={p.id} className="glass-card rounded-2xl flex flex-col group h-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 overflow-hidden">
                <div className="h-48 relative overflow-hidden rounded-t-2xl">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60"></div>
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                    {p.category}
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed line-clamp-3">{p.description}</p>

                  <div className="space-y-3 mb-6">
                    {p.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center text-xs text-slate-500 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="block text-xs text-slate-400 line-through">₹{Math.floor(p.price * 1.3)}</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{p.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {p.youtubeUrl && (
                        <a
                          href={p.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Watch Demo"
                          className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-md shadow-red-500/30 whitespace-nowrap"
                        >
                          <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                          </svg>
                          Demo
                        </a>
                      )}

                      {!isOwned && (
                        <button
                          onClick={() => handleAddToCart(p)}
                          disabled={inCart}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${inCart
                            ? 'bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30 text-green-600 dark:text-green-400 cursor-default'
                            : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                        >
                          {inCart ? '✓ In Cart' : '🛒 Add to Cart'}
                        </button>
                      )}

                      <button
                        onClick={() => handleBuyNow(p)}
                        disabled={purchasingId === p.id}
                        className={`flex-1 px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${isOwned
                          ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20 w-full'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 disabled:opacity-70 disabled:cursor-wait'
                          }`}
                      >
                        {purchasingId === p.id ? 'Processing...' : (isOwned ? 'Owned ✓' : 'Buy Now')}
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
          <h3 className="text-2xl font-bold text-white mb-2">Need a Custom Solution?</h3>
          <p className="text-slate-300 max-w-lg">We can build bespoke TDL modules tailored exactly to your workflow requirements.</p>
        </div>
        <Link to="/contact" className="px-8 py-3 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap">
          Request Custom TDL
        </Link>
      </div>

      {/* Guest Email Modal */}
      {guestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Enter your Gmail</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Your purchase of <span className="font-semibold text-blue-600">{guestModal.product.name}</span> will be saved to this email
              </p>
            </div>

            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isValidEmail(guestEmail) && handleBuyNow(guestModal.product, guestEmail)}
              placeholder="yourname@gmail.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors mb-4"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setGuestModal(null); setGuestEmail(''); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => isValidEmail(guestEmail) && handleBuyNow(guestModal.product, guestEmail)}
                disabled={!isValidEmail(guestEmail)}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
              >
                Proceed to Pay ₹{guestModal.product.price.toLocaleString('en-IN')}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Already have an account?{' '}
              <button onClick={() => { setGuestModal(null); navigate('/login'); }} className="text-blue-500 hover:underline">Login here</button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
