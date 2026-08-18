import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProfileLayout from '../components/ProfileLayout';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, CheckCheck } from 'lucide-react';
import { markNotificationRead, markAllNotificationsRead } from '../services/orderService';

export default function ProfileNotifications() {
  const { user, token } = useAuth();
  const [acknowledged, setAcknowledged] = useState(new Set());

  const isRead = (notif) => notif.read || acknowledged.has(notif._id);

  const handleAcknowledge = async (notif) => {
    if (!isRead(notif)) {
      await markNotificationRead(notif._id, token);
      setAcknowledged(prev => new Set([...prev, notif._id]));
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(token);
    const ids = (user?.notifications || []).map(n => n._id);
    setAcknowledged(new Set(ids));
  };

  const unreadCount = (user?.notifications || []).filter(n => !isRead(n)).length;

  return (
    <ProfileLayout title="Notifications" subtitle="Updates and alerts">
      {user?.notifications && user.notifications.length > 0 && unreadCount > 0 && (
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 mb-4 px-4 py-2 text-[10px] font-bold text-(--brand-gold) uppercase tracking-widest bg-(--brand-gold)/5 border border-(--brand-gold)/20 rounded-xl hover:bg-(--brand-gold)/10 transition"
        >
          <CheckCheck size={14} />
          Mark all as read
        </button>
      )}
      <div className="space-y-4">
        {user?.notifications && user.notifications.length > 0 ? (
          user.notifications.map((notif) => (
            <motion.div
              key={notif._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border transition-all ${
                isRead(notif)
                  ? 'bg-(--bg-card) border-(--border) opacity-60'
                  : 'bg-(--brand-gold)/5 border-(--brand-gold)/20 shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  isRead(notif) ? 'bg-(--bg-secondary) text-(--text-muted)' : 'bg-(--brand-gold) text-white shadow-lg shadow-(--brand-gold)/20'
                }`}>
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${isRead(notif) ? 'text-(--text-muted)' : 'text-(--text-primary)'}`}>
                      Notification
                    </h4>
                    {!isRead(notif) && (
                      <span className="text-[8px] font-bold text-(--brand-gold) bg-(--brand-gold)/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-(--brand-gold) font-bold uppercase tracking-widest">{notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : notif.date}</span>
                  <p className={`text-sm mt-2 leading-relaxed ${isRead(notif) ? 'text-(--text-muted)' : 'text-(--text-secondary)'}`}>
                    {notif.message}
                  </p>
                  {!isRead(notif) && (
                    <button
                      onClick={() => handleAcknowledge(notif)}
                      className="flex items-center gap-1 mt-3 text-[10px] font-bold text-(--brand-gold) uppercase tracking-widest hover:underline group"
                    >
                      Acknowledge
                      <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-(--bg-card) rounded-2xl py-20 text-center border border-(--border)">
            <div className="w-20 h-20 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4 text-(--text-muted)">
              <Bell size={36} />
            </div>
            <h3 className="text-lg font-bold text-(--text-primary) mb-2">No Notifications</h3>
            <p className="text-sm text-(--text-muted)">You're all caught up.</p>
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}
