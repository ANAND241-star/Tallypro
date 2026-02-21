
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
  const [products, setProducts] = useState<TDLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

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

    if (user.purchasedProducts?.includes(product.id)) {
      showToast("You already own this product!", "info");
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
          showToast(`Purchase Successful! Ref: ${paymentId}`, "success");
          navigate('/dashboard');
        } else {
          showToast("Payment success but order creation failed. Contact support.", "error");
        }
        setPurchasingId(null);
      },
      (error) => {
        console.error("Payment failed", error);
        showToast(error.description || "Payment failed", "error");
        setPurchasingId(null);
      }
    );
  };

  const handleAddToCart = (product: TDLProduct) => {
    addToCart(product);
    showToast(`"${product.name}" added to cart!`, "success");
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
            const inCart = isInCart(p.id);
            return (
              <div key={p.id} className="glass-card rounded-2xl flex flex-col group h-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 overflow-hidden">
                {/* Product Image */}
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
                    {/* Price Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="block text-xs text-slate-400 line-through">₹{Math.floor(p.price * 1.3)}</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{p.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Action Buttons Row: Demo | Add to Cart | Buy Now */}
                    <div className="flex gap-2">
                      {/* YouTube Demo Button */}
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

                      {/* Add to Cart Button */}
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

                      {/* Buy Now Button */}
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
    </div>
  );
};

export default Products;
