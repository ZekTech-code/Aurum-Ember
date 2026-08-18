import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Clock, ArrowLeft, Lock, Smartphone } from 'lucide-react';
import { formatAmount } from '../utils/paymentConstants';

export default function UssdPage({ details, onBack }) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    if (!details?.expiration) return;
    const exp = new Date(details.expiration).getTime();
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((exp - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [details?.expiration]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(details.ussdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">USSD Payment</h1>
        <p className="text-sm text-[var(--text-muted)]">Dial the code below to complete your payment</p>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Smartphone size={22} className="text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">USSD Code</p>
            <p className="text-[11px] text-[var(--text-muted)]">{details.bankName}</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border-2 border-dashed border-[var(--brand-gold)]/30 rounded-xl p-5 text-center">
          <p className="text-2xl sm:text-3xl font-black text-[var(--brand-gold)] tracking-wider font-mono">
            {details.ussdCode}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-3 rounded-xl bg-[var(--brand-gold)]/10 text-[var(--brand-gold)] font-bold text-sm border border-[var(--brand-gold)]/20 hover:bg-[var(--brand-gold)]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Code</>}
        </button>

        <div className="p-4 bg-[var(--brand-gold)]/5 border border-[var(--brand-gold)]/15 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Amount to Pay</span>
            <span className="text-2xl font-black text-[var(--brand-gold)]">{formatAmount(details.amount)}</span>
          </div>
        </div>

        {timeLeft > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock size={14} className="text-amber-500" />
            <span className="text-[var(--text-muted)]">Expires in <span className="font-bold text-amber-500">{formatTime(timeLeft)}</span></span>
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">How to pay</h4>
        <ol className="space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
          <li className="flex gap-2"><span className="font-bold text-[var(--brand-gold)]">1.</span> Open your phone dialer</li>
          <li className="flex gap-2"><span className="font-bold text-[var(--brand-gold)]">2.</span> Dial the USSD code above</li>
          <li className="flex gap-2"><span className="font-bold text-[var(--brand-gold)]">3.</span> Follow the on-screen prompts</li>
          <li className="flex gap-2"><span className="font-bold text-[var(--brand-gold)]">4.</span> Enter your PIN to authorize payment</li>
          <li className="flex gap-2"><span className="font-bold text-[var(--brand-gold)]">5.</span> Payment will be confirmed automatically</li>
        </ol>
      </div>

      <motion.button type="button" whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="px-6 py-3 sm:py-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--border)] transition-all cursor-pointer flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Payment Methods
      </motion.button>

      <div className="flex items-center justify-center gap-2 mt-2">
        <Lock size={12} className="text-emerald-500" />
        <span className="text-[10px] text-[var(--text-muted)] font-medium">Secure checkout - 256-bit SSL encryption</span>
      </div>
    </motion.div>
  );
}
