import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProfileLayout from '../components/ProfileLayout';
import ConfirmModal from '../components/ConfirmModal';
import { useState } from 'react';
import { Bell, Mail, Shield, Trash2, RotateCcw } from 'lucide-react';

export default function ProfileSettings() {
  const { deleteAccount, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const handleDeleteAccount = () => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Account',
      message: 'WARNING: This will permanently delete your account and all your data. This action cannot be undone. Are you sure?',
      type: 'danger',
      confirmText: 'Delete Permanently',
      onConfirm: () => {
        deleteAccount();
        navigate('/');
      },
    });
  };

  const handleResetProfile = () => {
    setModalConfig({
      isOpen: true,
      title: 'Reset Profile',
      message: 'This will clear your personal information (name, phone, address, city, state, and preferred payment method). Your account and order history will remain intact. You can re-enter your details anytime.',
      type: 'warning',
      confirmText: 'Reset Profile',
      onConfirm: async () => {
        await updateProfile({
          phone: '',
          address: '',
          city: '',
          state: '',
        });
        setModalConfig({ isOpen: false });
      },
    });
  };

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        { icon: Bell, label: 'Push Notifications', desc: 'Real-time updates on orders and delivery', defaultChecked: true },
        { icon: Mail, label: 'Email Reports', desc: 'Monthly summaries of your dining activity', defaultChecked: true },
        { icon: Shield, label: 'Security Alerts', desc: 'Critical alerts for unauthorized access', defaultChecked: true },
      ],
    },
  ];

  return (
    <ProfileLayout title="Settings" subtitle="Preferences and security">
      <div className="space-y-10">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-[10px] font-bold text-(--brand-gold) uppercase tracking-[0.3em] flex items-center gap-3 mb-5">
              {group.title}
              <div className="h-px bg-(--brand-gold)/20 flex-1" />
            </h3>
            <div className="space-y-3">
              {group.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 sm:p-5 bg-(--bg-card) border border-(--border) rounded-xl group hover:border-(--brand-gold)/30 transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-(--brand-gold)/10 rounded-xl flex items-center justify-center text-(--brand-gold) shrink-0">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-(--text-primary) block">{item.label}</span>
                      <p className="text-[11px] text-(--text-muted) mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked={item.defaultChecked} />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Account Management */}
        <div>
          <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] flex items-center gap-3 mb-5">
            Account Management
            <div className="h-px bg-amber-500/20 flex-1" />
          </h3>
          <div className="p-5 sm:p-6 bg-amber-500/5 border border-amber-500/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                <RotateCcw size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-500">Reset Profile</h4>
                <p className="text-[11px] text-(--text-muted) mt-0.5">Clear your personal info and start fresh</p>
              </div>
            </div>
            <button
              onClick={handleResetProfile}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-600 transition-colors shrink-0"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.3em] flex items-center gap-3 mb-5">
            Danger Zone
            <div className="h-px bg-rose-500/20 flex-1" />
          </h3>
          <div className="p-5 sm:p-6 bg-rose-500/5 border border-rose-500/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-500">Delete Account</h4>
                <p className="text-[11px] text-(--text-muted) mt-0.5">Permanently delete your account and all data</p>
              </div>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto px-6 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-600 transition-colors shrink-0"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
      />
    </ProfileLayout>
  );
}
