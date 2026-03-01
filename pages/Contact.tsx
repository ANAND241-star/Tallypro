import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const WHATSAPP_NUMBER = '919587742740';
const CONTACT_EMAIL = 'anandjatt689@gmail.com';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Build WhatsApp message
    const waText = encodeURIComponent(
      `🔔 *New Enquiry from AndurilTech Website*\n\n` +
      `👤 *Name:* ${formState.name}\n` +
      `📧 *Email:* ${formState.email}\n` +
      `📞 *Phone:* ${formState.phone}\n\n` +
      `💬 *Message:*\n${formState.message}`
    );

    // Build Email mailto link
    const mailSubject = encodeURIComponent(`Website Enquiry from ${formState.name}`);
    const mailBody = encodeURIComponent(
      `Name: ${formState.name}\nEmail: ${formState.email}\nPhone: ${formState.phone}\n\nMessage:\n${formState.message}`
    );

    // Open WhatsApp first
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, '_blank');

    // Open Email after a short delay
    setTimeout(() => {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;
    }, 800);

    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormState({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 dark:bg-dark transition-colors min-h-screen">
      <Helmet>
        <title>Contact Us - Tally TDL Support | AndurilTech</title>
        <meta name="description" content="Contact AndurilTech for custom Tally TDL requirements, support, or general inquiries." />
        <link rel="canonical" href="https://www.anduriltech.in/contact" />
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

        {/* Info Column */}
        <div className="animate-fade-in-up">
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Contact Tally <span className="text-gradient">Experts</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 leading-relaxed">
            Have a question about a Tally Addon? Or need a custom solution?
            Reach us directly on WhatsApp or email — we reply within 1 hour!
          </p>

          <div className="space-y-4">
            {/* Address */}
            <div className="glass p-6 rounded-2xl flex items-center gap-5 border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-colors bg-white dark:bg-white/5">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-2xl flex-shrink-0">📍</div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-1">Our Office</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Ladnun, Didwana Kuchaman, Rajasthan</p>
              </div>
            </div>

            {/* Phone — Clickable */}
            <a
              href="tel:+919587742740"
              className="glass p-6 rounded-2xl flex items-center gap-5 border border-slate-200 dark:border-white/5 hover:border-green-500/40 transition-all bg-white dark:bg-white/5 group block"
            >
              <div className="w-12 h-12 bg-green-500/10 group-hover:bg-green-500/20 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-colors">📞</div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-1">Call / WhatsApp</h4>
                <p className="text-green-600 dark:text-green-400 text-sm font-semibold">+91 95877 42740</p>
                <p className="text-slate-400 text-xs mt-0.5">Mon–Sat, 9am–7pm IST</p>
              </div>
            </a>

            {/* Email — Clickable */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="glass p-6 rounded-2xl flex items-center gap-5 border border-slate-200 dark:border-white/5 hover:border-purple-500/40 transition-all bg-white dark:bg-white/5 group block"
            >
              <div className="w-12 h-12 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-full flex items-center justify-center text-2xl flex-shrink-0 transition-colors">📧</div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-1">Email Us</h4>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-semibold">{CONTACT_EMAIL}</p>
                <p className="text-slate-400 text-xs mt-0.5">We reply within 1–2 hours</p>
              </div>
            </a>

            {/* WhatsApp Quick Button */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello! I want to know more about your Tally Addons.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-6 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-600/30 group"
            >
              <svg className="w-6 h-6 fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.831 3.013 1.27 4.673 1.271 5.233 0 9.492-4.258 9.495-9.493.002-2.537-.987-4.922-2.787-6.723s-4.187-2.79-6.723-2.791c-5.233 0-9.491 4.258-9.494 9.493-.001 2.133.569 4.212 1.648 6.007l.199.333-1.082 3.95 4.04-1.06z" />
              </svg>
              <div className="text-left">
                <span className="block text-sm font-bold">Chat on WhatsApp</span>
                <span className="block text-xs text-green-200">Instant reply guaranteed!</span>
              </div>
              <svg className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Form Column */}
        <div className="glass p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-white/10 relative bg-white dark:bg-white/5 shadow-xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none"></div>

          {submitted ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl animate-bounce">
                ✅
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Message Sent!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                Your message was sent to <span className="font-semibold text-green-600">WhatsApp</span> &amp; <span className="font-semibold text-blue-600">Email</span>.
              </p>
              <p className="text-slate-400 text-sm mb-8">We'll respond within 1 hour on WhatsApp!</p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/30"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.831 3.013 1.27 4.673 1.271 5.233 0 9.492-4.258 9.495-9.493.002-2.537-.987-4.922-2.787-6.723s-4.187-2.79-6.723-2.791c-5.233 0-9.491 4.258-9.494 9.493-.001 2.133.569 4.212 1.648 6.007l.199.333-1.082 3.95 4.04-1.06z" />
                  </svg>
                  Open WhatsApp
                </a>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Send Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Send a Message</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Message will be sent directly to WhatsApp &amp; Email
                </p>
              </div>

              {/* WhatsApp + Email delivery indicators */}
              <div className="flex gap-3 mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-500/20">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.831 3.013 1.27 4.673 1.271 5.233 0 9.492-4.258 9.495-9.493.002-2.537-.987-4.922-2.787-6.723s-4.187-2.79-6.723-2.791c-5.233 0-9.491 4.258-9.494 9.493-.001 2.133.569 4.212 1.648 6.007l.199.333-1.082 3.95 4.04-1.06z" /></svg>
                  WhatsApp: +91 95877 42740
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20">
                  ✉️ {CONTACT_EMAIL}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name *</label>
                  <input
                    required type="text"
                    className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="Rajesh Kumar"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email *</label>
                  <input
                    required type="email"
                    className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="you@gmail.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                <input
                  required type="tel"
                  className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  placeholder="+91 98765 43210"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Message *</label>
                <textarea
                  required rows={4}
                  className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                  placeholder="Hi! I need help with GST reconciliation addon for my business..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-70 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                {sending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82l.303.18c1.397.831 3.013 1.27 4.673 1.271 5.233 0 9.492-4.258 9.495-9.493.002-2.537-.987-4.922-2.787-6.723s-4.187-2.79-6.723-2.791c-5.233 0-9.491 4.258-9.494 9.493-.001 2.133.569 4.212 1.648 6.007l.199.333-1.082 3.95 4.04-1.06z" />
                    </svg>
                    Send via WhatsApp &amp; Email
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                🔒 Your details are private. We never share your information.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
