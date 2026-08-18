import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import {
  ArrowLeft, CheckCircle, X, Clock,
  CreditCard, Banknote, Truck,
  FileText, ShieldCheck, AlertTriangle,
  CheckCircle2, RefreshCw, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MealImage from '../../components/MealImage';

const VerifyPayment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useOrders();
  const { sendNotification } = useAuth();

  const [order, setOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const found = orders.find(o => String(o._id) === String(orderId));
    if (found) {
      setOrder(found);
    } else {
      setToast({ message: 'Order not found', type: 'error' });
      setTimeout(() => navigate('/admin'), 2000);
    }
  }, [orderId, orders, navigate]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleAction = useCallback((type) => {
    setIsProcessing(true);
    setConfirmAction(null);

    setTimeout(() => {
      const statusMap = {
        approve: { status: 'preparing', paymentStatus: 'paid' },
        reject: { status: 'cancelled', paymentStatus: 'failed' },
        refund: { status: 'cancelled', paymentStatus: 'refunded' },
        pending: { status: order.status, paymentStatus: 'pending' },
      };

      const { status, paymentStatus } = statusMap[type] || statusMap.pending;
      updateOrderStatus(orderId, status, {
        paymentStatus,
        adminNotes: adminNote,
        verifiedAt: new Date().toISOString(),
      });

      const msg = {
        approve: `Payment for Order #${orderId} confirmed.`,
        reject: `Payment for Order #${orderId} rejected. ${adminNote || ''}`,
        refund: `Order #${orderId} refunded.`,
        pending: `Order #${orderId} marked pending.`,
      };

      sendNotification(order.userEmail, msg[type] || msg.pending);
      showToast(`Payment ${type}ed successfully!`, type === 'reject' ? 'error' : 'success');
      setIsProcessing(false);
    }, 1200);
  }, [orderId, order, adminNote, updateOrderStatus, sendNotification, showToast]);

  if (!order) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-admin-text-muted">
        <RefreshCw className="animate-spin mb-4" size={28} />
        <p className="text-[10px] font-black uppercase tracking-widest">Loading order...</p>
      </div>
    );
  }

  const isCOD = order.paymentMethod === 'pay_on_delivery' || order.paymentMethod === 'cod';
  const isPaid = order.paymentStatus === 'paid';
  const isFailed = order.paymentStatus === 'failed';
  const subtotal = (order.subtotal || 0);
  const deliveryFee = (order.deliveryFee || 0);

  const getMethodBadge = (method) => {
    const map = {
      card: { icon: <CreditCard size={13} />, label: 'Card', color: 'blue' },
      bank_transfer: { icon: <Banknote size={13} />, label: 'Bank Transfer', color: 'indigo' },
      pay_on_delivery: { icon: <Truck size={13} />, label: 'Pay on Delivery', color: 'amber' },
      cod: { icon: <Truck size={13} />, label: 'Pay on Delivery', color: 'amber' },
    };
    const m = map[method] || map.card;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-${m.color}-500/10 text-${m.color}-500 border border-${m.color}-500/20`}>
        {m.icon} {m.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      pending_transfer: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      failed: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      refunded: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    };
    return (
      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}>
        {status || 'pending'}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 px-2 sm:px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-admin-card rounded-xl text-admin-text-muted hover:text-accent transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-admin-text">Verify Payment</h1>
            <span className="px-2.5 py-0.5 bg-admin-bg rounded-lg text-[10px] font-black text-admin-text-muted">#{orderId}</span>
          </div>
          <p className="text-[11px] text-admin-text-muted mt-0.5 flex items-center gap-1.5">
            <Clock size={12} /> {order.date || order.createdAt || 'N/A'}
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="admin-panel p-4 bg-admin-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {getMethodBadge(order.paymentMethod)}
          {getStatusBadge(order.paymentStatus)}
        </div>
        <p className="text-2xl font-black text-amber-500">${(Number(order.totalAmount) || 0).toLocaleString('en-US')}</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Items */}
        <div className="lg:col-span-3 admin-panel bg-admin-card overflow-hidden">
          <div className="p-4 border-b border-admin-border flex items-center justify-between">
            <h3 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Order Items</h3>
            <span className="text-[10px] font-black text-accent">{order.items?.length || 0} items</span>
          </div>
          <div className="divide-y divide-admin-border/50">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4">
                <MealImage name={item.name} image={item.image || item.img} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-admin-text truncate">{item.name}</p>
                  <p className="text-[10px] text-admin-text-muted">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-black text-admin-text">${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-US')}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-admin-border space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-admin-text-muted">Subtotal</span>
              <span className="font-bold text-admin-text">${subtotal.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-admin-text-muted">Delivery</span>
              <span className="font-bold text-admin-text">${deliveryFee.toLocaleString('en-US')}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-1.5 border-t border-admin-border">
              <span className="text-admin-text">Total</span>
              <span className="text-amber-500">${(Number(order.totalAmount) || 0).toLocaleString('en-US')}</span>
            </div>
          </div>
        </div>

        {/* Right: Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <div className="admin-panel p-5 bg-admin-card">
            <h3 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-3">Customer</h3>
            <p className="text-sm font-bold text-admin-text">{order.deliveryInfo?.fullName || 'N/A'}</p>
            <p className="text-[11px] text-admin-text-muted">{order.userEmail}</p>
            {order.deliveryInfo?.phone && (
              <p className="text-[11px] text-admin-text-muted mt-0.5">{order.deliveryInfo.phone}</p>
            )}
          </div>

          {/* Payment Details */}
          <div className="admin-panel p-5 bg-admin-card space-y-3">
            <h3 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Payment Details</h3>
            <div className="flex justify-between text-[11px]">
              <span className="text-admin-text-muted">Reference</span>
              <span className="font-bold text-admin-text">{order.paymentRef || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-admin-text-muted">Method</span>
              <span className="font-bold text-admin-text">{order.paymentMethod || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-admin-text-muted">Order Status</span>
              <span className="font-bold text-accent uppercase text-[10px]">{order.status}</span>
            </div>
          </div>

          {/* Receipt — hidden for Pay on Delivery */}
          {!isCOD && (
            <div className="admin-panel p-5 bg-admin-card">
              <h3 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={14} className="text-accent" /> Receipt
              </h3>
              {order.receipt ? (
                <div className="rounded-xl overflow-hidden bg-black/40">
                  <img src={order.receipt} alt="Receipt" className="w-full max-h-64 object-contain" />
                </div>
              ) : (
                <div className="py-8 text-center text-admin-text-muted">
                  <FileText size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No receipt uploaded</p>
                </div>
              )}
            </div>
          )}

          {/* Admin Note */}
          <div className="admin-panel p-5 bg-admin-card">
            <h3 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-3">Admin Note</h3>
            <textarea
              placeholder="Add notes or rejection reason..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full bg-admin-bg border border-admin-border rounded-xl p-3 text-xs font-bold text-admin-text outline-none focus:border-accent transition-all resize-none h-20 placeholder:text-admin-text-muted/40"
            />
          </div>

          {/* Actions */}
          <div className="admin-panel p-5 bg-admin-card space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={isProcessing || isPaid}
                onClick={() => setConfirmAction({ type: 'approve', label: 'Confirm Payment' })}
                className="py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} /> Confirm
              </button>
              <button
                disabled={isProcessing || isFailed || isPaid}
                onClick={() => setConfirmAction({ type: 'reject', label: 'Reject Payment' })}
                className="py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2"
              >
                <X size={14} /> Reject
              </button>
            </div>
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-accent pt-1">
                <RefreshCw className="animate-spin" size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmAction(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-admin-card rounded-3xl p-8 shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
                confirmAction.type === 'approve' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {confirmAction.type === 'approve' ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
              </div>
              <h3 className="text-lg font-black text-admin-text text-center mb-2">{confirmAction.label}?</h3>
              <p className="text-[11px] text-admin-text-muted text-center mb-6 leading-relaxed">
                This will update order #{orderId} and notify the customer.
              </p>
              <div className="space-y-2.5">
                <button
                  onClick={() => handleAction(confirmAction.type)}
                  className={`w-full py-3.5 text-white font-black text-[10px] uppercase tracking-widest rounded-xl ${
                    confirmAction.type === 'approve' ? 'bg-amber-500' : 'bg-rose-500'
                  } hover:scale-[1.02] active:scale-95 transition-all`}
                >
                  Yes, {confirmAction.type === 'approve' ? 'Confirm' : confirmAction.type === 'reject' ? 'Reject' : 'Execute'}
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="w-full py-3.5 bg-admin-bg border border-admin-border text-admin-text-muted font-black text-[10px] uppercase tracking-widest rounded-xl hover:text-admin-text transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[8000] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 text-white ${
              toast.type === 'success' ? 'bg-amber-600' : 'bg-rose-600'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
            <button onClick={() => setToast(null)}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyPayment;
