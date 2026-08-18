import { motion } from 'framer-motion';
import { MapPin, CreditCard, Check, ClipboardCheck, Lock } from 'lucide-react';

const STEPS = [
  { id: 'select_delivery', label: 'Delivery', icon: MapPin },
  { id: 'select_payment', label: 'Payment', icon: CreditCard },
  { id: 'confirm_order', label: 'Confirm', icon: ClipboardCheck },
  { id: 'pay_now', label: 'Pay', icon: Lock },
];

const STEP_ORDER = ['select_delivery', 'select_payment', 'confirm_order', 'pay_now', 'processing'];

export default function StepIndicator({ currentStep }) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = STEP_ORDER.indexOf(step.id) === currentIdx;
        const isCompleted = STEP_ORDER.indexOf(step.id) < currentIdx;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted ? 'var(--brand-gold)' : isActive ? 'var(--brand-gold)' : 'var(--bg-secondary)',
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'border-(--brand-gold)'
                    : isActive
                    ? 'border-(--brand-gold) shadow-lg shadow-(--brand-gold)/20'
                    : 'border-(--border)'
                }`}
              >
                {isCompleted ? (
                  <Check size={14} className="text-white" strokeWidth={3} />
                ) : (
                  <Icon size={14} className={isActive ? 'text-white' : 'text-(--text-muted)'} />
                )}
              </motion.div>
              <span className={`text-[11px] font-bold hidden sm:block ${
                isActive ? 'text-(--brand-gold)' : isCompleted ? 'text-(--text-primary)' : 'text-(--text-muted)'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 rounded-full mx-1 ${
                STEP_ORDER.indexOf(step.id) < currentIdx ? 'bg-(--brand-gold)' : 'bg-(--border)'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
