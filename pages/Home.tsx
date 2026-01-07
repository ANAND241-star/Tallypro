
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVICES, TESTIMONIALS, STATS, PROBLEM_SOLUTION, TDL_PRODUCTS } from '../constants';


const Home: React.FC = () => {


  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-dark text-slate-900 dark:text-white transition-colors duration-300">

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        <div className="animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider uppercase mb-6">
            #1 Tally Automation Partner
          </span>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
            Build Powerful TDLs.<br />
            <span className="text-gradient">Automate Tally.</span> Grow Faster.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Stop wasting time on manual data entry. We provide high-performance TDL solutions and expert accounting services tailored for modern Indian businesses.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Link
              to="/products"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1"
            >
              Explore TDLs
            </Link>
            <a
              href="https://wa.me/919876543210"
              className="px-8 py-4 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl font-bold text-lg backdrop-blur-sm transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <span>Talk to Expert</span>
              <span className="text-green-500">●</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="py-12 border-y border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.id} className="text-center group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROBLEM / SOLUTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Why Businesses Choose Us</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We bridge the gap between complex accounting requirements and simple, automated workflows.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-6">🚫 The Old Way (Manual)</h3>
            {PROBLEM_SOLUTION.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                <span className="text-slate-500 line-through decoration-red-500/50">{item.problem}</span>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">✅ The TallyPro Way (Automated)</h3>
            {PROBLEM_SOLUTION.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/10 shadow-sm dark:shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-slate-800 dark:text-white font-medium">{item.solution}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRODUCTS PREVIEW */}
      <section className="py-24 bg-slate-100 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Best-Selling TDLs</h2>
              <p className="text-slate-500 dark:text-slate-400">Plug-and-play modules to supercharge Tally.</p>
            </div>
            <Link to="/products" className="hidden md:inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold">
              View All Products <span className="ml-2">→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TDL_PRODUCTS.slice(0, 3).map((product) => (
              <div key={product.id} className="glass-card rounded-2xl p-6 flex flex-col h-full group relative overflow-hidden bg-white dark:bg-white/5">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/5 dark:bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 transition-all"></div>

                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center text-2xl mb-6">
                  ⚡
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">{product.description}</p>

                <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between z-10">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">₹{product.price}</span>
                  <Link to="/products" className="text-sm bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 px-4 py-2 rounded-lg text-slate-700 dark:text-white font-medium transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SERVICES SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">More Than Just Code</h2>
          <p className="text-slate-500 dark:text-slate-400">Comprehensive services for complete financial peace of mind.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <div key={service.id} className="glass p-8 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{service.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PERSONAL BRAND */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          {/* Image Removed */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">"I don’t just build TDLs. I build systems that save time and money."</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              With 5+ years of experience in Tally customization and accounting, I understand the unique challenges of Indian MSMEs. My goal is to make your accounting invisible and automatic.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <span className="px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-blue-600 dark:text-blue-300">Certified Tally Developer</span>
              <span className="px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-cyan-600 dark:text-cyan-300">GST Expert</span>
            </div>
          </div>
        </div>
      </section>



      {/* 8. TESTIMONIALS */}
      <section className="py-24 overflow-hidden">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white mb-12">Trusted by Accountants & Owners</h2>
        <div className="flex flex-wrap justify-center gap-6 px-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="w-full md:w-96 glass-card p-8 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <div className="flex text-yellow-500 mb-4">★★★★★</div>
              <p className="text-slate-600 dark:text-slate-300 mb-6 italic">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold text-sm">{t.name}</h4>
                  <p className="text-slate-500 text-xs">{t.role}, {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-b from-blue-800 to-slate-900 p-12 md:p-20 text-center border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Upgrade Your TDL?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/products" className="px-10 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105">
                Get Started
              </Link>
              <a href="https://wa.me/919876543210" className="px-10 py-4 bg-transparent border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                WhatsApp Enquiry
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
