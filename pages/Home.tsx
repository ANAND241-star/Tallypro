
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SERVICES, TESTIMONIALS, STATS, PROBLEM_SOLUTION, TDL_PRODUCTS } from '../constants';

const FAQ_ITEMS = [
  {
    q: 'What is a TDL and how does it benefit my business?',
    a: 'TDL (Tally Definition Language) is used to customize and extend Tally ERP. Our TDLs automate repetitive tasks like GST reconciliation, invoicing, and reporting — saving your team 20+ hours per month.'
  },
  {
    q: 'Do I need any technical knowledge to use your TDLs?',
    a: 'No! Our TDLs are plug-and-play. We provide full installation support and a step-by-step guide. Most clients are up and running within 30 minutes.'
  },
  {
    q: 'Which version of Tally is supported?',
    a: 'Our TDLs are compatible with Tally Prime (all versions) and Tally ERP 9. Just let us know your version during purchase and we will send the right build.'
  },
  {
    q: 'What kind of support do you provide after purchase?',
    a: 'We offer 6 months of free email and WhatsApp support for all TDL purchases. For businesses needing priority support, we offer Annual Maintenance Contracts (AMC).'
  },
  {
    q: 'Can you build a custom TDL for my specific business needs?',
    a: 'Absolutely! Custom TDL development is our core service. Share your requirements via WhatsApp or the contact form and we will provide a free quote within 24 hours.'
  },
  {
    q: 'Is online payment (Razorpay) secure?',
    a: 'Yes. All payments are processed through Razorpay, a PCI-DSS certified payment gateway. We never store your card details on our servers.'
  }
];


const Home: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              href="https://wa.me/919587742740"
              target="_blank" rel="noopener noreferrer"
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
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">✅ The AndurilTech Way (Automated)</h3>
            {PROBLEM_SOLUTION.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/10 shadow-sm dark:shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-slate-800 dark:text-white font-medium">{item.solution}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRODUCTS PREVIEW SECTION REMOVED */}

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

      {/* 9. FAQ SECTION */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-500 dark:text-slate-400">Everything you need to know before getting started.</p>
        </div>
        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, i) => (
            <div
              key={i}
              className="glass rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                <span className={`text-blue-500 text-2xl font-light transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-b from-blue-800 to-slate-900 p-12 md:p-20 text-center border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Upgrade Your Tally?</h2>
            <p className="text-blue-200 mb-8 text-lg">Join 250+ happy clients. Setup takes less than 30 minutes.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/products" className="px-10 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105">
                Browse TDL Products
              </Link>
              <a href="https://wa.me/919587742740" target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-transparent border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.831 3.013 1.27 4.673 1.271 5.233 0 9.492-4.258 9.495-9.493.002-2.537-.987-4.922-2.787-6.723s-4.187-2.79-6.723-2.791c-5.233 0-9.491 4.258-9.494 9.493-.001 2.133.569 4.212 1.648 6.007l.199.333-1.082 3.95 4.04-1.06z"/></svg>
                WhatsApp Enquiry
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to Top"
          className="fixed bottom-32 right-8 z-[99] w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 transition-all hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

    </div>
  );
};

export default Home;
