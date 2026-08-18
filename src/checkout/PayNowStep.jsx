import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Shield, Landmark, Hash, CreditCard, Banknote } from 'lucide-react';
import { formatAmount, getPaymentMethodById } from '../utils/paymentConstants';

const BANK_TRANSFER_SUB = [
  { id: 'bank_transfer', name: 'Bank Transfer', description: 'Pay via dedicated virtual account', icon: Landmark, color: '#6366F1' },
  { id: 'ussd', name: 'USSD Payment', description: 'Dial a USSD code to pay', icon: Hash, color: '#8B5CF6' },
];

const METHOD_ICONS = {
  card: CreditCard,
  opay: null,
  palmpay: null,
  pay_on_delivery: Banknote,
  bank_transfer: Landmark,
};

export default function PayNowStep({
  paymentMethod, cart, subtotal, deliveryFee, totalAmount, promoDiscount,
  onPayNow, onBack,
}) {
  const method = getPaymentMethodById(paymentMethod);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const isBankTransfer = paymentMethod === 'bank_transfer';
  const [subMethod, setSubMethod] = useState(null);

  const handlePayNow = () => {
    if (isBankTransfer) {
      onPayNow(subMethod);
    } else {
      onPayNow(paymentMethod);
    }
  };

  const canPay = isBankTransfer ? subMethod !== null : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5"
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">Pay Now</h1>
        <p className="text-sm text-[var(--text-muted)]">Complete your payment to place the order</p>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          <span className="text-sm text-[var(--text-muted)]">Subtotal: {formatAmount(subtotal)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-muted)]">Discount</span>
            <span className="text-sm text-emerald-500">-{formatAmount(promoDiscount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">Delivery</span>
          <span className="text-sm text-[var(--text-muted)]">{formatAmount(deliveryFee)}</span>
        </div>
        <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border)]">
          <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
          <span className="text-2xl font-black text-[var(--brand-gold)]">{formatAmount(totalAmount)}</span>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(paymentMethod === 'opay' || paymentMethod === 'palmpay') ? '' : method.bgClass}`}>
            {(paymentMethod === 'opay' || paymentMethod === 'palmpay') ? (
              <img src={paymentMethod === 'opay' ? "/logos/opay.jpg" : "/logos/palmpay.png"} alt={method.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (() => {
              const MIcon = METHOD_ICONS[paymentMethod] || CreditCard;
              return <MIcon size={18} className={method.textClass} />;
            })()}
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">{method.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{method.subtext}</p>
          </div>
        </div>

        {isBankTransfer && (
          <div className="pt-3 border-t border-[var(--border)] space-y-3">
            <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Choose payment type</p>
            <div className="space-y-2">
              {BANK_TRANSFER_SUB.map((sub) => {
                const SubIcon = sub.icon;
                const isSelected = subMethod === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubMethod(sub.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)]/5'
                        : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)]' : 'border-[var(--text-muted)]'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[var(--brand-gold)]/10' : 'bg-[var(--bg-secondary)]'}`}>
                      <SubIcon size={18} className={isSelected ? 'text-[var(--brand-gold)]' : sub.color ? `text-[${sub.color}]` : 'text-[var(--text-muted)]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isSelected ? 'text-[var(--brand-gold)]' : 'text-[var(--text-primary)]'}`}>{sub.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{sub.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: canPay ? 0.98 : 1 }}
        whileHover={{ scale: canPay ? 1.01 : 1 }}
        onClick={handlePayNow}
        disabled={!canPay}
        className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
          canPay
            ? 'bg-[var(--brand-gold)] text-white shadow-lg shadow-[var(--brand-gold)]/20 hover:shadow-xl'
            : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
        }`}
      >
        <Lock size={16} />
        {canPay
          ? `Pay ${formatAmount(totalAmount)} (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`
          : 'Select a payment option to continue'
        }
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="w-full py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--border)] transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <div className="flex items-center justify-center gap-2">
        <Shield size={12} className="text-emerald-500" />
        <span className="text-[10px] text-[var(--text-muted)] font-medium">Your payment is secured with 256-bit SSL encryption</span>
      </div>
    </motion.div>
  );
}
