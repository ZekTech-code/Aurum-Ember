import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import ProfileLayout from '../components/ProfileLayout';
import MealImage from '../components/MealImage';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';

export default function ProfileOrders() {
  const { user } = useAuth();
  const { orders: allOrders, cancelOrder } = useOrders();
  const navigate = useNavigate();
  const [orderFilter, setOrderFilter] = useState('ongoing');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [cancellationToast, setCancellationToast] = useState({ show: false, count: 0 });

  const orders = useMemo(() => {
    if (!user?.email) return [];
    const userEmailLower = user.email.toLowerCase();
    const userOrders = allOrders.filter((o) => o.userEmail?.toLowerCase() === userEmailLower);
    if (orderFilter === 'cancelled') {
      return userOrders.filter((o) => o.status === 'cancelled' || o.status === 'Cancelled by User');
    }
    return userOrders.filter(
      (o) => o.status === 'awaiting' || o.status === 'processing' || o.status === 'pending' || o.status === 'delivered'
    );
  }, [user, allOrders, orderFilter]);

  const handleCancelOrder = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      type: 'warning',
      confirmText: 'Yes, Cancel',
      onConfirm: () => {
        cancelOrder(id, null);
        setCancellationToast({ show: true, count: 1 });
        setTimeout(() => setCancellationToast({ show: false, count: 0 }), 3000);
      },
    });
  };

  return (
      <ProfileLayout title="Orders" subtitle="Track, return or purchase items again">
        {/* ── Filters ── */}
        <div className="flex bg-(--bg-secondary) p-1 rounded-xl w-full sm:w-auto mb-6">
          {['ongoing', 'cancelled'].map((f) => (
            <button
              key={f}
              className={`flex-1 sm:flex-none whitespace-nowrap px-5 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                orderFilter === f ? 'bg-(--bg-card) text-(--text-primary) shadow-sm' : 'text-(--text-muted) hover:text-(--text-primary)'
              }`}
              onClick={() => setOrderFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Orders List ── */}
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="bg-(--bg-card) rounded-2xl p-4 md:p-6 shadow-sm border border-(--border)">
                <div className="flex flex-wrap justify-between items-start pb-4 mb-4 gap-4 border-b border-(--border)">
                  <div>
                    <p className="text-[10px] text-(--text-muted) uppercase font-bold tracking-wider mb-1">Order No.</p>
                    <p className="text-sm font-black text-(--text-primary)">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-(--text-muted) uppercase font-bold tracking-wider mb-1">Placed On</p>
                    <p className="text-sm font-black text-(--text-primary)">{order.date}</p>
                  </div>
                </div>

                <div className="flex flex-row items-start gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-(--bg-secondary) shrink-0">
                    <MealImage name={order.items[0]?.name} image={order.items[0]?.img || order.items[0]?.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-(--text-primary) truncate">{order.items[0]?.name}</h4>
                    <p className="text-sm text-(--text-muted) mt-1">Qty: {order.items[0]?.quantity}</p>
                    {order.items.length > 1 && (
                      <p className="text-xs font-bold text-(--brand-gold) mt-2 bg-(--brand-gold)/10 px-2 py-1 rounded-md inline-block">
                        + {order.items.length - 1} other item(s)
                      </p>
                    )}
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'Cancelled by User' || order.status === 'cancelled'
                            ? 'bg-red-500/10 text-red-500'
                            : order.status === 'delivered'
                            ? 'bg-green-500/10 text-green-600'
                            : order.status === 'delivering'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-orange-500/10 text-orange-500'
                        }`}
                      >
                        {order.status === 'Cancelled by User' || order.status === 'cancelled'
                          ? 'CANCELLED'
                          : order.status === 'delivered'
                          ? 'DELIVERED'
                          : order.status === 'delivering'
                          ? 'SHIPPED'
                          : 'PROCESSING'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-(--text-primary)">${(order.totalAmount || order.price || 0).toLocaleString('en-US')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-(--border)">
                  {!order.approved && order.status !== 'cancelled' && `${order.status !== 'Cancelled by User'}` && order.status !== 'delivered' && order.status !== 'delivering' && (
                    <button
                      className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors uppercase"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    className="px-6 py-2.5 bg-(--brand-gold) text-white text-xs font-bold rounded-xl hover:brightness-110 transition-all uppercase"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-(--bg-card) rounded-2xl py-20 text-center border border-(--border)">
              <div className="w-20 h-20 bg-(--bg-secondary) rounded-full flex items-center justify-center mx-auto mb-4 text-(--text-muted)">
                <ShoppingBag size={36} />
              </div>
              <h3 className="text-lg font-bold text-(--text-primary) mb-2">No orders found</h3>
              <p className="text-sm text-(--text-muted) mb-6">You haven't placed any orders yet.</p>
              <button className="bg-(--brand-gold) text-white px-8 py-3 rounded-xl text-sm font-bold" onClick={() => navigate('/menu')}>
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* ── Order Details Modal ── */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-2000 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedOrder(null)} />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-2xl bg-(--bg-card) rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-6 flex justify-between items-center border-b border-(--border)">
                  <h3 className="text-xl font-bold text-(--text-primary)">Order Details</h3>
                  <button onClick={() => setSelectedOrder(null)} className="w-9 h-9 bg-(--bg-secondary) rounded-full flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-(--bg-secondary) p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-wider mb-1">Order Number</p>
                      <p className="text-sm font-black text-(--text-primary)">#{selectedOrder.id}</p>
                    </div>
                    <div className="bg-(--bg-secondary) p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-wider mb-1">Status</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedOrder.status === 'delivered' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-(--bg-secondary) rounded-xl">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-(--bg-card) shrink-0">
                          <MealImage name={item.name} image={item.img || item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-(--text-primary) truncate">{item.name}</p>
                          <p className="text-xs text-(--text-muted)">Qty: {item.quantity} &middot; ${item.price.toLocaleString('en-US')} each</p>
                        </div>
                        <p className="text-sm font-black text-(--text-primary)">${(item.quantity * item.price).toLocaleString('en-US')}</p>
                      </div>
                    ))}
                  </div>
                  {selectedOrder.deliveryInfo && (
                    <div className="bg-(--bg-secondary) p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-wider mb-2">Delivery</p>
                      <p className="text-sm font-bold text-(--text-primary)">{selectedOrder.deliveryInfo.fullName}</p>
                      <p className="text-xs text-(--text-muted)">{selectedOrder.deliveryInfo.address}</p>
                    </div>
                  )}
                  <div className="bg-(--bg-secondary) p-4 rounded-xl">
                    <div className="flex justify-between text-sm"><span className="text-(--text-muted)">Subtotal</span><span className="font-bold text-(--text-primary)">${selectedOrder.price.toLocaleString('en-US')}</span></div>
                    <div className="flex justify-between text-sm mt-1"><span className="text-(--text-muted)">Delivery</span><span className="font-bold text-green-500">Free</span></div>
                    <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t border-(--border)"><span>Total</span><span className="text-(--brand-gold)">${selectedOrder.price.toLocaleString('en-US')}</span></div>
                  </div>
                </div>
                <div className="p-6 border-t border-(--border)">
                  <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 bg-(--bg-secondary) hover:bg-(--border) text-(--text-primary) rounded-lg font-bold text-sm transition-colors">
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          confirmText={modalConfig.confirmText}
        />

        <AnimatePresence>
          {cancellationToast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-300 bg-[#111] border border-red-500/30 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-red-500" />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">Order cancelled</h4>
                <p className="text-neutral-500 text-[11px] uppercase tracking-widest font-medium">
                  Cancelled {cancellationToast.count} {cancellationToast.count === 1 ? 'item' : 'items'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ProfileLayout>
  );
}
