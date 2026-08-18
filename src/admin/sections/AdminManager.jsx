import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail, Calendar, Loader2, Shield, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../components/Toast';

const AdminManager = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('ae-admin-token');
      const res = await fetch('/api/admin/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(Array.isArray(data) ? data : data.admins || []);
      }
    } catch { /* Silently handle error */ }
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('ae-admin-token');
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setToast({ message: data.message || `${formData.name} added as admin. They will see a welcome notification on login.`, type: 'success' });
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '' });
        fetchAdmins();
      } else {
        const err = await res.json();
        setToast({ message: err.message || 'Failed to add admin', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to add admin', type: 'error' });
    }
    setSubmitting(false);
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      const token = sessionStorage.getItem('ae-admin-token');
      const res = await fetch(`/api/admin/${adminId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setToast({ message: 'Admin removed', type: 'success' });
        fetchAdmins();
      } else {
        const err = await res.json();
        setToast({ message: err.message || 'Failed to delete admin', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to delete admin', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-admin-card p-8 rounded-[2.5rem] shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-admin-text tracking-tight">Admin Team</h1>
          <p className="text-admin-text-muted mt-1 font-medium">Manage who has admin access to this dashboard.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-accent/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <UserPlus size={20} /> Add Admin
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-admin-card rounded-[2rem] h-48 animate-pulse" />)}
        </div>
      ) : admins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <motion.div
              key={admin._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-admin-card rounded-[2rem] p-8 group transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Shield size={24} className="text-accent" />
                </div>
                <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-accent/10 text-accent border border-accent/20">
                  {admin.role || 'Admin'}
                </span>
              </div>
              <h3 className="text-lg font-black text-admin-text mb-1">{admin.name}</h3>
              <div className="flex items-center gap-2 text-admin-text-muted text-sm font-medium mb-4">
                <Mail size={14} />
                {admin.email}
              </div>
              {admin.createdAt && (
                <div className="flex items-center gap-2 text-admin-text-muted text-xs font-medium">
                  <Calendar size={12} />
                  Joined {new Date(admin.createdAt).toLocaleDateString()}
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-admin-border flex justify-end">
                <button
                  onClick={() => setDeleteTarget(admin)}
                  className="p-2.5 text-admin-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                  title="Remove admin"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-admin-card rounded-[3rem] p-20 text-center">
          <Users size={48} className="mx-auto mb-4 text-admin-text-muted opacity-30" />
          <h3 className="text-2xl font-black text-admin-text mb-2">No admins found</h3>
          <p className="text-admin-text-muted font-medium">Add the first admin to your team.</p>
        </div>
      )}

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowAddModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg bg-admin-card rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-admin-border flex justify-between items-center bg-admin-bg/20">
                <div>
                  <h2 className="text-2xl font-black text-admin-text">Add New Admin</h2>
                  <p className="text-sm text-admin-text-muted font-medium mt-1">Grant dashboard access to a team member.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl text-admin-text-muted transition-all cursor-pointer">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddAdmin} className="p-10 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-admin-bg border border-admin-border rounded-2xl py-4 px-6 text-admin-text font-semibold text-sm outline-none focus:border-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Email</label>
                  <input
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="admin@example.com"
                    className="w-full bg-admin-bg border border-admin-border rounded-2xl py-4 px-6 text-admin-text font-semibold text-sm outline-none focus:border-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1">Password</label>
                  <input
                    type="password" required value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Min 8 chars, upper + lower + number"
                    className="w-full bg-admin-bg border border-admin-border rounded-2xl py-4 px-6 text-admin-text font-semibold text-sm outline-none focus:border-accent transition-all"
                  />
                  <p className="text-[10px] text-admin-text-muted ml-1">Must contain uppercase, lowercase, and a number. At least 8 characters.</p>
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="w-full py-5 bg-accent hover:bg-accent/90 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={20} /> Add Admin</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Admin Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !deleting && setDeleteTarget(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-md bg-admin-card rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={28} className="text-rose-500" />
                </div>
                <h2 className="text-xl font-black text-admin-text mb-2">Remove Admin</h2>
                <p className="text-sm text-admin-text-muted font-medium mb-1">
                  Are you sure you want to remove <span className="text-admin-text font-bold">{deleteTarget.name}</span>?
                </p>
                <p className="text-xs text-admin-text-muted">
                  They will lose access to the admin dashboard immediately. This action cannot be undone.
                </p>
              </div>
              <div className="px-8 pb-8 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-3.5 bg-admin-bg border border-admin-border rounded-xl text-admin-text-muted text-xs font-bold uppercase tracking-widest hover:bg-admin-border transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true);
                    await handleDeleteAdmin(deleteTarget._id);
                    setDeleteTarget(null);
                    setDeleting(false);
                  }}
                  disabled={deleting}
                  className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? <Loader2 className="animate-spin" size={16} /> : <><Trash2 size={14} /> Remove</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminManager;
