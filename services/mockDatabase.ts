
import { TDL_PRODUCTS } from '../constants';
import { User, TDLProduct, Order, Ticket, Feedback } from '../types';

// Initial Data Seeds
const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Rajesh Kumar', email: 'user@tallypro.in', password: 'password123', role: 'customer', status: 'active', purchasedProducts: ['1'], joinedAt: '2023-11-15' },
  { id: 'u2', name: 'Amit Patel', email: 'amit@business.com', password: 'password123', role: 'customer', status: 'active', purchasedProducts: [], joinedAt: '2024-01-10' },
  { id: 'admin_1', name: 'Super Admin', email: 'anandjatt689@gmail.com', password: 'Admin@123', role: 'super_admin', status: 'active', purchasedProducts: [], joinedAt: '2023-01-01' },
  { id: 'admin_2', name: 'Admin', email: 'pjat95105@gmail.com', password: 'pawan900@#', role: 'admin', status: 'active', purchasedProducts: [], joinedAt: '2023-01-01' },
];

const INITIAL_ORDERS: Order[] = [
  { id: 'ord_1', userId: 'u1', userName: 'Rajesh Kumar', productId: '1', productName: 'Auto-GST Reconciliation Pro', amount: 4999, status: 'success', date: '2023-11-15' },
];

const INITIAL_TICKETS: Ticket[] = [
  { id: 'tkt_1', userId: 'u1', subject: 'Installation issue with GST TDL', status: 'open', priority: 'high', createdAt: '2024-05-20' },
];

const NETWORK_DELAY = 400; // ms to simulate cloud latency

class CloudDatabaseService {
  users: User[];
  products: TDLProduct[];
  orders: Order[];
  tickets: Ticket[];
  feedbacks: Feedback[];

  constructor() {
    this.users = this.load('users', INITIAL_USERS);
    this.products = this.load('products', TDL_PRODUCTS.map(p => ({ ...p, active: true })));
    this.orders = this.load('orders', INITIAL_ORDERS);
    this.tickets = this.load('tickets', INITIAL_TICKETS);
    this.feedbacks = this.load('feedbacks', []);

    // Always ensure admin users exist with correct credentials
    const admins = [
      { id: 'admin_1', name: 'Super Admin', email: 'anandjatt689@gmail.com', password: 'Admin@123', role: 'super_admin' as const },
      { id: 'admin_2', name: 'Admin', email: 'pjat95105@gmail.com', password: 'pawan900@#', role: 'admin' as const },
    ];
    admins.forEach(admin => {
      const idx = this.users.findIndex(u => u.email === admin.email);
      if (idx >= 0) {
        this.users[idx] = { ...this.users[idx], password: admin.password, role: admin.role, status: 'active' };
      } else {
        this.users.push({ ...admin, status: 'active', purchasedProducts: [], joinedAt: '2023-01-01' });
      }
    });
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
  
  subscribeProducts(callback: (products: TDLProduct[]) => void): () => void {
    callback(this.products);
    return () => {};
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

  // --- Users & Auth ---
  async getUsers(): Promise<User[]> {
    return this.wait(this.users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return this.wait(user);
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return this.wait(user || null);
  }

  // Main login — matches firebaseService interface
  async login(email: string, password: string): Promise<User | null> {
    const user = this.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    await this.wait(null);
    if (!user) return null;
    return user;
  }

  async logout(): Promise<void> {
    return this.wait(undefined);
  }

  // Signup — matches firebaseService interface  
  async signup(user: User, password: string): Promise<User> {
    const id = 'usr_' + Date.now().toString(36);
    const newUser: User = {
      ...user,
      id,
      password,
      role: 'customer',
      status: 'active',
      joinedAt: new Date().toISOString(),
      purchasedProducts: []
    };
    this.users.push(newUser);
    this.save('users', this.users);
    return this.wait(newUser);
  }

  async verifyCredentials(email: string, password?: string): Promise<User | null> {
    return this.login(email, password || '');
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
  async createOrder(userId: string, product: TDLProduct, details?: { phoneNumber?: string, tallySerial?: string }): Promise<User | null> {
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
      date: new Date().toISOString(),
      phoneNumber: details?.phoneNumber,
      tallySerial: details?.tallySerial
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

  // Guest purchase — no login needed
  async createGuestOrder(email: string, product: TDLProduct, details?: { phoneNumber?: string, tallySerial?: string }): Promise<User | null> {
    let user = await this.getUserByEmail(email);
    let generatedPassword = '';

    if (!user) {
      // Auto-generate a password for the new guest user
      generatedPassword = Math.random().toString(36).slice(-8) + 'T@1';

      const guestUser: User = {
        id: 'guest_' + Date.now().toString(36),
        name: email.split('@')[0],
        email,
        password: generatedPassword,
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString(),
        purchasedProducts: [],
        phoneNumber: details?.phoneNumber,
        tallySerial: details?.tallySerial
      };
      this.users.push(guestUser);
      this.save('users', this.users);
      user = guestUser;
    }

    const orderId = 'ord_' + Date.now().toString(36);
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      userName: user.name,
      productId: product.id,
      productName: product.name,
      amount: product.price,
      status: 'success',
      date: new Date().toISOString(),
      phoneNumber: details?.phoneNumber,
      tallySerial: details?.tallySerial
    };
    this.orders = [newOrder, ...this.orders];
    this.save('orders', this.orders);

    const alreadyOwned = user.purchasedProducts?.includes(product.id);
    let returnedUser = user;
    if (!alreadyOwned) {
      const updatedProducts = [...(user.purchasedProducts || []), product.id];
      const userIndex = this.users.findIndex(u => u.id === user!.id);
      this.users[userIndex] = { ...user, purchasedProducts: updatedProducts };
      this.save('users', this.users);
      returnedUser = { ...user, purchasedProducts: updatedProducts };
    }

    // Attach the generated password to the returned user object (temporarily) so the UI can display it
    if (generatedPassword) {
      returnedUser = { ...returnedUser, password: generatedPassword };
    }

    return this.wait(returnedUser);
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
  
  subscribeTickets(callback: (tickets: Ticket[]) => void): () => void {
    callback(this.tickets);
    return () => {};
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

  // --- Feedbacks ---
  async getFeedbacks(): Promise<Feedback[]> {
    return this.wait(this.feedbacks);
  }
  
  subscribeFeedbacks(callback: (feedbacks: Feedback[]) => void): () => void {
    callback(this.feedbacks);
    return () => {};
  }

  async createFeedback(userName: string, userEmail: string, rating: number, comment: string): Promise<Feedback> {
    const newFeedback: Feedback = {
      id: 'fb_' + Math.random().toString(36).substr(2, 9),
      userName,
      userEmail,
      rating,
      comment,
      date: new Date().toISOString()
    };
    this.feedbacks = [newFeedback, ...this.feedbacks];
    this.save('feedbacks', this.feedbacks);
    return this.wait(newFeedback);
  }

  // Stub for file upload compatibility
  async uploadFile(file: File, path: string, onProgress?: (progress: number) => void): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress((e.loaded / e.total) * 100);
      };
      reader.onloadend = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}

export const db = new CloudDatabaseService();
// Also export as dbService to match firebaseService naming used in some files
export const dbService = db;
