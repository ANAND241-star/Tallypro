
import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 dark:bg-dark transition-colors min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Info Column */}
        <div className="animate-fade-in-up">
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">Let's <span className="text-gradient">Connect</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 leading-relaxed">
            Have a question about a TDL? Or need professional accounting services? 
            Our experts are ready to help you streamline your operations.
          </p>

          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl flex items-center gap-6 border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-colors bg-white dark:bg-white/5">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-2xl">📍</div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-1">Our Office</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Level 4, Cyber City, Gurgaon, India</p>
              </div>
            </div>
            
            <div className="glass p-6 rounded-2xl flex items-center gap-6 border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-colors bg-white dark:bg-white/5">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-2xl">📞</div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-1">Call Us</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm">+91 98765 43210 (Mon-Sat)</p>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl flex items-center gap-6 border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-colors bg-white dark:bg-white/5">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-2xl">📧</div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold mb-1">Email</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm">sales@tallypro.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="glass p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-white/10 relative bg-white dark:bg-white/5 shadow-xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none"></div>
          
          {submitted ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl text-green-500">✓</div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Message Sent!</h2>
              <p className="text-slate-500 dark:text-slate-400">We'll get back to you shortly.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-blue-500 hover:text-blue-600 font-bold text-sm"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send a Message</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                  <input 
                    required type="text" 
                    className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="John Doe"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <input 
                    required type="email" 
                    className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="john@company.com"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                <input 
                  required type="tel" 
                  className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="+91..."
                  value={formState.phone}
                  onChange={(e) => setFormState({...formState, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                <textarea 
                  required rows={4}
                  className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="How can we help?"
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-1"
              >
                Send Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
