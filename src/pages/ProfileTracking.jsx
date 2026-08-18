import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import ProfileLayout from '../components/ProfileLayout';
import MealImage from '../components/MealImage';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

export default function ProfileTracking() {
  const { user } = useAuth();
  const { orders: allOrders } = useOrders();

  const deliveryOrders = useMemo(() => {
    if (!user?.email) return [];
    return allOrders.filter((o) => o.userEmail?.toLowerCase() === user.email.toLowerCase() && o.status === 'delivering');
  }, [user, allOrders]);

  return (
    <ProfileLayout title="Tracking" subtitle="Real-time delivery status">
      <div className="space-y-6">
        {deliveryOrders.length > 0 ? (
          deliveryOrders.flatMap((order) =>
            order.items.map((item, idx) => (
              <motion.div
                key={`${order.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-(--bg-card) rounded-2xl p-5 md:p-8 shadow-md border border-(--border) relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-(--brand-gold) to-transparent" />
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg ring-4 ring-(--brand-gold)/10">
                      <MealImage name={item.name} image={item.img || item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-(--brand-gold) text-white rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                      <Truck size={20} />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xl font-bold text-(--text-primary)">{item.name}</h4>
                        <span className="text-[10px] font-bold text-(--brand-gold) uppercase tracking-widest">In Transit</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-(--text-primary)">${(item.price * item.quantity).toLocaleString('en-US')}</div>
                        <div className="text-[9px] font-bold text-(--text-muted) uppercase tracking-widest">{order.paymentMethod}</div>
                      </div>
                    </div>
                    <p className="text-sm text-(--text-secondary) leading-relaxed">Your order is on its way. Please keep your phone accessible for the arrival notification.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      {[
                        { label: 'ETA', value: '15-25 Mins' },
                        { label: 'Transit ID', value: `#${order.id.slice(-4)}` },
                        { label: 'Temperature', value: 'Optimal' },
                        { label: 'Security', value: 'Encrypted' },
                      ].map((s) => (
                        <div key={s.label} className="bg-(--bg-secondary) p-3 rounded-xl">
                          <p className="text-[8px] font-bold text-(--text-muted) uppercase tracking-widest mb-1">{s.label}</p>
                          <p className="text-xs font-bold text-(--text-primary)">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )
        ) : (
          <div className="bg-(--bg-card) rounded-2xl py-20 text-center border border-(--border)">
            <div className="w-20 h-20 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4 text-(--text-muted)">
              <Truck size={36} />
            </div>
            <h3 className="text-lg font-bold text-(--text-primary) mb-2">No Active Couriers</h3>
            <p className="text-sm text-(--text-muted)">You have no orders currently in transit.</p>
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}
