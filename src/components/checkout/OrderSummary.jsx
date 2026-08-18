import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Truck, MapPin, ChevronDown, ChevronUp, Tag, X, Loader2 } from 'lucide-react';
import { formatAmount } from '../../utils/paymentConstants';
import MealImage from '../MealImage';

export default function OrderSummary({
  cart,
  subtotal,
  deliveryFee,
  totalAmount,
  deliveryMethod,
  formData,
  promoCode,
  setPromoCode,
  promoDiscount,
  showItems = true,
  showDeliveryInfo = false,
}) {
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = () => {
    if (!promoCode?.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setTimeout(() => {
      setPromoLoading(false);
      setPromoError('Invalid promo code');
      setTimeout(() => setPromoError(''), 3000);
    }, 1500);
  };

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-4">
      {showItems && (
        <>
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-[var(--brand-gold)]" />
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Order Summary</span>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} &middot; {totalItems} total
              </span>
              <button
                type="button"
                onClick={() => setItemsExpanded(!itemsExpanded)}
                className="flex items-center gap-1 text-[10px] font-bold text-[var(--brand-gold)] cursor-pointer"
              >
                {itemsExpanded ? 'Hide' : 'View'} items
                {itemsExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            </div>

            <AnimatePresence>
              {itemsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-1">
                    {cart.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--bg-card)] flex-shrink-0 border border-[var(--border)]">
                          <MealImage name={item.name} image={item.image} category={item.category} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[var(--text-primary)] truncate">{item.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{formatAmount(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t border-[var(--border)] pt-3 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Subtotal</span>
                <span className="font-semibold text-[var(--text-primary)]">{formatAmount(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)] flex items-center gap-1">
                  <Truck size={10} /> Delivery
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {deliveryFee === 0 ? <span className="text-emerald-500">Free</span> : formatAmount(deliveryFee)}
                </span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-500">Promo Discount</span>
                  <span className="font-semibold text-emerald-500">-{formatAmount(promoDiscount)}</span>
                </div>
              )}
              <div className="border-t border-[var(--border)] pt-2.5 flex justify-between items-center">
                <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
                <span className="text-xl font-black text-[var(--brand-gold)]">{formatAmount(totalAmount)}</span>
              </div>
            </div>

            {showDeliveryInfo && formData && (
              <div className="border-t border-[var(--border)] pt-2.5 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                <MapPin size={10} />
                <span className="truncate">{formData.address}, {formData.city}</span>
                <span className="mx-0.5">&middot;</span>
                <Truck size={10} />
                <span>{deliveryMethod === 'express' ? 'Express' : 'Standard'}</span>
              </div>
            )}
          </div>

          {setPromoCode && (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Apply promo code"
                  value={promoCode || ''}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-medium placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[var(--brand-gold)]/10 transition-all"
                />
                {promoCode && (
                  <button
                    type="button"
                    onClick={() => setPromoCode('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleApplyPromo}
                disabled={!promoCode?.trim() || promoLoading}
                className="px-5 py-3 rounded-xl bg-[var(--brand-gold)] text-white text-xs font-bold hover:bg-[var(--brand-gold)]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {promoLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
              </motion.button>
            </div>
          )}
          {promoError && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] text-red-500 font-medium">
              {promoError}
            </motion.p>
          )}
        </>
      )}

      {!showItems && (
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Subtotal</span>
            <span className="font-semibold text-[var(--text-primary)]">{formatAmount(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Delivery Fee</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {deliveryFee === 0 ? <span className="text-emerald-500">Free</span> : formatAmount(deliveryFee)}
            </span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-500">Promo Discount</span>
              <span className="font-semibold text-emerald-500">-{formatAmount(promoDiscount)}</span>
            </div>
          )}
          <div className="border-t border-[var(--border)] pt-2.5 flex justify-between items-center">
            <span className="text-base font-bold text-[var(--text-primary)]">Total Amount</span>
            <span className="text-xl font-black text-[var(--brand-gold)]">{formatAmount(totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
