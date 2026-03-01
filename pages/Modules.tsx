import React, { useState, useEffect } from 'react';
import { dbService as db } from '../services/firebaseService';
import { Category, TallyModule } from '../types';

const Modules: React.FC = () => {
    const [modules, setModules] = useState<TallyModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);

        const unsubscribe = db.subscribeModules((data) => {
            setModules(data.filter(m => m.active));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredModules = modules.filter(module => {
        const matchesCategory = activeCategory === 'All' || module.category === activeCategory;
        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch = !searchLower ||
            (module.name || '').toLowerCase().includes(searchLower) ||
            (module.description || '').toLowerCase().includes(searchLower);
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="pt-24 pb-20 min-h-screen">
            {/* Header Section */}
            <section className="px-4 py-12 md:py-20 max-w-7xl mx-auto text-center animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                    Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Tally Modules</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10">
                    Discover powerful modules designed to extend the capabilities of your Tally software. Enhance productivity, simplify reporting, and automate your workflows.
                </p>
            </section>

            {/* Filters and Search */}
            <section className="px-4 pb-12 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 glass-card p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/10 sticky top-24 z-30">

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 scrollbar-hide items-center">
                        <button
                            onClick={() => setActiveCategory('All')}
                            className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-300 border ${activeCategory === 'All'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30 transform scale-105'
                                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md'
                                }`}
                        >
                            <span>All Modules</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs transition-colors duration-300 ${activeCategory === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-300'}`}>
                                {modules.length}
                            </span>
                        </button>
                        {Object.values(Category).map(category => {
                            const count = modules.filter(m => m.category === category).length;
                            if (count === 0) return null; // Only show categories that have modules

                            return (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-300 border ${activeCategory === category
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30 transform scale-105'
                                        : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md'
                                        }`}
                                >
                                    <span>{category}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs transition-colors duration-300 ${activeCategory === category ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-300'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-[400px] group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Find your perfect module..."
                            className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300 focus:outline-none focus:text-red-500"
                                title="Clear search"
                                aria-label="Clear search"
                            >
                                <div className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full p-1 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Modules Grid */}
            <section className="px-4 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-r-4 border-indigo-500 animate-spin-slow"></div>
                        </div>
                    </div>
                ) : filteredModules.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No modules found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or category filter.</p>
                        <button
                            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                            className="mt-6 px-6 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredModules.map((module, index) => (
                            <div
                                key={module.id}
                                className="group glass-card bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 transform hover:-translate-y-2 flex flex-col"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Image Container */}
                                <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <img
                                        src={module.imageUrl}
                                        alt={module.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(module.name)}&background=random&color=fff&size=512`;
                                        }}
                                    />
                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                        <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full shadow-lg">
                                            {module.category}
                                        </span>
                                        <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full shadow-lg">
                                            {module.version}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {module.name}
                                        </h3>
                                    </div>

                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3">
                                        {module.description}
                                    </p>

                                    {/* Features */}
                                    <div className="mb-6 space-y-2">
                                        {module.features.slice(0, 3).map((feature, i) => (
                                            <div key={i} className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="truncate">{feature}</span>
                                            </div>
                                        ))}
                                        {module.features.length > 3 && (
                                            <p className="text-xs text-blue-500 font-bold ml-6">+ {module.features.length - 3} more features</p>
                                        )}
                                    </div>

                                    {/* Footer - Price & Action */}
                                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Price</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                                ₹{module.price.toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">{module.licenseType}</p>
                                        </div>

                                        <a
                                            href={`/modules/${module.id}`}
                                            className="px-6 py-3 bg-slate-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-500 text-white dark:text-slate-900 hover:text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
                                        >
                                            View Details
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Modules;
