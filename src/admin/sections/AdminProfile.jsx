import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, User, Shield, Bell, Edit2, Check, X,
  ArrowLeft, Lock, Eye, EyeOff, Mail, Smartphone,
  Sun, Moon, ChevronRight, Save, LogOut, MapPin, Phone
} from 'lucide-react';
import SignOutModal from '../../components/SignOutModal';
import '../../styles/admin.css';

const SettingsField = ({ label, defaultValue, type = 'text', placeholder }) => {
  const [value, setValue] = useState(defaultValue || '');
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 text-admin-text text-sm focus:border-accent outline-hidden transition-all"
      />
    </div>
  );
};

const ToggleRow = ({ icon, title, description, defaultOn = false }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-4 border-b border-admin-border/50 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-admin-text">{title}</p>
          <p className="text-xs text-admin-text-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${on ? 'bg-accent' : 'bg-admin-border'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
};

const AdminProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    role: 'Admin',
    email: '',
    phone: '',
    location: '',
    image: null
  });
  const [editForm, setEditForm] = useState({ ...profile });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('ae-admin-token');
    if (!token) { setLoading(false); return; }
    fetch('/api/admin/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setProfile(prev => ({
            ...prev,
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'Admin'
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setEditForm({ ...profile });
  }, [profile]);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('admin-theme');
    const dark = saved !== 'light';
    document.documentElement.classList.toggle('dark', dark);
    return dark;
  });
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: isDark ? <Moon size={16} /> : <Sun size={16} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 pt-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-admin-text">Account Settings</h1>
          <p className="text-xs text-admin-text-muted">Manage your profile and preferences</p>
        </div>
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 hover:bg-admin-bg rounded-xl text-admin-text-muted hover:text-accent transition-colors cursor-pointer"
        >
          <span className="text-sm font-bold">Back</span>
          <ArrowLeft size={18} className="rotate-180" />
        </motion.button>
      </div>

      {/* Profile Card */}
      <div className="bg-admin-sidebar rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative group shrink-0">
            {profile.image ? (
              <img src={profile.image} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-accent/30" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center text-accent">
                <User size={28} />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="text-white" size={18} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-admin-text truncate">{profile.name}</h2>
            <p className="text-xs text-accent font-bold">{profile.role}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => setShowSignOutModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={async () => {
                    const token = sessionStorage.getItem('ae-admin-token');
                    if (token) {
                      try {
                        const res = await fetch('/api/admin/profile', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify(editForm)
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setProfile({ ...editForm, ...data });
                        } else {
                          setProfile(editForm);
                        }
                      } catch {
                        setProfile(editForm);
                      }
                    } else {
                      setProfile(editForm);
                    }
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Check size={14} /> Save
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditForm({ ...profile }); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-admin-bg text-admin-text-muted rounded-xl text-xs font-bold hover:bg-admin-border transition-all cursor-pointer"
                >
                  <X size={14} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-admin-sidebar rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-accent text-white shadow-md'
                : 'text-admin-text-muted hover:text-accent hover:bg-accent/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-admin-sidebar rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-admin-text">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 text-admin-text text-sm focus:border-accent outline-hidden transition-all"
                      />
                    ) : (
                      <p className="text-admin-text font-bold text-sm py-3">{profile.name || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Role</label>
                    <p className="text-admin-text font-bold text-sm py-3">{profile.role}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest flex items-center gap-1.5">
                      <Mail size={12} /> Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="admin@aurumember.com"
                        className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 text-admin-text text-sm focus:border-accent outline-hidden transition-all"
                      />
                    ) : (
                      <p className="text-admin-text font-bold text-sm py-3">{profile.email || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest flex items-center gap-1.5">
                      <Phone size={12} /> Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 text-admin-text text-sm focus:border-accent outline-hidden transition-all"
                      />
                    ) : (
                      <p className="text-admin-text font-bold text-sm py-3">{profile.phone || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={12} /> Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="New York, USA"
                        className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 text-admin-text text-sm focus:border-accent outline-hidden transition-all"
                      />
                    ) : (
                      <p className="text-admin-text font-bold text-sm py-3">{profile.location || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-admin-sidebar rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-admin-text">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Current Password</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 pr-12 text-admin-text text-sm focus:border-accent outline-hidden transition-all"
                      />
                      <button
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-accent transition-colors cursor-pointer"
                      >
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="w-full bg-admin-bg border border-admin-border rounded-xl px-4 py-3 pr-12 text-admin-text text-sm focus:border-accent outline-hidden transition-all"
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-accent transition-colors cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer">
                    <Lock size={14} /> Update Password
                  </button>
                </div>
              </div>

              <div className="bg-admin-sidebar rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-admin-text">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-admin-text">Authenticator App</p>
                      <p className="text-xs text-admin-text-muted">Use an authenticator app for 2FA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Check size={12} /> Enabled
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-admin-sidebar rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-black text-admin-text mb-2">Notification Preferences</h3>
              <p className="text-xs text-admin-text-muted mb-4">Choose what notifications you receive</p>
              <ToggleRow
                icon={<Bell size={18} />}
                title="Order Alerts"
                description="Get notified for new and pending orders"
                defaultOn={true}
              />
              <ToggleRow
                icon={<Mail size={18} />}
                title="Email Notifications"
                description="Receive summary emails for daily activity"
                defaultOn={false}
              />
              <ToggleRow
                icon={<Smartphone size={18} />}
                title="Push Notifications"
                description="Browser push notifications for critical events"
                defaultOn={true}
              />
              <ToggleRow
                icon={<Shield size={18} />}
                title="Security Alerts"
                description="Login attempts and security warnings"
                defaultOn={true}
              />
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-admin-sidebar rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-admin-text mb-1">Theme</h3>
                <p className="text-xs text-admin-text-muted mb-6">Select your preferred interface theme</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setIsDark(true); localStorage.setItem('admin-theme', 'dark'); document.documentElement.classList.add('dark'); }}
                    className={`relative p-1 rounded-2xl border-2 transition-all cursor-pointer ${isDark ? 'border-accent shadow-lg shadow-accent/10' : 'border-admin-border hover:border-accent/40'}`}
                  >
                    {isDark && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <div className="bg-[#111111] rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        <div className="h-2 flex-1 bg-white/10 rounded-full" />
                        <div className="h-2 w-8 bg-white/10 rounded-full" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1/4 h-12 bg-white/5 rounded-lg border border-white/10" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                          <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                          <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Moon size={14} className="text-admin-text-muted" />
                        <span className="text-sm font-bold text-admin-text">Dark</span>
                      </div>
                      <span className="text-[9px] font-bold text-admin-text-muted uppercase tracking-widest">Default</span>
                    </div>
                  </button>
                  <button
                    onClick={() => { setIsDark(false); localStorage.setItem('admin-theme', 'light'); document.documentElement.classList.remove('dark'); }}
                    className={`relative p-1 rounded-2xl border-2 transition-all cursor-pointer ${!isDark ? 'border-accent shadow-lg shadow-accent/10' : 'border-admin-border hover:border-accent/40'}`}
                  >
                    {!isDark && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <div className="bg-gray-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        <div className="h-2 flex-1 bg-gray-300 rounded-full" />
                        <div className="h-2 w-8 bg-gray-300 rounded-full" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1/4 h-12 bg-white rounded-lg border border-gray-200 shadow-sm" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2 w-3/4 bg-gray-300 rounded-full" />
                          <div className="h-2 w-1/2 bg-gray-300 rounded-full" />
                          <div className="h-2 w-2/3 bg-gray-300 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sun size={14} className="text-admin-text-muted" />
                        <span className="text-sm font-bold text-admin-text">Light</span>
                      </div>
                      <span className="text-[9px] font-bold text-admin-text-muted uppercase tracking-widest">Alt</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <SignOutModal
        isOpen={showSignOutModal}
        onConfirm={() => {
          sessionStorage.removeItem('ae-admin-token');
          window.location.href = '/admin/login';
        }}
        onCancel={() => setShowSignOutModal(false)}
      />
    </div>
  );
};

export default AdminProfile;
