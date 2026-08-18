import { motion } from 'framer-motion';
import { Lock, MapPin, CreditCard, ShoppingBag, ArrowLeft, Shield, Banknote } from 'lucide-react';
import { formatAmount, getPaymentMethodById } from '../utils/paymentConstants';

export default function ConfirmOrderStep({
  formData, paymentMethod, cart, subtotal, deliveryFee, totalAmount,
  promoDiscount,onConfirm, onBack,
}) {
  const method = getPaymentMethodById(paymentMethod);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const MethodIcon = method.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-5"
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-(--text-primary) tracking-tight">Confirm Your Order</h1>
        <p className="text-sm text-(--text-muted)">Review everything before proceeding to payment</p>
      </div>

      <div className="bg-(--bg-secondary) rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={16} className="text-(--brand-gold)" />
          <span className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">Delivery Details</span>
        </div>
        <div className="space-y-1.5 text-sm text-(--text-secondary)">
          <p className="font-bold text-(--text-primary)">{formData.fullName}</p>
          <p>{formData.phone}</p>
          <p>{formData.address}{formData.city ? `, ${formData.city}` : ''}{formData.state ? `, ${formData.state}` : ''}</p>
          {formData.notes && <p className="text-(--text-muted) italic text-xs mt-1">Note: {formData.notes}</p>}
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-(--border)">
          <span className="text-[10px] font-bold text-(--brand-gold) uppercase tracking-wider bg-(--brand-gold)/10 px-2 py-0.5 rounded-full">
            Express Delivery
          </span>
        </div>
      </div>

      <div className="bg-(--bg-secondary) rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag size={16} className="text-(--brand-gold)" />
          <span className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">
            Items ({itemCount})
          </span>
        </div>
        <div className="space-y-3">
          {cart.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-(--bg-card) shrink-0 border border-(--border)">
                <img src={item.image || '/images/jollof_rice.jpg'} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-(--text-primary) truncate">{item.name}</p>
                <p className="text-xs text-(--text-muted)">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-(--text-primary)">{formatAmount(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-(--bg-secondary) rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={16} className="text-(--brand-gold)" />
          <span className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">Payment Method</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(paymentMethod === 'opay' || paymentMethod === 'palmpay') ? '' : method.bgClass}`}>
            {(paymentMethod === 'opay' || paymentMethod === 'palmpay') ? (
              <img src={paymentMethod === 'opay' ? "/logos/opay.jpg" : "/logos/palmpay.png"} alt={method.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <MethodIcon size={18} className={method.textClass} />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-(--text-primary)">{method.name}</p>
            <p className="text-xs text-(--text-muted)">{method.subtext}</p>
          </div>
        </div>
      </div>

      <div className="bg-(--bg-secondary) rounded-2xl p-4 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-(--text-muted)">Subtotal</span>
          <span className="font-medium text-(--text-primary)">{formatAmount(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-(--text-muted)">Delivery Fee</span>
          <span className="font-medium text-(--text-primary)">{formatAmount(deliveryFee)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-(--text-muted)">Discount</span>
            <span className="font-medium text-emerald-500">-{formatAmount(promoDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2.5 border-t border-(--border)">
          <span className="text-sm font-bold text-(--text-primary)">Total</span>
          <span className="text-xl font-black text-(--brand-gold)">{formatAmount(totalAmount)}</span>
        </div>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        onClick={onConfirm}
        className="w-full py-4 rounded-2xl bg-(--brand-gold) text-white font-black text-sm tracking-wide shadow-lg shadow-(--brand-gold)/20 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        {paymentMethod === 'pay_on_delivery' ? <Banknote size={16} /> : <Lock size={16} />}
        {paymentMethod === 'pay_on_delivery' ? 'Place Order Now' : 'Confirm Order'}
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="w-full py-3 rounded-2xl border border-(--border) bg-(--bg-secondary) text-(--text-primary) font-bold text-sm hover:bg-(--border) transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <ArrowLeft size={16} /> Back to Payment Methods
      </motion.button>

      <div className="flex items-center justify-center gap-2">
        <Shield size={12} className="text-emerald-500" />
        <span className="text-[10px] text-(--text-muted) font-medium">Your payment is secured with 256-bit SSL encryption</span>
      </div>
    </motion.div>
  );
}
