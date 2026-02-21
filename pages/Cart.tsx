
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService as db } from '../services/firebaseService';
import { openCheckout } from '../services/razorpayService';

const Cart: React.FC = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();
    const { user, isAuthenticated, refreshUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [purchasingId, setPurchasingId] = React.useState<string | null>(null);

    const handleBuyItem = async (productId: string) => {
        const cartItem = cartItems.find(i => i.product.id === productId);
        if (!cartItem) return;

        if (!isAuthenticated || !user) {
            if (confirm("You need to login to purchase. Go to login?")) {
                navigate('/login');
            }
            return;
        }

        if (user.purchasedProducts?.includes(productId)) {
            showToast("You already own this product!", "info");
            navigate('/dashboard');
            return;
        }

        setPurchasingId(productId);
        await openCheckout(
            cartItem.product,
            user,
            async (paymentId) => {
                const updatedUser = await db.createOrder(user.id, cartItem.product);
                if (updatedUser) {
                    await refreshUser();
                    removeFromCart(productId);
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

    if (cartItems.length === 0) {
        return (
            <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center text-center">
                <div className="text-8xl mb-6">🛒</div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Your Cart is Empty</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                    Browse our premium TDL products and add them to your cart to purchase.
                </p>
                <Link
                    to="/products"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Your Cart</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-400 font-semibold transition-colors border border-red-200 dark:border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                    Clear Cart
                </button>
            </div>

            <div className="space-y-4 mb-10">
                {cartItems.map(({ product }) => {
                    const isOwned = user?.purchasedProducts?.includes(product.id);
                    return (
                        <div
                            key={product.id}
                            className="glass-card bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                        >
                            {/* Product Image */}
                            <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Info */}
                            <div className="flex-grow">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                        {product.category}
                                    </span>
                                    {isOwned && (
                                        <span className="text-[10px] font-bold uppercase bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                                            Already Owned
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{product.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{product.description}</p>
                            </div>

                            {/* Price & Actions */}
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                    ₹{product.price.toLocaleString('en-IN')}
                                </span>
                                <div className="flex gap-2">
                                    {product.youtubeUrl && (
                                        <a
                                            href={product.youtubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors border border-red-200 dark:border-red-500/20 text-xs font-bold flex items-center gap-1"
                                        >
                                            ▶ Demo
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleBuyItem(product.id)}
                                        disabled={purchasingId === product.id || !!isOwned}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isOwned
                                                ? 'bg-green-600 text-white cursor-not-allowed opacity-70'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-wait'
                                            }`}
                                    >
                                        {purchasingId === product.id ? 'Processing...' : isOwned ? 'Owned ✓' : 'Buy Now'}
                                    </button>
                                    <button
                                        onClick={() => removeFromCart(product.id)}
                                        className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors text-xs font-bold border border-slate-200 dark:border-white/10"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Order Summary */}
            <div className="glass-card bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 max-w-sm ml-auto">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3 mb-5">
                    {cartItems.map(({ product }) => (
                        <div key={product.id} className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                            <span className="truncate max-w-[200px]">{product.name}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200 ml-4">₹{product.price.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-slate-200 dark:border-white/10 pt-4 flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white text-lg">Total</span>
                    <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-slate-400 mt-3">Purchase each item individually using the Buy Now buttons above.</p>
            </div>
        </div>
    );
};

export default Cart;
