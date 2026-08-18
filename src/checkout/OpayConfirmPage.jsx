import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Check, Shield, ExternalLink } from 'lucide-react';
import { formatAmount } from '../utils/paymentConstants';

export default function OpayConfirmPage({ paymentMethod, totalAmount, onConfirm, onBack }) {
  const methodName = paymentMethod === 'opay' ? 'OPay' : 'PalmPay';
  const isOpay = paymentMethod === 'opay';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          Confirm {methodName} Payment
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          You will be redirected to {methodName} to complete payment
        </p>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={isOpay ? "/logos/opay.jpg" : "/logos/palmpay.png"} alt={methodName} className="w-12 h-12 rounded-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">{methodName}</p>
            <p className="text-[11px] text-[var(--text-muted)]">Secure mobile payment</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--brand-gold)]/5 border border-[var(--brand-gold)]/15 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Amount to Pay</span>
            <span className="text-2xl font-black text-[var(--brand-gold)]">{formatAmount(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield size={16} className="text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Secure Redirect</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              You will now be redirected securely to {methodName} to complete your payment.
              Never share your {methodName} password or OTP with anyone.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <motion.button type="button" whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="px-6 py-3 sm:py-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--border)] transition-all cursor-pointer flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </motion.button>
        <motion.button type="button" whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}
          onClick={onConfirm}
          className="flex-1 py-3 sm:py-4 rounded-2xl bg-[var(--brand-gold)] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-gold)]/20 hover:shadow-xl transition-all cursor-pointer">
          Continue with {methodName} <ExternalLink size={16} />
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2">
        <Lock size={12} className="text-emerald-500" />
        <span className="text-[10px] text-[var(--text-muted)] font-medium">Secure checkout - 256-bit SSL encryption</span>
      </div>
    </motion.div>
  );
}
