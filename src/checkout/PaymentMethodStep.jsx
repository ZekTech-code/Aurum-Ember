import { useCallback } from 'react';
import { motion,  } from 'framer-motion';
import { Lock } from 'lucide-react';
import { PAYMENT_METHODS, } from '../utils/paymentConstants';
import PaymentMethodCard from '../components/payment/PaymentMethodCard';
import OrderSummary from '../components/checkout/OrderSummary';

export default function PaymentMethodStep({
  paymentMethod, setPaymentMethod, onNext, onBack,
  totalAmount, cart, subtotal, deliveryFee, deliveryMethod, formData,
  promoCode, setPromoCode, promoDiscount,
}) {
  const isCashlessDisabled = totalAmount < 20;

  const handleSelect = useCallback((methodId) => {
    setPaymentMethod(methodId);
  }, [setPaymentMethod]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-(--text-primary) tracking-tight">Select Payment Method</h1>
        <p className="text-sm text-(--text-muted)">Choose how you would like to pay</p>
      </div>

      <OrderSummary
        cart={cart}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        totalAmount={totalAmount}
        deliveryMethod={deliveryMethod}
        formData={formData}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        promoDiscount={promoDiscount}
        showItems={true}
      />

      <div className="space-y-3">
        <span className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">Available Payment Methods</span>
        {PAYMENT_METHODS.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            isSelected={paymentMethod === method.id}
            onSelect={handleSelect}
            disabled={method.id === 'pay_on_delivery' && isCashlessDisabled}
            disabledMessage={method.id === 'pay_on_delivery' && isCashlessDisabled ? 'Available for orders above $20' : undefined}
          />
        ))}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: paymentMethod ? 0.98 : 1 }}
        whileHover={{ scale: paymentMethod ? 1.01 : 1 }}
        onClick={onNext}
        disabled={!paymentMethod}
        className={`w-full py-3 sm:py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
          paymentMethod
            ? 'bg-(--brand-gold) text-white shadow-lg shadow-(--brand-gold)/20 hover:shadow-xl'
            : 'bg-(--bg-secondary) text-(--text-muted) cursor-not-allowed'
        }`}
      >
        <Lock size={16} />
        {paymentMethod ? 'Confirm Payment Method' : 'Select a payment method to continue'}
      </motion.button>

      <div className="flex gap-3">
        <motion.button type="button" whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="px-6 py-3 sm:py-4 rounded-2xl border border-(--border) bg-(--bg-secondary) text-(--text-primary) font-bold text-sm hover:bg-(--border) transition-all cursor-pointer">
          Back
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Lock size={12} className="text-emerald-500" />
        <span className="text-[10px] text-(--text-muted) font-medium">Secure checkout - 256-bit SSL encryption</span>
      </div>
    </motion.div>
  );
}
