
import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../constants';

const Services: React.FC = () => {
  const AMC_PLANS = [
    {
      name: 'Silver',
      price: '₹9,999',
      duration: '/year',
      features: ['Remote Support (Mon-Fri)', 'Tally Updates Installation', 'Data Backup Configuration', '2 Custom TDL Tweaks'],
      recommended: false
    },
    {
      name: 'Gold',
      price: '₹19,999',
      duration: '/year',
      features: ['Priority Support (24/7)', 'Unlimited TDL Minor Tweaks', 'Monthly Health Check', 'Cloud Tally Setup', 'GST Return Filing Support'],
      recommended: true
    },
    {
      name: 'Platinum',
      price: 'Custom',
      duration: '',
      features: ['Dedicated Account Manager', 'On-site Visits', 'Complex ERP Integration', 'Staff Training Sessions', 'Audit Assistance'],
      recommended: false
    }
  ];

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-dark transition-colors">
      {/* Header */}
      <div className="text-center mb-20 animate-fade-in-up">
        <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          Professional <span className="text-gradient">Accounting Services</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Beyond software, we provide the human expertise to keep your financial operations running smoothly.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-24">
        {SERVICES.map((service, idx) => (
          <div key={service.id} className="glass-card p-8 rounded-2xl flex gap-6 items-start border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 group hover:border-blue-500/30 transition-all">
            <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
              {service.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{service.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {service.description} We follow a strict protocol to ensure data integrity and compliance with the latest Indian accounting standards.
              </p>
              <Link to="/contact" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-2">
                Enquire Now <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Process Section */}
      <section className="mb-24">
        <div className="glass p-10 rounded-3xl border border-slate-200 dark:border-white/5 bg-gradient-to-br from-slate-100 to-white dark:from-white/5 dark:to-transparent">
           <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">How Custom TDL Development Works</h2>
                 <div className="space-y-8">
                    <div className="flex gap-4">
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                       <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Requirement Analysis</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">We study your current workflow and identify automation gaps.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                       <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Development & Testing</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Our certified developers code the module and test it in a sandbox environment.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                       <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Deployment & Training</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">We install the TDL on your system and train your staff on how to use it.</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="flex-1 relative">
                 <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 rounded-full"></div>
                 <div className="relative glass-card p-8 rounded-2xl bg-slate-900 text-white border border-white/10">
                    <pre className="font-mono text-xs text-green-400 leading-relaxed">
{`[#Field: VCH Narration]
   Add: Right Button: MyCustomButton

[Button: MyCustomButton]
   Title: "Auto-Fill GST"
   Key: Ctrl+Alt+G
   Action: Call: AutoCalculateGST`}
                    </pre>
                    <div className="mt-4 pt-4 border-t border-white/10 text-center text-slate-400 text-sm">
                       Sample TDL Code Snippet
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Annual Maintenance Plans (AMC)</h2>
        <div className="grid md:grid-cols-3 gap-8">
           {AMC_PLANS.map((plan) => (
             <div key={plan.name} className={`relative p-8 rounded-2xl border ${plan.recommended ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-xl shadow-blue-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'}`}>
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                   <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                   <span className="text-slate-500 dark:text-slate-400">{plan.duration}</span>
                </div>
                <ul className="space-y-4 mb-8">
                   {plan.features.map((feat, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span className="text-green-500">✓</span>
                        {feat}
                     </li>
                   ))}
                </ul>
                <Link 
                  to="/contact" 
                  className={`block text-center py-3 rounded-xl font-bold transition-all ${
                    plan.recommended 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                    : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'
                  }`}
                >
                  Choose {plan.name}
                </Link>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default Services;
