import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, AlertTriangle, X } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import StepIndicator from '../checkout/StepIndicator';
import CheckoutStep from '../checkout/CheckoutStep';
import PaymentMethodStep from '../checkout/PaymentMethodStep';
import ConfirmOrderStep from '../checkout/ConfirmOrderStep';
import PayNowStep from '../checkout/PayNowStep';
import OpayConfirmPage from '../checkout/OpayConfirmPage';
import Toast from '../components/Toast';
import BankTransferCard from '../components/payment/BankTransferCard';
import LoadingTransition from '../components/payment/LoadingTransition';
import UssdPage from '../checkout/UssdPage';
import usePaymentProcessing from '../hooks/usePaymentProcessing';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const {
    currentStep, transitioning, transitionText,
    formData, setFormData, deliveryMethod,
    paymentMethod, setPaymentMethod,
    errors,
    subtotal, deliveryFee, totalAmount, cart, toast, setToast,
    promoCode, setPromoCode, promoDiscount,
    bankTransferDetails, opayPending, palmpayPending, ussdDetails,
    goNext, goBack,
    executePayment,
    cancelBankTransfer, confirmOpayPayment, confirmPalmPayPayment,
    goBackFromPaymentPage,
  } = usePaymentProcessing();

  const isProcessingStep = currentStep === 'processing' && transitioning;
  const isBankWaiting = currentStep === 'processing' && bankTransferDetails && !transitioning;
  const isOpayPending = currentStep === 'processing' && opayPending && !transitioning;
  const isPalmPayPending = currentStep === 'processing' && palmpayPending && !transitioning;
  const isUssdPending = currentStep === 'processing' && ussdDetails && !transitioning;
  const isFullScreen = isProcessingStep || isBankWaiting || isOpayPending || isPalmPayPending || isUssdPending;

  const renderStep = () => {
    if (opayPending && !transitioning) {
      return (
        <OpayConfirmPage
          key="opay-confirm"
          paymentMethod="opay"
          totalAmount={totalAmount}
          onConfirm={confirmOpayPayment}
          onBack={goBackFromPaymentPage}
        />
      );
    }

    if (palmpayPending && !transitioning) {
      return (
        <OpayConfirmPage
          key="palmpay-confirm"
          paymentMethod="palmpay"
          totalAmount={totalAmount}
          onConfirm={confirmPalmPayPayment}
          onBack={goBackFromPaymentPage}
        />
      );
    }

    if (bankTransferDetails && !transitioning) {
      return (
        <BankTransferCard
          key="bank-waiting"
          details={bankTransferDetails}
          amount={totalAmount}
        />
      );
    }

    if (isUssdPending) {
      return (
        <UssdPage
          key="ussd-waiting"
          details={ussdDetails}
          onBack={goBackFromPaymentPage}
        />
      );
    }

    switch (currentStep) {
      case 'select_delivery':
        return (
          <CheckoutStep
            key="select_delivery"
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            deliveryFee={deliveryFee}
            totalAmount={totalAmount}
            subtotal={subtotal}
            cart={cart}
            onNext={goNext}
            onBack={() => navigate('/cart')}
          />
        );

      case 'select_payment':
        return (
          <PaymentMethodStep
            key="select_payment"
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onNext={goNext}
            onBack={goBack}
            totalAmount={totalAmount}
            cart={cart}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            deliveryMethod={deliveryMethod}
            formData={formData}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            promoDiscount={promoDiscount}
          />
        );

      case 'confirm_order':
        return (
          <ConfirmOrderStep
            key="confirm_order"
            formData={formData}
            paymentMethod={paymentMethod}
            cart={cart}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            totalAmount={totalAmount}
            promoDiscount={promoDiscount}
            deliveryMethod={deliveryMethod}
            onConfirm={goNext}
            onBack={goBack}
          />
        );

      case 'pay_now':
        return (
          <PayNowStep
            key="pay_now"
            paymentMethod={paymentMethod}
            cart={cart}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            totalAmount={totalAmount}
            promoDiscount={promoDiscount}
            onPayNow={executePayment}
            onBack={goBack}
          />
        );

      case 'processing':
        return (
          <LoadingTransition
            key="processing"
            messages={[
              'Initializing payment...',
              'Creating your order...',
              'Securing your payment...',
              'Almost there...',
            ]}
            duration={10000}
          />
        );

      default:
        return <LoadingTransition key="default" message="Loading..." duration={2000} />;
    }
  };

  const StepContent = renderStep();

  return (
    <PageLayout>
      <div className="w-full max-w-195 mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isBankWaiting) {
                  setShowCancelModal(true);
                } else if (isOpayPending || isPalmPayPending || isUssdPending) {
                  goBackFromPaymentPage();
                } else if (currentStep === 'select_delivery') {
                  navigate('/cart');
                } else {
                  goBack();
                }
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-(--bg-secondary) border border-(--border) flex items-center justify-center text-(--text-secondary) hover:text-(--brand-gold) hover:border-(--brand-gold)/30 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-(--text-primary)">Checkout</h1>
              <p className="text-[11px] sm:text-xs text-(--text-muted)">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} &middot; {cart.reduce((s, i) => s + i.quantity, 0)} total
              </p>
            </div>
          </div>
        </div>

        {!isFullScreen && (
          <StepIndicator currentStep={currentStep} />
        )}

        {isFullScreen ? (
          <div className="py-4">
            <AnimatePresence mode="wait">
              {StepContent}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-(--bg-card) rounded-[20px] border border-(--border) shadow-md p-4 sm:p-8 transition-colors duration-300">
            {transitioning ? (
              <LoadingTransition
                message={transitionText || 'Loading...'}
                duration={1200}
              />
            ) : (
              <AnimatePresence mode="wait">
                {StepContent}
              </AnimatePresence>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mt-6">
          <Lock size={12} className="text-emerald-500" />
          <span className="text-[10px] text-(--text-muted) font-medium">Secure checkout - 256-bit SSL encryption</span>
        </div>
      </div>

      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-(--bg-card) rounded-2xl border border-(--border) shadow-2xl p-6 sm:p-8 max-w-sm w-full"
            >
              <button
                onClick={() => setShowCancelModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-(--bg-secondary) flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>

              <h3 className="text-lg font-bold text-(--text-primary) text-center mb-2">Cancel Payment?</h3>
              <p className="text-sm text-(--text-muted) text-center leading-relaxed mb-6">
                Your bank transfer payment has not been completed. If you cancel now, the payment will not be processed and your order will be cancelled.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    cancelBankTransfer();
                  }}
                  className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                >
                  Yes, Cancel Payment
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="w-full py-3 rounded-xl bg-(--brand-gold) text-white font-bold text-sm shadow-lg shadow-(--brand-gold)/20 hover:opacity-90 transition-all cursor-pointer"
                >
                  Continue Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
