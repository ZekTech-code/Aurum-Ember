import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileLayout from '../components/ProfileLayout';
import ConfirmModal from '../components/ConfirmModal';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

export default function ProfileReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const getDayMonth = (dateString) => {
    if (!dateString) return { day: '??', month: '???' };
    const parts = dateString.split(' ');
    if (parts.length >= 2 && isNaN(parts[0])) {
      return { month: parts[0].toUpperCase(), day: parts[1] };
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { day: '??', month: '???' };
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: date.getDate(),
      };
    } catch {
      return { day: '??', month: '???' };
    }
  };

  const cancelReservation = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Cancel Reservation',
      message: 'Are you sure you want to cancel this reservation?',
      type: 'warning',
      confirmText: 'Yes, Cancel',
      onConfirm: () => setReservations((prev) => prev.filter((r) => r.id !== id)),
    });
  };

  return (
    <ProfileLayout title="Reservations" subtitle="Your table bookings">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reservations.length > 0 ? (
          reservations.map((res) => {
            const dateInfo = getDayMonth(res.date);
            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-(--bg-card) rounded-2xl p-5 md:p-7 border border-(--border) hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-row sm:flex-col items-center justify-center w-full sm:w-16 h-12 sm:h-20 bg-(--brand-gold)/5 border border-(--brand-gold)/10 rounded-xl gap-2 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-(--brand-gold)">{dateInfo.month}</span>
                    <span className="text-2xl font-black text-(--text-primary)">{dateInfo.day}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-(--text-primary)">Table for {res.guests} Guests</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={12} className="text-(--brand-gold)" />
                      <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">{res.time} &middot; {res.type}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[9px] font-bold uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Confirmed
                      </div>
                      <button
                        className="text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                        onClick={() => cancelReservation(res.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="md:col-span-2 bg-(--bg-card) rounded-2xl py-20 text-center border border-(--border)">
            <div className="w-20 h-20 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4 text-(--text-muted)">
              <Calendar size={36} />
            </div>
            <h3 className="text-lg font-bold text-(--text-primary) mb-2">No Active Reservations</h3>
            <p className="text-sm text-(--text-muted) mb-6">Secure your table for an upcoming evening.</p>
            <button className="bg-(--brand-gold) text-white px-8 py-3 rounded-xl text-sm font-bold" onClick={() => navigate('/reserve')}>
              Book a Table
            </button>
          </div>
        )}
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
