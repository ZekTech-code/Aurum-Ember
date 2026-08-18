import { motion } from 'framer-motion';

function Pulse({ className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, delay, ease: 'easeInOut' }}
      className={`bg-(--border) rounded-xl ${className}`}
    />
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Pulse className="w-10 h-10 rounded-xl" delay={0} />
        <div className="space-y-2">
          <Pulse className="w-48 h-5 rounded-lg" delay={0.1} />
          <Pulse className="w-32 h-3 rounded-lg" delay={0.2} />
        </div>
      </div>
      <div className="space-y-4">
        <Pulse className="w-full h-12 rounded-xl" delay={0.1} />
        <Pulse className="w-full h-12 rounded-xl" delay={0.2} />
        <div className="grid grid-cols-2 gap-4">
          <Pulse className="w-full h-12 rounded-xl" delay={0.3} />
          <Pulse className="w-full h-12 rounded-xl" delay={0.4} />
        </div>
      </div>
      <Pulse className="w-full h-14 rounded-2xl" delay={0.5} />
    </div>
  );
}

export function PaymentMethodSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <Pulse className="w-10 h-10 rounded-xl" delay={0} />
        <div className="space-y-2">
          <Pulse className="w-40 h-5 rounded-lg" delay={0.1} />
          <Pulse className="w-56 h-3 rounded-lg" delay={0.2} />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-(--border)">
          <Pulse className="w-12 h-12 rounded-xl shrink-0" delay={0.1 * i} />
          <div className="flex-1 space-y-2">
            <Pulse className="w-32 h-4 rounded-lg" delay={0.15 * i} />
            <Pulse className="w-48 h-3 rounded-lg" delay={0.2 * i} />
            <div className="flex gap-2 mt-1">
              <Pulse className="w-12 h-4 rounded-full" delay={0.25 * i} />
              <Pulse className="w-16 h-4 rounded-full" delay={0.3 * i} />
              <Pulse className="w-10 h-4 rounded-full" delay={0.35 * i} />
            </div>
          </div>
          <Pulse className="w-5 h-5 rounded-full shrink-0" delay={0.2 * i} />
        </div>
      ))}
      <div className="flex gap-3 mt-4">
        <Pulse className="w-24 h-14 rounded-2xl" delay={0.6} />
        <Pulse className="flex-1 h-14 rounded-2xl" delay={0.7} />
      </div>
    </div>
  );
}

export function OrderSummarySkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <Pulse className="w-10 h-10 rounded-xl" delay={0} />
        <div className="space-y-2">
          <Pulse className="w-44 h-5 rounded-lg" delay={0.1} />
          <Pulse className="w-60 h-3 rounded-lg" delay={0.2} />
        </div>
      </div>
      <div className="bg-(--bg-secondary) rounded-2xl p-5 space-y-3">
        <Pulse className="w-20 h-3 rounded-lg" delay={0.15} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-(--bg-card) rounded-xl">
            <Pulse className="w-12 h-12 rounded-lg shrink-0" delay={0.2 + i * 0.1} />
            <div className="flex-1 space-y-1.5">
              <Pulse className="w-28 h-4 rounded-lg" delay={0.25 + i * 0.1} />
              <Pulse className="w-16 h-3 rounded-lg" delay={0.3 + i * 0.1} />
            </div>
            <Pulse className="w-16 h-4 rounded-lg shrink-0" delay={0.35 + i * 0.1} />
          </div>
        ))}
      </div>
      <div className="bg-(--bg-secondary) rounded-2xl p-5 space-y-3">
        <Pulse className="w-28 h-3 rounded-lg" delay={0.5} />
        <Pulse className="w-full h-4 rounded-lg" delay={0.55} />
        <Pulse className="w-3/4 h-4 rounded-lg" delay={0.6} />
      </div>
      <div className="bg-(--bg-secondary) rounded-2xl p-5 space-y-3">
        <Pulse className="w-24 h-3 rounded-lg" delay={0.65} />
        <div className="flex justify-between">
          <Pulse className="w-16 h-4 rounded-lg" delay={0.7} />
          <Pulse className="w-20 h-4 rounded-lg" delay={0.75} />
        </div>
        <div className="flex justify-between">
          <Pulse className="w-16 h-4 rounded-lg" delay={0.8} />
          <Pulse className="w-12 h-4 rounded-lg" delay={0.85} />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <Pulse className="w-24 h-14 rounded-2xl" delay={0.9} />
        <Pulse className="flex-1 h-14 rounded-2xl" delay={0.95} />
      </div>
    </div>
  );
}

export function PaymentProcessingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <Pulse className="w-10 h-10 rounded-xl" delay={0} />
        <div className="space-y-2">
          <Pulse className="w-52 h-5 rounded-lg" delay={0.1} />
          <Pulse className="w-72 h-3 rounded-lg" delay={0.2} />
        </div>
      </div>
      <div className="bg-(--bg-secondary) rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Pulse className="w-12 h-12 rounded-xl" delay={0.1} />
          <div className="space-y-2">
            <Pulse className="w-36 h-4 rounded-lg" delay={0.15} />
            <Pulse className="w-24 h-3 rounded-lg" delay={0.2} />
          </div>
        </div>
        <Pulse className="w-full h-px" delay={0.25} />
        <div className="flex justify-between">
          <Pulse className="w-28 h-3 rounded-lg" delay={0.3} />
          <Pulse className="w-16 h-3 rounded-lg" delay={0.35} />
        </div>
        <div className="flex justify-between">
          <Pulse className="w-20 h-3 rounded-lg" delay={0.4} />
          <Pulse className="w-20 h-3 rounded-lg" delay={0.45} />
        </div>
        <div className="flex justify-between">
          <Pulse className="w-16 h-4 rounded-lg" delay={0.5} />
          <Pulse className="w-24 h-5 rounded-lg" delay={0.55} />
        </div>
      </div>
      <div className="flex justify-between items-center p-4 bg-(--bg-secondary) rounded-xl">
        <Pulse className="w-32 h-4 rounded-lg" delay={0.6} />
        <Pulse className="w-24 h-5 rounded-lg" delay={0.65} />
      </div>
      <div className="flex gap-3 mt-4">
        <Pulse className="w-24 h-14 rounded-2xl" delay={0.7} />
        <Pulse className="flex-1 h-14 rounded-2xl" delay={0.75} />
      </div>
    </div>
  );
}

export function ConfirmOrderSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <Pulse className="w-10 h-10 rounded-xl" delay={0} />
        <div className="space-y-2">
          <Pulse className="w-36 h-5 rounded-lg" delay={0.1} />
          <Pulse className="w-64 h-3 rounded-lg" delay={0.2} />
        </div>
      </div>
      <div className="bg-(--bg-secondary) rounded-2xl p-5 space-y-3">
        <Pulse className="w-36 h-3 rounded-lg" delay={0.15} />
        <Pulse className="w-full h-4 rounded-lg" delay={0.2} />
        <Pulse className="w-3/4 h-4 rounded-lg" delay={0.25} />
        <Pulse className="w-1/2 h-4 rounded-lg" delay={0.3} />
      </div>
      <div className="bg-(--bg-secondary) rounded-2xl p-5 space-y-3">
        <Pulse className="w-32 h-3 rounded-lg" delay={0.35} />
        <Pulse className="w-full h-4 rounded-lg" delay={0.4} />
        <Pulse className="w-2/3 h-4 rounded-lg" delay={0.45} />
      </div>
      <div className="bg-(--bg-secondary) rounded-2xl p-5 space-y-3">
        <Pulse className="w-28 h-3 rounded-lg" delay={0.5} />
        <div className="flex items-center gap-3">
          <Pulse className="w-10 h-10 rounded-xl" delay={0.55} />
          <Pulse className="w-32 h-4 rounded-lg" delay={0.6} />
        </div>
      </div>
      <div className="bg-(--bg-secondary) rounded-2xl p-5 space-y-3">
        <Pulse className="w-24 h-3 rounded-lg" delay={0.65} />
        <div className="flex justify-between">
          <Pulse className="w-16 h-4 rounded-lg" delay={0.7} />
          <Pulse className="w-20 h-4 rounded-lg" delay={0.75} />
        </div>
        <div className="flex justify-between">
          <Pulse className="w-16 h-4 rounded-lg" delay={0.8} />
          <Pulse className="w-12 h-4 rounded-lg" delay={0.85} />
        </div>
        <Pulse className="w-full h-px" delay={0.9} />
        <div className="flex justify-between items-center">
          <Pulse className="w-16 h-5 rounded-lg" delay={0.95} />
          <Pulse className="w-24 h-6 rounded-lg" delay={1.0} />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <Pulse className="w-24 h-14 rounded-2xl" delay={1.05} />
        <Pulse className="flex-1 h-14 rounded-2xl" delay={1.1} />
      </div>
    </div>
  );
}

export function VerifyingPaymentSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-(--border) border-t-(--brand-gold) rounded-full"
      />
      <div className="text-center space-y-2">
        <Pulse className="w-48 h-5 rounded-lg mx-auto" />
        <Pulse className="w-64 h-3 rounded-lg mx-auto" />
      </div>
    </div>
  );
}

export function StepTransitionSkeleton({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-5">
      <motion.div
        className="relative w-14 h-14"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-3 border-(--border) border-t-(--brand-gold) rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-1.5 border-2 border-(--border) border-b-(--brand-gold)/50 rounded-full"
        />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-bold text-(--text-muted) tracking-wide"
      >
        {text}
      </motion.p>
    </div>
  );
}
