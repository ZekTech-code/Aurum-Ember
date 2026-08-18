import { motion } from 'framer-motion';
import { User, Phone, MapPin, MessageSquare } from 'lucide-react';
import { formatAmount } from '../utils/paymentConstants';

const inputClass =
  'w-full px-3.5 sm:px-4 py-3 sm:py-3.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[var(--brand-gold)]/10 transition-all duration-300 placeholder:text-[var(--text-muted)]';
const labelClass = 'text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider';
const errorClass = 'text-red-500 text-xs mt-1 font-medium';

export default function CheckoutStep({
  formData, setFormData, errors, deliveryFee, totalAmount, subtotal, cart,
  onNext,
}) {
  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-black text-(--text-primary) tracking-tight">Select Delivery Details</h2>
        <p className="text-sm text-(--text-muted) mt-1">Fill in where your order will be delivered</p>
      </div>

      {/* Order Summary (top) */}
      <div className="bg-(--bg-secondary) rounded-2xl p-5 space-y-3">
        <h4 className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">Order Summary</h4>
        <div className="flex justify-between text-sm">
          <span className="text-(--text-secondary)">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
          <span className="font-semibold text-(--text-primary) tabular-nums">{formatAmount(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-(--text-secondary)">Delivery Fee</span>
          <span className="font-semibold text-(--text-primary) tabular-nums">
            {deliveryFee === 0 ? <span className="text-emerald-500">Free</span> : formatAmount(deliveryFee)}
          </span>
        </div>
        <div className="border-t border-(--border) my-1" />
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-(--text-primary)">Grand Total</span>
          <span className="text-xl font-black text-(--brand-gold) tabular-nums">{formatAmount(totalAmount)}</span>
        </div>
      </div>

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-(--text-muted) uppercase tracking-widest flex items-center gap-2">
          <User size={14} className="text-(--brand-gold)" /> Customer Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <div className="relative mt-1.5">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none" />
              <input type="text" placeholder="Enter your full name" value={formData.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className={`${inputClass} pl-12 sm:pl-14 ${errors.fullName ? 'border-red-500' : ''}`} />
            </div>
            {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
          </div>
          <div>
            <label className={labelClass}>Phone Number *</label>
            <div className="relative mt-1.5">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none" />
              <input type="tel" placeholder="+234 ..." value={formData.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={`${inputClass} pl-12 sm:pl-14 ${errors.phone ? 'border-red-500' : ''}`} />
            </div>
            {errors.phone && <p className={errorClass}>{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-(--text-muted) uppercase tracking-widest flex items-center gap-2">
          <MapPin size={14} className="text-(--brand-gold)" /> Delivery Address
        </h3>
        <div>
          <label className={labelClass}>Street Address *</label>
          <div className="relative mt-1.5">
             <MapPin size={16} className="absolute left-3.5 top-3.5 text-(--text-muted) z-10 pointer-events-none" />
             <input type="text" placeholder="House number, street name..." value={formData.address}
               onChange={(e) => update('address', e.target.value)}
               className={`${inputClass} pl-12 sm:pl-14 ${errors.address ? 'border-red-500' : ''}`} />
          </div>
          {errors.address && <p className={errorClass}>{errors.address}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City / Town *</label>
            <input type="text" placeholder="Enter city" value={formData.city}
              onChange={(e) => update('city', e.target.value)}
              className={`${inputClass} mt-1.5 ${errors.city ? 'border-red-500' : ''}`} />
            {errors.city && <p className={errorClass}>{errors.city}</p>}
          </div>
          <div>
            <label className={labelClass}>State *</label>
            <input type="text" placeholder="Enter state" value={formData.state}
              onChange={(e) => update('state', e.target.value)}
              className={`${inputClass} mt-1.5 ${errors.state ? 'border-red-500' : ''}`} />
            {errors.state && <p className={errorClass}>{errors.state}</p>}
          </div>
        </div>
        <div>
          <label className={labelClass}>Delivery Notes</label>
          <div className="relative mt-1.5">
             <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-(--text-muted) z-10 pointer-events-none" />
             <textarea placeholder="Special instructions for delivery..." value={formData.notes}
               onChange={(e) => update('notes', e.target.value)} rows={2}
               className={`${inputClass} pl-12 sm:pl-14 resize-none`} />
          </div>
        </div>
      </div>

      {/* Button (bottom) */}
      <motion.button type="button" whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}
        onClick={onNext}
        className="w-full py-3 sm:py-4 rounded-2xl bg-(--brand-gold) text-white font-bold text-sm tracking-wide shadow-lg shadow-(--brand-gold)/20 hover:shadow-xl transition-all cursor-pointer">
        Confirm Delivery Details
      </motion.button>
    </motion.div>
  );
}
