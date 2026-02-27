
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService as db } from '../services/mockDatabase';
import { openCheckout } from '../services/razorpayService';

const Cart: React.FC = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();
    const { user, isAuthenticated, refreshUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [purchasingId, setPurchasingId] = React.useState<string | null>(null);
    const [guestModal, setGuestModal] = React.useState<{ product: any } | null>(null);
    const [guestInfo, setGuestInfo] = React.useState({ email: '', phone: '', tallySerial: '' });
    const [successModal, setSuccessModal] = React.useState<{ product: any, passwordOptions?: { email: string, password: string } } | null>(null);
    const [feedbackModal, setFeedbackModal] = React.useState<{ name: string, email: string } | null>(null);
    const [feedbackForm, setFeedbackForm] = React.useState({ rating: 5, comment: '' });
    const [submittingFeedback, setSubmittingFeedback] = React.useState(false);

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isValidPhone = (phone: string) => /^[0-9]{10}$/.test(phone.trim());

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

    const handleBuyItem = async (productId: string, info?: { email: string, phone: string, tallySerial: string }) => {
        const cartItem = cartItems.find(i => i.product.id === productId);
        if (!cartItem) return;

        if (!isAuthenticated || !user) {
            if (!info) {
                setGuestModal({ product: cartItem.product });
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

            setPurchasingId(productId);
            setGuestModal(null);
            await openCheckout(
                cartItem.product,
                { id: info.email, name: info.email.split('@')[0], email: info.email, phoneNumber: info.phone } as any,
                async () => {
                    const newUser = await db.createGuestOrder(info.email, cartItem.product, { phoneNumber: info.phone, tallySerial: info.tallySerial });
                    removeFromCart(productId);
                    showToast(`Purchase successful! Receipt sent to ${info.email}`, 'success');
                    setGuestInfo({ email: '', phone: '', tallySerial: '' });
                    setPurchasingId(null);
                    setSuccessModal({
                        product: cartItem.product,
                        passwordOptions: newUser?.password ? { email: info.email, password: newUser.password } : undefined
                    });
                },
                (error) => {
                    showToast(error.description || 'Payment failed', 'error');
                    setPurchasingId(null);
                }
            );
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
                    setSuccessModal({ product: cartItem.product });
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
                                onClick={() => handleBuyItem(guestModal.product.id, guestInfo)}
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
            {/* Success Modal */}
            {successModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-fade-in-up">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✓</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Purchase Successful!</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Thank you for buying <span className="font-semibold text-blue-600">{successModal.product.name}</span>
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Your TDL is ready to download:</p>
                                <button
                                    onClick={() => {
                                        if (successModal.product.fileData && successModal.product.fileName) {
                                            const link = document.createElement('a');
                                            link.href = successModal.product.fileData;
                                            link.download = successModal.product.fileName;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            showToast(`Downloading ${successModal.product.fileName}...`, "success");
                                        } else {
                                            showToast(`Download started for ${successModal.product.name} (Demo Mock)`, "info");
                                        }
                                    }}
                                    className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-colors shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download Now
                                </button>
                            </div>

                            {successModal.passwordOptions && (
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2">Account Created</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">We've created an account so you can redownload this later.</p>
                                    <div className="bg-white dark:bg-black/20 rounded-lg p-3 font-mono text-sm border border-slate-200 dark:border-white/10">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-slate-500">Email:</span>
                                            <span className="text-slate-900 dark:text-white font-bold">{successModal.passwordOptions.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Password:</span>
                                            <span className="text-slate-900 dark:text-white font-bold">{successModal.passwordOptions.password}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Please save this password. You can change it in the dashboard later.</p>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    const email = successModal.passwordOptions?.email || user?.email || '';
                                    const name = email ? email.split('@')[0] : 'User';
                                    setSuccessModal(null);
                                    setFeedbackModal({ name, email });
                                }}
                                className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Continue
                            </button>
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

export default Cart;
