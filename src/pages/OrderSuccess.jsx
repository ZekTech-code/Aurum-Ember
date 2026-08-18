import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, CreditCard, Banknote, Package, XCircle } from 'lucide-react';
import { PAYMENT_METHODS, formatAmount } from '../utils/paymentConstants';
import PageLayout from '../components/PageLayout';

const PAYMENT_ICONS = {
  card: CreditCard,
  bank_transfer: CreditCard,
  opay: 'opay',
  palmpay: 'palmpay',
  pay_on_delivery: Banknote,
};

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state;

  useEffect(() => {
    if (!order) navigate('/menu');
  }, [order, navigate]);

  if (!order) return null;

  const isPaid = order.paymentStatus === 'paid';
  const isFailed = order.paymentStatus === 'failed' || order.status === 'cancelled';
  const method = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod);
  const PaymentIcon = PAYMENT_ICONS[order.paymentMethod] || CreditCard;

  return (
    <PageLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="bg-(--bg-card) rounded-[2.5rem] border border-(--border) shadow-xl p-8 sm:p-12 max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 12 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
              isFailed
                ? 'bg-red-500 shadow-red-500/30'
                : isPaid
                ? 'bg-emerald-500 shadow-emerald-500/30'
                : 'bg-(--brand-gold) shadow-(--brand-gold)/30'
            }`}
          >
            {isFailed ? (
              <XCircle className="text-white w-10 h-10" strokeWidth={2.5} />
            ) : (
              <CheckCircle className="text-white w-10 h-10" strokeWidth={2.5} />
            )}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-(--text-primary) mb-2"
          >
            {isFailed ? 'Payment Unsuccessful' : isPaid ? 'Payment Successful!' : 'Order Placed!'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-(--text-muted) mb-8 text-sm"
          >
            {isFailed
              ? 'Your payment was not completed within the required time. The order has been cancelled.'
              : isPaid
              ? 'Your payment has been confirmed. We are preparing your order.'
              : order.paymentMethod === 'pay_on_delivery'
              ? 'Your order has been placed. Payment will be collected on delivery.'
              : 'Your order has been placed. We will confirm your payment shortly.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-(--bg-secondary) rounded-2xl p-6 mb-8 text-left space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Order ID</span>
              <span className="font-bold text-(--text-primary) text-sm">{order._id || order.id || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Amount</span>
              <span className={`font-bold text-lg ${isFailed ? 'text-red-500' : 'text-(--brand-gold)'}`}>{formatAmount(order.totalAmount || 0)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Payment</span>
              <div className="flex items-center gap-2">
                {(order.paymentMethod === 'opay' || order.paymentMethod === 'palmpay') ? (
                  <img src={order.paymentMethod === 'opay' ? "/logos/opay.jpg" : "/logos/palmpay.png"} alt={method?.name} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <PaymentIcon size={14} className={isFailed ? 'text-red-500' : isPaid ? 'text-emerald-500' : 'text-amber-500'} />
                )}
                <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${
                  isFailed ? 'bg-red-500/10 text-red-500' : isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {isFailed ? 'Failed' : isPaid ? 'Paid' : method?.name || 'Pending'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Status</span>
              <span className={`font-bold text-sm ${isFailed ? 'text-red-500' : 'text-(--text-primary)'}`}>
                {isFailed ? 'Cancelled' : 'Awaiting Confirmation'}
              </span>
            </div>

            {order.paymentRef && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider">Reference</span>
                <span className="font-bold text-xs text-(--text-primary) font-mono">{order.paymentRef}</span>
              </div>
            )}
          </motion.div>

          <div className="flex flex-col gap-3">
            {isFailed ? (
              <>
                <button
                  onClick={() => navigate('/menu')}
                  className="w-full py-3 sm:py-4 bg-(--brand-gold) text-white rounded-2xl font-bold shadow-lg shadow-(--brand-gold)/20 hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Package size={18} /> Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 sm:py-4 bg-(--bg-secondary) text-(--text-primary) rounded-2xl font-bold hover:bg-(--border) transition-all active:scale-[0.98] cursor-pointer"
                >
                  Back to Home
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/profile/orders')}
                  className="w-full py-3 sm:py-4 bg-(--brand-gold) text-white rounded-2xl font-bold shadow-lg shadow-(--brand-gold)/20 hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Package size={18} /> Track My Order
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 sm:py-4 bg-(--bg-secondary) text-(--text-primary) rounded-2xl font-bold hover:bg-(--border) transition-all active:scale-[0.98] cursor-pointer"
                >
                  Back to Home
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
