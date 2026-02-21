import { Category, TDLProduct, Service, Testimonial, Stat, ProblemSolution } from './types';

export const TDL_PRODUCTS: TDLProduct[] = [
  {
    id: '1',
    name: 'Auto-GST Reconciliation Pro',
    description: 'Slash compliance time by 90%. Auto-match GSTR-2B with Tally books instantly.',
    price: 4999,
    category: Category.GST,
    demoUrl: '#',
    imageUrl: 'https://picsum.photos/seed/gst1/400/300',
    features: ['1-Click 2B Matching', 'Smart Error Detection', 'Excel Export'],
    active: true
  },
  {
    id: '2',
    name: 'Dynamic Digital Signature',
    description: 'Legally compliant invoices with one click. No more printing and signing manually.',
    price: 2499,
    category: Category.SECURITY,
    demoUrl: '#',
    imageUrl: 'https://picsum.photos/seed/sig1/400/300',
    features: ['DSC Token Support', 'Custom Coordinates', 'Bulk Signing'],
    active: true
  },
  {
    id: '3',
    name: 'WhatsApp Automation Toolkit',
    description: 'Send invoices, ledgers, and reminders directly from Tally to client WhatsApp.',
    price: 3500,
    category: Category.AUTOMATION,
    demoUrl: '#',
    imageUrl: 'https://picsum.photos/seed/wa1/400/300',
    features: ['Auto-Payment Reminders', 'Bulk Messaging', 'PDF Attachments'],
    active: true
  },
  {
    id: '4',
    name: 'Smart Inventory Aging',
    description: 'Identify slow-moving stock and optimize cash flow with visual dashboards.',
    price: 1999,
    category: Category.INVENTORY,
    demoUrl: '#',
    imageUrl: 'https://picsum.photos/seed/inv1/400/300',
    features: ['Visual Aging Graphs', 'Expiry Alerts', 'Re-order Logic'],
    active: true
  }
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Custom TDL Development',
    description: 'Tailor-made Tally modules designed for your unique business logic.',
    icon: '⚡'
  },
  {
    id: 's2',
    title: 'GST & ITR Compliance',
    description: 'Expert filing services to keep your business 100% compliant and penalty-free.',
    icon: '🛡️'
  },
  {
    id: 's3',
    title: 'Tally Support & AMC',
    description: 'Priority technical support to ensure your accounting never stops.',
    icon: '🎧'
  },
  {
    id: 's4',
    title: 'Cloud Migration',
    description: 'Move your Tally data to the cloud for 24/7 access from anywhere.',
    icon: '☁️'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Rajesh Sharma',
    role: 'CA',
    location: 'Mumbai',
    content: 'The GST Reconciliation TDL saved our firm 20+ hours every month. It pays for itself in a day.',
    rating: 5
  },
  {
    id: 't2',
    name: 'Anjali Gupta',
    role: 'Director, Gupta Textiles',
    location: 'Surat',
    content: 'AndurilTech custom dashboard gives me insights I never had before. The WhatsApp tool is a game changer.',
    rating: 5
  },
  {
    id: 't3',
    name: 'Vikram Singh',
    role: 'Owner, TechDistro',
    location: 'Bangalore',
    content: 'Professional, fast, and accurate. The support team actually understands accounting, not just code.',
    rating: 5
  }
];

export const STATS: Stat[] = [
  { id: 'st1', label: 'TDL Installations', value: '100+', icon: '🚀' },
  { id: 'st2', label: 'Years Experience', value: '5+', icon: '⏳' },
  { id: 'st3', label: 'Data Accuracy', value: '99.9%', icon: '🎯' },
  { id: 'st4', label: 'Happy Clients', value: '250+', icon: '🤝' }
];

export const PROBLEM_SOLUTION: ProblemSolution[] = [
  {
    id: 'ps1',
    problem: 'Manual Data Entry Errors',
    solution: 'Automated Imports & Validation',
    icon: '📝'
  },
  {
    id: 'ps2',
    problem: 'Delayed Reporting',
    solution: 'Real-time Dashboards',
    icon: '⏱️'
  },
  {
    id: 'ps3',
    problem: 'Chasing Payments',
    solution: 'Auto-WhatsApp Reminders',
    icon: '💸'
  },
  {
    id: 'ps4',
    problem: 'Complex GST Filing',
    solution: '1-Click JSON Generation',
    icon: '🏛️'
  }
];