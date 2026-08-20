import { useState, useRef } from 'react';
import {
  // Settings as SettingsIcon,
  Store,
  Shield,
  Bell,
  Clock,
  CreditCard,
  Save,
  Camera,
  Lock,
  // Globe,
  User as UserIcon,
  AlertTriangle,
} from 'lucide-react';

const SettingsPage = ({
  adminProfile: initialProfile,
  handleImageChange: initialHandleImageChange,
  fileInputRef: initialRef,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState('general');

  const localRef = useRef(null);
  const fileInputRef = initialRef || localRef;

  const [adminProfile, setAdminProfile] = useState(
    initialProfile || {
      name: '',
      role: 'Administrator',
      image: null,
    }
  );

  const handleImageChange = (e) => {
    if (initialHandleImageChange) {
      initialHandleImageChange(e);
      return;
    }

    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const updated = {
          ...adminProfile,
          image: reader.result,
        };

        setAdminProfile(updated);
      };

      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    {
      id: 'general',
      label: 'General Info',
      icon: <Store size={18} />,
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield size={18} />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={18} />,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard size={18} />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-admin-text">
            Settings
          </h1>

          <p className="text-admin-text-muted">
            Configure your restaurant and security preferences.
          </p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl text-sm font-black shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
          <Save size={18} />
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'bg-admin-card text-admin-text-muted hover:bg-accent/5 shadow-sm'
              }`}
            >
              <span
                className={
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-accent'
                }
              >
                {tab.icon}
              </span>

              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="admin-panel p-8 space-y-8 bg-admin-card shadow-sm">
              <div className="flex items-center gap-8 flex-wrap">
                <div className="relative group">
                  {adminProfile.image ? (
                    <img
                      src={adminProfile.image}
                      alt="Logo"
                      className="w-32 h-32 rounded-full object-cover border-4 border-admin-sidebar shadow-2xl transition-all group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-accent/10 border-4 border-admin-sidebar shadow-2xl flex items-center justify-center text-accent">
                      <UserIcon size={56} />
                    </div>
                  )}

                  <button
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute bottom-0 right-0 p-3 bg-accent text-white rounded-full shadow-xl hover:scale-110 transition-all cursor-pointer border-4 border-admin-sidebar"
                  >
                    <Camera size={20} />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-black text-admin-text mb-2">
                    Administrator Profile
                  </h3>

                  <p className="text-admin-text-muted text-sm max-w-xs">
                    Your profile image is synced with your
                    public account. Changes here reflect
                    everywhere.
                  </p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <SettingsField
                  label="Restaurant Name"
                  defaultValue="Aurum & Ember"
                />

                <SettingsField
                  label="Official Website"
                  defaultValue="www.aurumember.com"
                />

                <SettingsField
                  label="Contact Email"
                  defaultValue="hello@aurumember.com"
                  type="email"
                />

                <SettingsField
                  label="Phone Support"
                  defaultValue="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-xs font-black text-admin-text-muted uppercase tracking-widest ml-1">
                  Restaurant Address
                </label>

                <textarea
                  rows="3"
                  className="w-full bg-admin-bg/50 border border-admin-border rounded-2xl py-4 px-6 text-admin-text outline-none focus:border-accent resize-none transition-all"
                >
                  123 Culinary Avenue, Gourmet District, NY
                  10001
                </textarea>
              </div>

              <div className="pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      <Clock size={24} />
                    </div>

                    <div>
                      <p className="font-black text-admin-text text-sm">
                        Operating Hours
                      </p>

                      <p className="text-admin-text-muted text-xs">
                        Manage your restaurant opening
                        schedule.
                      </p>
                    </div>
                  </div>

                  <button className="px-6 py-3 bg-admin-bg hover:bg-admin-border rounded-xl text-[10px] font-black uppercase tracking-widest text-admin-text-muted hover:text-admin-text transition-all cursor-pointer shadow-sm">
                    Configure
                  </button>
                </div>
              </div>

              {/* DANGER ZONE */}
              <div className="pt-8">
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                      <AlertTriangle size={22} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-black text-rose-500">
                        Danger Zone
                      </h3>

                      <p className="text-sm text-admin-text-muted mt-2 leading-relaxed">
                        This action permanently removes all
                        orders, notifications, and stored
                        system data.
                      </p>

                      <button
                        onClick={() => {
                          if (onResetData) {
                            onResetData();
                          }
                        }}
                        className="mt-5 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
                      >
                        Reset Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="admin-panel p-8 space-y-8 bg-admin-card shadow-sm animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Lock size={24} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-admin-text">
                    Login & Security
                  </h3>

                  <p className="text-sm text-admin-text-muted">
                    Manage your account protection settings.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <SettingsField
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                />

                <SettingsField
                  label="New Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                />

                <div className="pt-8">
                  <div className="flex items-center justify-between p-6 bg-admin-bg/50 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                        <Shield size={20} />
                      </div>

                      <div>
                        <p className="font-black text-admin-text text-sm">
                          Two-Factor Authentication
                        </p>

                        <p className="text-admin-text-muted text-xs mt-1">
                          Add an extra layer of security to
                          your account.
                        </p>
                      </div>
                    </div>

                    <div className="w-12 h-6 bg-accent rounded-full relative cursor-pointer shadow-lg shadow-accent/20">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="admin-panel p-8 bg-admin-card shadow-sm animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-black text-admin-text mb-6">
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <ToggleSetting
                  label="Email Notifications"
                  desc="Receive daily summary of orders and revenue."
                  defaultChecked={true}
                />

                <ToggleSetting
                  label="Push Alerts"
                  desc="Instant alerts for new orders and reservations."
                  defaultChecked={true}
                />

                <ToggleSetting
                  label="Marketing Updates"
                  desc="Tips on how to grow your restaurant business."
                  defaultChecked={false}
                />
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="admin-panel p-8 bg-admin-card shadow-sm animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-black text-admin-text">
                Payment Configuration
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsField = ({
  label,
  defaultValue,
  placeholder,
  type = 'text',
}) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-admin-text-muted uppercase tracking-widest ml-1">
      {label}
    </label>

    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full bg-admin-bg/50 border border-admin-border rounded-2xl py-4 px-6 text-admin-text outline-none focus:border-accent transition-all"
    />
  </div>
);

const ToggleSetting = ({
  label,
  desc,
  defaultChecked,
}) => (
  <div className="flex items-center justify-between p-4 hover:bg-admin-bg/50 rounded-2xl transition-all">
    <div>
      <p className="font-bold text-admin-text text-sm">
        {label}
      </p>

      <p className="text-admin-text-muted text-xs">
        {desc}
      </p>
    </div>

    <div
      className={`w-10 h-5 ${
        defaultChecked
          ? 'bg-accent'
          : 'bg-admin-border'
      } rounded-full relative cursor-pointer`}
    >
      <div
        className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
          defaultChecked ? 'right-1' : 'left-1'
        }`}
      />
    </div>
  </div>
);

export default SettingsPage;