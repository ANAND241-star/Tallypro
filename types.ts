
export enum Category {
  GST = 'GST',
  REPORTS = 'Reports',
  AUTOMATION = 'Automation',
  INVENTORY = 'Inventory',
  SECURITY = 'Security'
}

export type LicenseType = 'Single User' | 'Multi User' | 'Lifetime';

export interface TDLProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  demoUrl: string;
  imageUrl: string;
  features: string[];
  active: boolean; // For soft delete/hiding
  
  // File Management
  version?: string;
  licenseType?: LicenseType;
  fileName?: string;
  fileData?: string; // Base64 encoded file content
  fileSize?: string;
  demoFileName?: string;
  demoFileData?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location?: string;
  content: string;
  rating: number;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface ProblemSolution {
  id: string;
  problem: string;
  solution: string;
  icon: string;
}

export type UserRole = 'customer' | 'admin' | 'super_admin' | 'support_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  purchasedProducts?: string[]; // IDs of products
  joinedAt: string;
  password?: string; // Added for auth logic
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  amount: number;
  status: 'success' | 'pending' | 'refunded';
  date: string;
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: 'open' | 'closed' | 'in_progress';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}
