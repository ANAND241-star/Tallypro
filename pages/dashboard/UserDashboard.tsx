
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dbService as db } from '../../services/firebaseService';
import { TDLProduct, Ticket, TallyModule } from '../../types';

type DashboardTab = 'downloads' | 'support' | 'settings';

const UserDashboard: React.FC = () => {
  const { user, refreshUser, needsFeedback, setNeedsFeedback } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<DashboardTab>('downloads');

  // Feedback Form
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Support Form
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');

  // Settings Form
  const [profileName, setProfileName] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Async Data State
  const [myItems, setMyItems] = useState<(TDLProduct | TallyModule)[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Initialize Profile Form
  useEffect(() => {
    if (user) setProfileName(user.name);
  }, [user]);

  // Fetch Data from "Cloud"
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    let products: TDLProduct[] = [];
    let modules: TallyModule[] = [];

    const updateItems = () => {
      const purchasedProducts = products.filter(p => user.purchasedProducts?.includes(p.id));
      const purchasedModules = modules.filter(m => user.purchasedProducts?.includes(m.id));
      setMyItems([...purchasedProducts, ...purchasedModules]);
      setLoading(false);
    };

    const unsubscribeProducts = db.subscribeProducts((items) => {
      products = items;
      updateItems();
    });

    const unsubscribeModules = db.subscribeModules((items) => {
      modules = items;
      updateItems();
    });

    const unsubscribeTickets = db.subscribeTickets((items) => {
      setMyTickets(items.filter(t => t.userId === user.id));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeModules();
      unsubscribeTickets();
    };
  }, [user, activeTab]);

  const handleDownload = (item: TDLProduct | TallyModule) => {
    if (item.fileData && item.fileName) {
      const link = document.createElement('a');
      link.href = item.fileData;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloading ${item.fileName}...`, "success");
    } else {
      showToast(`Download started for ${item.name} (Demo Mock)`, "info");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && ticketSubject) {
      const newTicket = await db.createTicket(user.id, ticketSubject, 'medium');
      setMyTickets([newTicket, ...myTickets]);
      setTicketSubject('');
      setShowTicketForm(false);
      showToast("Support ticket created successfully!", "success");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);

    try {
      await db.updateUserProfile(user.id, { name: profileName });
      await refreshUser();
      showToast("Profile name updated successfully", "success");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwords.new !== passwords.confirm) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (passwords.new.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setUpdating(true);
    try {
      // Verify old password first
      const valid = await db.login(user.email, passwords.current);
      if (!valid) {
        showToast("Current password is incorrect", "error");
        setUpdating(false);
        return;
      }

      await db.updatePassword(user.email, passwords.new);
      setPasswords({ current: '', new: '', confirm: '' });
      showToast("Password changed successfully", "success");
    } catch {
      showToast("Error changing password", "error");
    } finally {
      setUpdating(false);
    }
  };

  const submitFeedback = async () => {
    if (!user) return;
    setSubmittingFeedback(true);
    await db.createFeedback(user.name, user.email, feedbackForm.rating, feedbackForm.comment);
    setSubmittingFeedback(false);
    setNeedsFeedback(false);
    showToast('Thank you for your feedback!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex justify-center bg-slate-50 dark:bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-dark transition-colors">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your downloads and account settings.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-sm">
            <span className={`w-2 h-2 rounded-full ${user?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-slate-600 dark:text-slate-300 font-medium capitalize">{user?.status} Account</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-white/10 mb-8 overflow-x-auto">
          {(['downloads', 'support', 'settings'] as DashboardTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 ${activeTab === tab
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'
                }`}
            >
              {tab === 'downloads' && `My Downloads (${myItems.length})`}
              {tab === 'support' && `Support Tickets (${myTickets.filter(t => t.status !== 'closed').length})`}
              {tab === 'settings' && 'Account Settings'}
            </button>
          ))}
        </div>

        {/* --- DOWNLOADS TAB --- */}
        {activeTab === 'downloads' && (
          <div className="animate-fade-in-up">
            {myItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {myItems.map(item => (
                  <div key={item.id} className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-white/5">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                            Ver: {item.version || '1.0'}
                          </span>
                          <span className="text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                            {item.licenseType || 'Standard'} License
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-sm font-medium border border-slate-200 dark:border-white/5">
                        Installation Guide
                      </button>
                      <button
                        onClick={() => handleDownload(item)}
                        className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-slate-100 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10">
                <div className="text-4xl mb-4">📂</div>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">You haven't purchased any TDLs or Modules yet.</p>
                <div className="flex justify-center gap-4">
                  <Link to="/products" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Browse Products</Link>
                  <Link to="/modules" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Browse Modules</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SUPPORT TAB --- */}
        {activeTab === 'support' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Support History</h2>
              <button
                onClick={() => setShowTicketForm(!showTicketForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md"
              >
                {showTicketForm ? 'Cancel' : '+ New Ticket'}
              </button>
            </div>

            {showTicketForm && (
              <div className="glass-card p-6 rounded-2xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10">
                <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Describe your issue</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="e.g. My TDL is not loading in Tally Prime..."
                      className="flex-1 bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                    />
                    <button type="submit" className="bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700">Submit</button>
                  </div>
                </form>
              </div>
            )}

            {myTickets.length > 0 ? (
              <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 uppercase text-xs font-bold">
                    <tr>
                      <th className="px-6 py-4">Ticket ID</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTickets.map(ticket => (
                      <tr key={ticket.id} className="border-t border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{ticket.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{ticket.subject}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${ticket.status === 'open' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                            ticket.status === 'closed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No support tickets found.</p>
            )}
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">

            {/* Profile Info */}
            <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Details</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-2">Email cannot be changed directly.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security */}
            <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Security</h3>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2 bg-slate-800 dark:bg-white/10 text-white rounded-lg font-bold hover:bg-black dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Mandatory Feedback Modal */}
      {needsFeedback && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-fade-in-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Before continuing, please share your feedback.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Rate your experience</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className={`text-3xl transition-transform hover:scale-110 ${feedbackForm.rating >= star ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Any comments? (Optional)</label>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  placeholder="Tell us what you liked or how we can improve..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <button
                onClick={submitFeedback}
                disabled={submittingFeedback}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-40 disabled:cursor-wait shadow-lg shadow-blue-500/25"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
