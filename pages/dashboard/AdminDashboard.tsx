
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dbService as db } from '../../services/firebaseService';
import { Category, TDLProduct, LicenseType, User, Order, Ticket } from '../../types';

// Icons
const Icons = {
  Analytics: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Products: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Orders: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Tickets: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
};

type TabType = 'analytics' | 'users' | 'products' | 'orders' | 'tickets' | 'settings';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('analytics');

  // Async Data State
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<TDLProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [revenue, setRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<TDLProduct>>({
    category: Category.GST,
    version: '1.0',
    licenseType: 'Single User'
  });
  const [loadingFile, setLoadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [demoFile, setDemoFile] = useState<File | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [u, p, o, t, r] = await Promise.all([
          db.getUsers(),
          db.getProducts(),
          db.getOrders(),
          db.getTickets(),
          db.getRevenue()
        ]);
        setUsers(u);
        setProducts(p.filter(prod => prod.active));
        setOrders(o);
        setTickets(t);
        setRevenue(r);
      } catch (error) {
        console.error("Fetching dashboard data failed", error);
        showToast("Failed to load admin data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // Helper to read file to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'main' | 'demo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size too large. Maximum 10MB allowed.", "error");
      e.target.value = '';
      return;
    }

    setLoadingFile(true);

    // Store raw file for upload
    if (field === 'main') {
      setMainFile(file);
      setNewProduct(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB'
      }));
    } else {
      setDemoFile(file);
      setNewProduct(prev => ({
        ...prev,
        demoFileName: file.name,
      }));
    }

    setLoadingFile(false);
    showToast("File selected ready for upload", "success");
  };

  const handleEditProduct = (product: TDLProduct) => {
    setEditingId(product.id);
    setNewProduct({ ...product });
    setShowProductForm(true);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price) {
      setLoadingFile(true);
      try {
        let mainFileUrl = newProduct.fileData; // Keep existing if not changed
        let demoFileUrl = newProduct.demoFileData;

        // Upload Main File if new one selected
        if (mainFile) {
          const path = `products/${Date.now()}_${mainFile.name}`;
          mainFileUrl = await db.uploadFile(mainFile, path, (p) => setUploadProgress(p));
        }

        // Upload Demo File if new one selected
        if (demoFile) {
          const path = `demos/${Date.now()}_${demoFile.name}`;
          demoFileUrl = await db.uploadFile(demoFile, path, (p) => setUploadProgress(p));
        }

        const productData = {
          ...newProduct,
          fileData: mainFileUrl,
          demoFileData: demoFileUrl,
          // Ensure we don't accidentally save base64 if it was ever there, though we removed that logic
        };

        if (editingId) {
          // UPDATE Existing
          await db.updateProduct(editingId, productData);
          showToast("Product updated successfully!", "success");
        } else {
          // CREATE New
          await db.addProduct({
            id: Math.random().toString(36).substr(2, 9),
            name: newProduct.name!,
            description: newProduct.description || '',
            price: Number(newProduct.price),
            category: newProduct.category || Category.GST,
            demoUrl: '#',
            imageUrl: newProduct.imageUrl || 'https://picsum.photos/seed/' + Math.random() + '/400/300',
            features: newProduct.features || ['Feature 1', 'Feature 2'],
            active: true,
            version: newProduct.version || '1.0',
            licenseType: newProduct.licenseType || 'Single User',
            fileName: newProduct.fileName || 'External Link',
            fileData: mainFileUrl,
            fileSize: newProduct.fileSize || 'N/A',
            demoFileName: newProduct.demoFileName,
            demoFileData: demoFileUrl
          });
          showToast("Product created successfully!", "success");
        }

        // Refresh Data
        const updatedProducts = await db.getProducts();
        setProducts(updatedProducts.filter(p => p.active));

        // Reset Form
        handleCancelForm();
      } catch (error) {
        console.error("Error saving product:", error);
        showToast("Failed to save product. Check console.", "error");
      } finally {
        setLoadingFile(false);
      }
    }
  };

  const handleCancelForm = () => {
    setShowProductForm(false);
    setEditingId(null);
    setNewProduct({ category: Category.GST, version: '1.0', licenseType: 'Single User' });
    setMainFile(null);
    setDemoFile(null);
    setUploadProgress(0);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this TDL?')) {
      await db.deleteProduct(id);
      const updatedProducts = await db.getProducts();
      setProducts(updatedProducts.filter(p => p.active));
      showToast("Product deleted", "info");
    }
  };

  const handleUserStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await db.updateUserStatus(id, newStatus);
    const updatedUsers = await db.getUsers();
    setUsers(updatedUsers);
    showToast(`User marked as ${newStatus}`, "info");
  };

  const handleTicketStatus = async (id: string, current: string) => {
    const newStatus = current === 'open' ? 'closed' : 'open';
    await db.updateTicketStatus(id, newStatus as any);
    const updatedTickets = await db.getTickets();
    setTickets(updatedTickets);
    showToast(`Ticket status updated to ${newStatus}`, "info");
  };

  const SidebarItem = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === id
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
        }`}
    >
      <Icon />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 fixed h-full pt-4 pb-20 px-4 border-r border-slate-200 dark:border-white/5 hidden md:block">
        <div className="space-y-2">
          <SidebarItem id="analytics" label="Overview" icon={Icons.Analytics} />
          <SidebarItem id="users" label="Users" icon={Icons.Users} />
          <SidebarItem id="products" label="TDL Products" icon={Icons.Products} />
          <SidebarItem id="orders" label="Orders" icon={Icons.Orders} />
          <SidebarItem id="tickets" label="Support" icon={Icons.Tickets} />
        </div>

        <div className="absolute bottom-24 left-4 right-4 p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Logged in as</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 overflow-y-auto min-h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeTab.replace('_', ' ')}</h1>
            <p className="text-slate-500 text-sm">Real-time Data</p>
          </div>
          <div className="flex gap-2">
            <button className="md:hidden p-2 bg-slate-200 dark:bg-white/10 rounded-lg">Menu</button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass-card p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <p className="text-slate-500 text-xs font-bold uppercase">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">₹{revenue.toLocaleString()}</h3>
                    <span className="text-green-500 text-xs">+15% this month</span>
                  </div>
                  <div className="glass-card p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <p className="text-slate-500 text-xs font-bold uppercase">Total Users</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{users.length}</h3>
                    <span className="text-blue-500 text-xs">Active Database</span>
                  </div>
                  <div className="glass-card p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <p className="text-slate-500 text-xs font-bold uppercase">Orders</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{orders.length}</h3>
                    <span className="text-slate-400 text-xs">Completed</span>
                  </div>
                  <div className="glass-card p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <p className="text-slate-500 text-xs font-bold uppercase">Open Tickets</p>
                    <h3 className="text-3xl font-bold text-orange-500 mt-2">{tickets.filter(t => t.status === 'open').length}</h3>
                    <span className="text-orange-400 text-xs">Action Required</span>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-8 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                      <thead className="text-xs uppercase bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="px-6 py-3">Order ID</th>
                          <th className="px-6 py-3">Customer</th>
                          <th className="px-6 py-3">Product</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                            <td className="px-6 py-4 font-mono">{order.id}</td>
                            <td className="px-6 py-4">{order.userName}</td>
                            <td className="px-6 py-4">{order.productName}</td>
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">₹{order.amount}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 uppercase">{order.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (showProductForm) handleCancelForm();
                      else setShowProductForm(true);
                    }}
                    className={`px-6 py-2 rounded-lg font-bold shadow-lg transition-all ${showProductForm ? 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'}`}
                  >
                    {showProductForm ? 'Cancel' : '+ Upload New TDL'}
                  </button>
                </div>

                {showProductForm && (
                  <div className="glass-card p-8 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                      {editingId ? 'Edit Product' : 'Create New Product'}
                    </h3>
                    <form onSubmit={handleSaveProduct} className="space-y-6 max-w-2xl">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">TDL Name</label>
                          <input
                            type="text" placeholder="e.g. GST Auto Report" required
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                            value={newProduct.name || ''} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Version</label>
                          <input
                            type="text" placeholder="e.g. v1.0" required
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                            value={newProduct.version || ''} onChange={e => setNewProduct({ ...newProduct, version: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                        <textarea
                          placeholder="Detailed description of features..."
                          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white h-24"
                          value={newProduct.description || ''} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                        />
                      </div>

                      {/* Pricing & Category */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Price (₹)</label>
                          <input
                            type="number" placeholder="4999" required
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                            value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">Category</label>
                          <select
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                            value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value as Category })}
                          >
                            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-slate-500">License</label>
                          <select
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                            value={newProduct.licenseType} onChange={e => setNewProduct({ ...newProduct, licenseType: e.target.value as LicenseType })}
                          >
                            <option value="Single User">Single User</option>
                            <option value="Multi User">Multi User</option>
                            <option value="Lifetime">Lifetime</option>
                          </select>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 dark:border-white/10 pt-6">
                        <label className="text-sm font-bold text-slate-900 dark:text-white block mb-4">File Hosting (Enter Direct Links)</label>

                        <div className="space-y-4">
                          {/* Main File URL */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Main TDL Download Link (Google Drive / Dropbox)</label>
                            <input
                              type="url"
                              placeholder="e.g. https://drive.google.com/file/d/..."
                              required={!editingId}
                              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                              value={newProduct.fileData || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, fileData: e.target.value, fileName: 'External Link', fileSize: 'N/A' })}
                            />
                            <p className="text-[10px] text-slate-400">Paste the sharing link of your file here.</p>
                          </div>

                          {/* Demo File URL */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Demo File Link (Optional)</label>
                            <input
                              type="url"
                              placeholder="e.g. https://drive.google.com/file/d/..."
                              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white"
                              value={newProduct.demoFileData || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, demoFileData: e.target.value, demoFileName: 'Demo Link' })}
                            />
                          </div>
                        </div>

                        {/* Divider for manual upload (Hidden for now to avoid confusion as per user request) */}
                        <div className="hidden border-t border-slate-200 dark:border-white/10 pt-6 mt-6">
                          <label className="text-sm font-bold text-slate-900 dark:text-white block mb-4">OR Upload Directly (Optional)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Main File */}
                            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl bg-slate-50 dark:bg-white/5 hover:border-blue-500 transition-colors">
                              <p className="text-xs font-bold uppercase text-slate-500 mb-2">Main TDL File (.txt, .tdl, .zip)</p>
                              <input
                                type="file"
                                accept=".txt,.tdl,.zip"
                                onChange={(e) => handleFileUpload(e, 'main')}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                              />
                              {newProduct.fileName && (
                                <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                                  <span>✓ Loaded:</span>
                                  <span className="truncate max-w-[150px]">{newProduct.fileName}</span>
                                  <span className="text-slate-400">({newProduct.fileSize})</span>
                                </div>
                              )}
                            </div>

                            {/* Demo File */}
                            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl bg-slate-50 dark:bg-white/5 hover:border-blue-500 transition-colors">
                              <p className="text-xs font-bold uppercase text-slate-500 mb-2">Demo File (Optional)</p>
                              <input
                                type="file"
                                accept=".txt,.tdl,.zip"
                                onChange={(e) => handleFileUpload(e, 'demo')}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 dark:file:bg-white/10 dark:file:text-slate-300"
                              />
                              {newProduct.demoFileName && (
                                <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                                  <span>✓ Loaded:</span>
                                  <span className="truncate max-w-[150px]">{newProduct.demoFileName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 gap-3">
                        <button
                          type="button"
                          onClick={handleCancelForm}
                          className="px-6 py-3 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-bold rounded-lg hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loadingFile}
                          className="w-full md:w-auto px-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20 relative overflow-hidden"
                        >
                          <span className="relative z-10">{loadingFile ? `Uploading ${Math.round(uploadProgress)}%` : (editingId ? 'Update Product' : 'Publish Product')}</span>
                          {loadingFile && (
                            <div
                              className="absolute inset-0 bg-green-800 transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="glass-card p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 relative group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">{p.category}</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditProduct(p)} className="text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 p-2 rounded-lg transition-colors">✏️</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">🗑️</button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{p.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-slate-500">{p.version || 'v1.0'}</span>
                        <span className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-slate-500">{p.licenseType || 'Single User'}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{p.description}</p>

                      {/* File Status Indicator */}
                      <div className="mb-4 flex gap-2">
                        {p.fileName ? (
                          <span className="text-[10px] flex items-center gap-1 text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-500/10 px-2 py-1 rounded">
                            📎 {p.fileName}
                          </span>
                        ) : (
                          <span className="text-[10px] flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold bg-orange-100 dark:bg-orange-500/10 px-2 py-1 rounded">
                            ⚠️ No File
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/10 pt-4">
                        <span className="font-bold text-slate-900 dark:text-white">₹{p.price}</span>
                        <span className="text-xs text-green-500">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="glass-card p-8 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-fade-in-up">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Management</h3>
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="text-xs uppercase bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="px-6 py-4 font-bold">{u.name}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4 capitalize">{u.role}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleUserStatusToggle(u.id, u.status)}
                            className="text-blue-500 hover:underline"
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="glass-card p-8 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-fade-in-up">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                    <thead className="text-xs uppercase bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                          <td className="px-6 py-4 font-mono">{order.id}</td>
                          <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{order.userName}</td>
                          <td className="px-6 py-4">{order.productName}</td>
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">₹{order.amount}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 uppercase">{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TICKETS TAB */}
            {activeTab === 'tickets' && (
              <div className="glass-card p-8 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-fade-in-up">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Support Tickets</h3>
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="text-xs uppercase bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-6 py-3">Ticket ID</th>
                      <th className="px-6 py-3">User ID</th>
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">Priority</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="px-6 py-4 font-mono">{t.id}</td>
                        <td className="px-6 py-4 font-mono">{t.userId}</td>
                        <td className="px-6 py-4">{t.subject}</td>
                        <td className="px-6 py-4"><span className="uppercase text-xs font-bold">{t.priority}</span></td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${t.status === 'open' ? 'bg-orange-100 text-orange-600' :
                            t.status === 'closed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleTicketStatus(t.id, t.status)} className="text-blue-500 hover:underline">
                            {t.status === 'open' ? 'Close Ticket' : 'Re-open'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
