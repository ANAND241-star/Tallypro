
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category, TDLProduct } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService as db } from '../services/firebaseService';

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [products, setProducts] = useState<TDLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const { user, isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useToast();
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

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleBuyNow = async (product: TDLProduct) => {
    if (!isAuthenticated || !user) {
      if (confirm("You need to login to purchase. Go to login?")) {
        navigate('/login');
      }
      return;
    }

    // Check if already owned
    const currentUser = await db.getUserByEmail(user.email);
    if (currentUser?.purchasedProducts?.includes(product.id)) {
      showToast("You already own this product!", "info");
      navigate('/dashboard');
      return;
    }

    // Simulate Payment Process
    const confirmed = confirm(`Confirm purchase of ${product.name} for ₹${product.price}?`);
    if (confirmed) {
      setPurchasingId(product.id);
      const updatedUser = await db.createOrder(user.id, product);
      if (updatedUser) {
        await refreshUser();
        showToast("Purchase Successful! Download available in Dashboard.", "success");
        navigate('/dashboard');
      } else {
        showToast("Purchase failed. Please contact support.", "error");
      }
      setPurchasingId(null);
    }
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => {
            const isOwned = user?.purchasedProducts?.includes(p.id);
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
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{p.description}</p>

                  <div className="space-y-3 mb-6">
                    {p.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center text-xs text-slate-500 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {f}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="block text-xs text-slate-400 line-through">₹{Math.floor(p.price * 1.3)}</span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white transition-colors border border-slate-200 dark:border-white/10">
                        <span className="sr-only">Demo</span>
                        📺
                      </button>
                      <button
                        onClick={() => handleBuyNow(p)}
                        disabled={purchasingId === p.id}
                        className={`px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${isOwned
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 disabled:opacity-70 disabled:cursor-wait'
                          }`}
                      >
                        {purchasingId === p.id ? 'Processing...' : (isOwned ? 'Owned ✓' : 'Buy Now')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
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
    </div>
  );
};

export default Products;
