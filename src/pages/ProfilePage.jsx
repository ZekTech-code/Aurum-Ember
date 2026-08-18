import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import PageLayout from '../components/PageLayout';
import ProfileAvatar from '../components/ProfileAvatar';
import SignOutModal from '../components/SignOutModal';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  Truck,
  Calendar,
  Bell,
  MessageCircle,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  CreditCard,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const deliveredCount = orders.filter(
    (o) => o.userEmail === user?.email && o.status === 'delivered'
  ).length;

  const hasUnreadNotifications = user?.notifications?.some((n) => !n.read);

  const menuItems = [
    { icon: User, label: 'My Profile', desc: 'Manage your account details', to: '/profile/edit' },
    { icon: Package, label: 'Orders', desc: 'Track and manage your orders', to: '/profile/orders' },
    { icon: CreditCard, label: 'Transactions', desc: 'Payment and order history', to: '/profile/transactions' },
    { icon: Truck, label: 'Tracking', desc: 'Live delivery status', to: '/profile/tracking' },
    { icon: Calendar, label: 'Reservations', desc: 'Your table bookings', to: '/profile/reservations' },
    { icon: Bell, label: 'Notifications', desc: 'Updates and alerts', to: '/profile/notifications', badge: hasUnreadNotifications },
    { icon: MessageCircle, label: 'Support', desc: 'Chat with our team', to: '/profile/support' },
    { icon: Settings, label: 'Settings', desc: 'Preferences and security', to: '/profile/settings' },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: 0.05 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  };

  if (!user) {
    return (
      <PageLayout className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--brand-gold)" />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-(--bg-primary)">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-8">

          {/* ── Profile Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 sm:gap-5 mb-8 sm:mb-10"
          >
            <ProfileAvatar
              src={user.avatar}
              alt={user.name}
              name={user.name}
              size="lg"
              editable={false}
            />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-(--text-primary) truncate">{user.name}</h1>
              <p className="text-sm text-(--text-muted) truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Shield size={10} className="text-(--brand-gold)" />
                <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
                  Member since {user.joinedAt || '2026'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Stats Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 sm:mb-10"
          >
            {[
              { label: 'Total Orders', value: orders.filter((o) => o.userEmail === user.email).length },
              { label: 'Delivered', value: deliveredCount },
              { label: 'Notifications', value: user.notifications?.length || 0 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-(--bg-card) rounded-2xl border border-(--border) p-3 sm:p-5 text-center"
              >
                <div className="text-lg sm:text-2xl font-black text-(--brand-gold)">{stat.value}</div>
                <div className="text-[9px] sm:text-xs font-bold text-(--text-muted) uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* ── Navigation Cards ── */}
          <div className="space-y-2 sm:space-y-3">
            {menuItems.map((item, i) => (
              <motion.button
                key={item.to}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(item.to)}
                className="w-full flex items-center gap-3 sm:gap-4 bg-(--bg-card) rounded-2xl border border-(--border) p-3 sm:p-5 text-left cursor-pointer transition-shadow hover:shadow-md group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-(--brand-gold)/10 flex items-center justify-center shrink-0 group-hover:bg-(--brand-gold)/15 transition-colors">
                  <item.icon size={20} className="text-(--brand-gold)" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-(--text-primary)">{item.label}</span>
                    {item.badge && (
                      <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-(--text-muted) mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-(--text-muted) group-hover:text-(--text-primary) group-hover:translate-x-0.5 transition-all shrink-0" />
              </motion.button>
            ))}
          </div>

          {/* ── Logout ── */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => setShowSignOutModal(true)}
            className="w-full flex items-center justify-center gap-2.5 mt-6 sm:mt-8 py-3 sm:py-3.5 rounded-xl border border-rose-500/20 text-rose-500 text-sm font-bold hover:bg-rose-500/5 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </motion.button>
        </div>
      </div>

      <SignOutModal
        isOpen={showSignOutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowSignOutModal(false)}
        userName={user?.name}
      />
    </PageLayout>
  );
}
