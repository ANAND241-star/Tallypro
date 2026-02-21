
import { TDL_PRODUCTS } from '../constants';
import { User, TDLProduct, Order, Ticket } from '../types';

// Initial Data Seeds
const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Rajesh Kumar', email: 'user@tallypro.in', password: 'password123', role: 'customer', status: 'active', purchasedProducts: ['1'], joinedAt: '2023-11-15' },
  { id: 'u2', name: 'Amit Patel', email: 'amit@business.com', password: 'password123', role: 'customer', status: 'active', purchasedProducts: [], joinedAt: '2024-01-10' },
  { id: 'admin_1', name: 'Super Admin', email: 'anandjatt689@gmail.com', password: 'Admin@123', role: 'super_admin', status: 'active', purchasedProducts: [], joinedAt: '2023-01-01' }
];

const INITIAL_ORDERS: Order[] = [
  { id: 'ord_1', userId: 'u1', userName: 'Rajesh Kumar', productId: '1', productName: 'Auto-GST Reconciliation Pro', amount: 4999, status: 'success', date: '2023-11-15' },
];

const INITIAL_TICKETS: Ticket[] = [
  { id: 'tkt_1', userId: 'u1', subject: 'Installation issue with GST TDL', status: 'open', priority: 'high', createdAt: '2024-05-20' },
];

const NETWORK_DELAY = 600; // ms to simulate cloud latency

class CloudDatabaseService {
  users: User[];
  products: TDLProduct[];
  orders: Order[];
  tickets: Ticket[];

  constructor() {
    this.users = this.load('users', INITIAL_USERS);
    this.products = this.load('products', TDL_PRODUCTS.map(p => ({ ...p, active: true })));
    this.orders = this.load('orders', INITIAL_ORDERS);
    this.tickets = this.load('tickets', INITIAL_TICKETS);

    // Always ensure admin user exists with correct credentials (overrides stale localStorage)
    const ADMIN_EMAIL = 'anandjatt689@gmail.com';
    const ADMIN_PASSWORD = 'Admin@123';
    const adminIndex = this.users.findIndex(u => u.email === ADMIN_EMAIL);
    if (adminIndex >= 0) {
      this.users[adminIndex] = { ...this.users[adminIndex], password: ADMIN_PASSWORD, role: 'super_admin', status: 'active' };
    } else {
      this.users.push({ id: 'admin_1', name: 'Super Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'super_admin', status: 'active', purchasedProducts: [], joinedAt: '2023-01-01' });
    }
    this.save('users', this.users);
  }

  private load<T>(key: string, defaultData: T): T {
    const stored = localStorage.getItem(`tallypro_${key}`);
    return stored ? JSON.parse(stored) : defaultData;
  }

  private save(key: string, data: any) {
    localStorage.setItem(`tallypro_${key}`, JSON.stringify(data));
  }

  private async wait<T>(data: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), NETWORK_DELAY));
  }

  // --- Products ---
  async getProducts(): Promise<TDLProduct[]> {
    return this.wait(this.products);
  }

  async addProduct(product: TDLProduct): Promise<TDLProduct> {
    this.products = [product, ...this.products];
    this.save('products', this.products);
    return this.wait(product);
  }

  async updateProduct(id: string, updates: Partial<TDLProduct>): Promise<void> {
    this.products = this.products.map(p => p.id === id ? { ...p, ...updates } : p);
    this.save('products', this.products);
    return this.wait(undefined);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.updateProduct(id, { active: false });
  }

  // --- Users ---
  async getUsers(): Promise<User[]> {
    return this.wait(this.users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return this.wait(user);
  }

  async verifyCredentials(email: string, password?: string): Promise<User | null> {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    await this.wait(null); // Simulate delay

    if (!user) return null;
    if (user.password && user.password !== password) return null;

    return user;
  }

  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) return this.wait(false);

    this.users[userIndex] = { ...this.users[userIndex], password: newPassword };
    this.save('users', this.users);
    return this.wait(true);
  }

  async updateUserProfile(userId: string, updates: { name: string }): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return this.wait(null);

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.save('users', this.users);
    return this.wait(this.users[userIndex]);
  }

  async addUser(user: User): Promise<User> {
    this.users.push(user);
    this.save('users', this.users);
    return this.wait(user);
  }

  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
    this.users = this.users.map(u => u.id === id ? { ...u, status } : u);
    this.save('users', this.users);
    return this.wait(undefined);
  }

  // --- Purchases & Orders ---
  async createOrder(userId: string, product: TDLProduct): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return this.wait(null);

    const newOrder: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      userId: userId,
      userName: this.users[userIndex].name,
      productId: product.id,
      productName: product.name,
      amount: product.price,
      status: 'success',
      date: new Date().toISOString()
    };
    this.orders = [newOrder, ...this.orders];
    this.save('orders', this.orders);

    const currentUser = this.users[userIndex];
    if (!currentUser.purchasedProducts?.includes(product.id)) {
      const updatedUser = {
        ...currentUser,
        purchasedProducts: [...(currentUser.purchasedProducts || []), product.id]
      };
      this.users[userIndex] = updatedUser;
      this.save('users', this.users);
      return this.wait(updatedUser);
    }
    return this.wait(currentUser);
  }

  async getRevenue(): Promise<number> {
    const revenue = this.orders.reduce((sum, ord) => ord.status === 'success' ? sum + ord.amount : sum, 0);
    return this.wait(revenue);
  }

  async getOrders(): Promise<Order[]> {
    return this.wait(this.orders);
  }

  // --- Tickets ---
  async getTickets(): Promise<Ticket[]> {
    return this.wait(this.tickets);
  }

  async createTicket(userId: string, subject: string, priority: 'low' | 'medium' | 'high'): Promise<Ticket> {
    const newTicket: Ticket = {
      id: 'tkt_' + Math.random().toString(36).substr(2, 9),
      userId,
      subject,
      status: 'open',
      priority,
      createdAt: new Date().toISOString()
    };
    this.tickets = [newTicket, ...this.tickets];
    this.save('tickets', this.tickets);
    return this.wait(newTicket);
  }

  async updateTicketStatus(ticketId: string, status: 'open' | 'closed' | 'in_progress'): Promise<void> {
    this.tickets = this.tickets.map(t => t.id === ticketId ? { ...t, status } : t);
    this.save('tickets', this.tickets);
    return this.wait(undefined);
  }
}

export const db = new CloudDatabaseService();
