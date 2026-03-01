import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService as db } from '../services/firebaseService';
import { TallyModule } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ModuleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [module, setModule] = useState<TallyModule | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedModules, setRelatedModules] = useState<TallyModule[]>([]);

    const { addToCart, cart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        // Scroll to top when loading new module
        window.scrollTo(0, 0);

        const fetchModule = async () => {
            setLoading(true);
            try {
                if (!id) return;

                // Use the subscription to get the specific module
                const unsubscribe = db.subscribeModules((modules) => {
                    const foundModule = modules.find(m => m.id === id);
                    if (foundModule) {
                        setModule(foundModule);

                        // Find related modules (same category, excluding current)
                        const related = modules
                            .filter(m => m.id !== id && m.category === foundModule.category && m.active)
                            .slice(0, 3);
                        setRelatedModules(related);
                    } else {
                        // Module not found
                        setModule(null);
                    }
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error fetching module:", error);
                setLoading(false);
            }
        };

        fetchModule();
    }, [id]);

    const handleAddToCart = () => {
        if (!module) return;

        addToCart(module);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex justify-center items-center">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-4 border-indigo-500 animate-spin-slow"></div>
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen pt-24 pb-20 flex flex-col justify-center items-center text-center px-4">
                <div className="text-8xl mb-6">🏜️</div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Module Not Found</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                    The module you are looking for doesn't exist or has been removed.
                </p>
                <button
                    onClick={() => navigate('/modules')}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                >
                    Browse All Modules
                </button>
            </div>
        );
    }

    const isInCart = cart.some(item => item.id === module.id);

    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumbs */}
                <nav className="flex mb-8 text-sm animate-fade-in-up" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <button onClick={() => navigate('/')} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white transition-colors">
                                Home
                            </button>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                <button onClick={() => navigate('/modules')} className="ml-1 md:ml-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white transition-colors">
                                    Modules
                                </button>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                <span className="ml-1 md:ml-2 text-slate-800 dark:text-slate-200 font-medium truncate max-w-[150px] md:max-w-xs">{module.name}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

                    {/* Left Column - Image & Actions */}
                    <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        {/* Image Container */}
                        <div className="glass-card p-2 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 mix-blend-overlay z-10 rounded-2xl"></div>
                            <img
                                src={module.imageUrl}
                                alt={module.name}
                                className="w-full h-auto aspect-video object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(module.name)}&background=random&color=fff&size=1024`;
                                }}
                            />

                            {module.youtubeUrl && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <a
                                        href={module.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-20 h-20 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-110 hover:bg-red-600 transition-all backdrop-blur-sm group/btn"
                                    >
                                        <svg className="w-8 h-8 ml-2 transform group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm-2 14.5v-9l7 4.5-7 4.5z" />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Buy / Add to Cart Actions */}
                        <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total investment</p>
                                    <p className="text-5xl font-black text-slate-900 dark:text-white">
                                        ₹{module.price.toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 font-bold rounded-lg text-sm mb-2">
                                        Lifetime Access
                                    </span>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">One-time payment</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleBuyNow}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-xl transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-1 flex justify-center items-center gap-2 group"
                                >
                                    <span>Buy Module Now</span>
                                    <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={isInCart}
                                    className={`w-full py-4 font-bold text-lg rounded-xl transition-all border-2 flex justify-center items-center gap-2 ${isInCart
                                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                        : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:border-blue-500 dark:hover:border-blue-500'
                                        }`}
                                >
                                    {isInCart ? (
                                        <>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Added to Cart
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Guarantees */}
                            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Free Updates</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-sm rounded-full">
                                    {module.category}
                                </span>
                                <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-full">
                                    Version {module.version}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                                {module.name}
                            </h1>

                            <div className="prose prose-lg dark:prose-invert text-slate-600 dark:text-slate-400">
                                <p>{module.description}</p>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Key Features Included
                            </h3>
                            <ul className="space-y-4">
                                {module.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mt-0.5">
                                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="ml-4 text-slate-700 dark:text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Technical Details Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                                <p className="text-sm font-bold text-slate-500 uppercase mb-2">License Type</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    {module.licenseType}
                                </p>
                            </div>
                            <div className="glass-card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                                <p className="text-sm font-bold text-slate-500 uppercase mb-2">Delivery Method</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    Instant Download
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Modules section (if any) */}
                {relatedModules.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-white/10 pt-16 mt-16 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Similar Modules You Might Like</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedModules.map((relatedModule) => (
                                <div
                                    key={relatedModule.id}
                                    className="group glass-card bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                                    onClick={() => navigate(`/modules/${relatedModule.id}`)}
                                >
                                    <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={relatedModule.imageUrl}
                                            alt={relatedModule.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(relatedModule.name)}&background=random&color=fff&size=512`;
                                            }}
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors">
                                            {relatedModule.name}
                                        </h3>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-lg font-black text-slate-900 dark:text-white">₹{relatedModule.price.toLocaleString('en-IN')}</span>
                                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">View Details →</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ModuleDetails;
