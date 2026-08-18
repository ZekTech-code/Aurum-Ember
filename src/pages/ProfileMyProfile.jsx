import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProfileLayout from '../components/ProfileLayout';
import ProfileAvatar from '../components/ProfileAvatar';
import { User, Mail, Phone, MapPin, Shield, Building, Check, Save } from 'lucide-react';

export default function ProfileMyProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || user?.location || '',
    city: user?.city || '',
    state: user?.state || '',
  });
  const [addressSaved, setAddressSaved] = useState(false);

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleAvatarChange = (dataUrl) => {
    updateProfile({ avatar: dataUrl });
  };

  const handleAddressSave = () => {
    updateProfile({ address: formData.address, city: formData.city, state: formData.state });
    setAddressSaved(true);
    setTimeout(() => setAddressSaved(false), 2000);
  };

  const inputClass =
    'w-full pl-12 pr-4 py-3.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all border border-[var(--border)] focus:border-[var(--brand-gold)]';

  const inputDisabledClass =
    'w-full pl-12 pr-4 py-3.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] transition-all border border-[var(--border)] opacity-60';

  const infoFields = [
    { label: 'Full Name', key: 'name', type: 'text', icon: User, placeholder: 'Enter your name' },
    { label: 'Email Address', key: 'email', type: 'email', icon: Mail, placeholder: 'email@example.com' },
    { label: 'Phone Number', key: 'phone', type: 'tel', icon: Phone, placeholder: '+234 ...' },
  ];

  const addressFields = [
    { label: 'Street Address', key: 'address', type: 'text', icon: MapPin, placeholder: 'Your street address', fullWidth: true },
    { label: 'City / Town', key: 'city', type: 'text', icon: Building, placeholder: 'Your city' },
    { label: 'State / Region', key: 'state', type: 'text', icon: Shield, placeholder: 'Your state' },
  ];

  return (
    <ProfileLayout title="My Profile" subtitle="Manage your account details">
      {/* ── Avatar ── */}
      <div className="flex items-center gap-5 mb-10 pb-8 border-b border-(--border)">
        <ProfileAvatar
          src={user.avatar}
          alt={user.name}
          name={user.name}
          size="lg"
          editable
          onImageChange={handleAvatarChange}
        />
        <div>
          <h3 className="text-lg font-bold text-(--text-primary)">{user.name}</h3>
          <p className="text-sm text-(--text-muted)">{user.email}</p>
        </div>
      </div>

      {/* ── Personal Information ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest ml-1">Personal Information</h3>
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              isEditing
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-(--bg-secondary) text-(--text-muted) border border-(--border) hover:border-(--brand-gold) hover:text-(--brand-gold)'
            }`}
          >
            {isEditing ? 'Save Info' : 'Edit'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {infoFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest ml-1">
                {field.label}
              </label>
              <div className="relative">
                <field.icon
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    isEditing ? 'text-(--brand-gold)' : 'text-(--text-muted)/40'
                  }`}
                  size={16}
                />
                <input
                  type={field.type}
                  value={formData[field.key]}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className={isEditing ? inputClass : inputDisabledClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Delivery Address ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest ml-1">Delivery Address</h3>
          <button
            onClick={handleAddressSave}
            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
              addressSaved
                ? 'bg-emerald-500 text-white'
                : 'bg-(--brand-gold) text-white shadow-lg shadow-(--brand-gold)/20 hover:opacity-90'
            }`}
          >
            {addressSaved ? <><Check size={12} /> Saved</> : <><Save size={12} /> Save Address</>}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addressFields.map((field) => (
            <div key={field.key} className={`space-y-2 ${field.fullWidth ? 'md:col-span-2' : ''}`}>
              <label className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest ml-1">
                {field.label}
              </label>
              <div className="relative">
                <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-(--brand-gold)" size={16} />
                <input
                  type={field.type}
                  value={formData[field.key]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProfileLayout>
  );
}
