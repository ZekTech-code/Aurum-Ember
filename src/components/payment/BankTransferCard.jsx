import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Copy, Check, Clock, Loader2 } from 'lucide-react';
import { formatAmount } from '../../utils/paymentConstants';

export default function BankTransferCard({ details, amount }) {
  const [copiedField, setCopiedField] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (!details?.expiration) return;
    const update = () => {
      const diff = new Date(details.expiration).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [details?.expiration]);

  if (!details) {
    return (
      <div className="flex flex-col items-center py-12 space-y-4">
        <Loader2 size={28} className="text-[var(--brand-gold)] animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Generating account details...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      className="w-full max-w-lg mx-auto space-y-5"
    >
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-[var(--brand-gold)]/10 flex items-center justify-center mx-auto">
          <Loader2 size={28} className="text-[var(--brand-gold)] animate-spin" />
        </div>
        <p className="text-base font-bold text-[var(--text-primary)]">We are waiting for your payment</p>
        <p className="text-xs text-[var(--text-muted)]">Transfer the exact amount to the account below</p>
      </div>

      <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border)] shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--brand-gold)]/10 to-[var(--brand-gold)]/5 px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[var(--brand-gold)]" />
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Bank Transfer</span>
            </div>
            {timeLeft && timeLeft !== 'Expired' && (
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <Clock size={12} />
                <span className="text-[11px] font-bold">{timeLeft}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Bank Name</span>
            <p className="text-base font-bold text-[var(--text-primary)]">{details.bankName || details.bank_name}</p>
          </div>
          <div className="border-t border-[var(--border)]" />
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Account Name</span>
            <p className="text-sm font-bold text-[var(--text-primary)]">{details.accountName || details.account_name}</p>
          </div>
          <div className="border-t border-[var(--border)]" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Account Number</span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCopy(details.accountNumber || details.account_number, 'account')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--brand-gold)]/10 hover:bg-[var(--brand-gold)]/20 transition-colors cursor-pointer"
              >
                {copiedField === 'account' ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="text-[var(--brand-gold)]" />
                    <span className="text-[10px] font-bold text-[var(--brand-gold)]">Copy</span>
                  </>
                )}
              </motion.button>
            </div>
            <p className="text-2xl font-black text-[var(--brand-gold)] tracking-widest font-mono">
              {details.accountNumber || details.account_number}
            </p>
          </div>
          <div className="border-t border-[var(--border)]" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Amount</span>
            <span className="text-xl font-black text-[var(--brand-gold)]">{formatAmount(amount)}</span>
          </div>
          {details.reference && (
            <>
              <div className="border-t border-[var(--border)]" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Reference</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{details.reference}</span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCopy(details.reference, 'ref')}
                    className="w-7 h-7 rounded-lg bg-[var(--brand-gold)]/10 flex items-center justify-center cursor-pointer hover:bg-[var(--brand-gold)]/20 transition-colors"
                  >
                    {copiedField === 'ref' ? (
                      <Check size={11} className="text-emerald-500" />
                    ) : (
                      <Copy size={11} className="text-[var(--brand-gold)]" />
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[var(--text-muted)] font-medium px-4">
        Payment confirmation may take up to 2 minutes. Do not refresh this page.
      </p>
    </motion.div>
  );
}
