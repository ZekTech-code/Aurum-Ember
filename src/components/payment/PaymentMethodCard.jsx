import { motion } from 'framer-motion';

function PaymentLogo({ method }) {
  if (method.id === 'opay') {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src="/logos/opay.jpg" alt="OPay" className="w-10 h-10 rounded-full object-cover" />
      </div>
    );
  }
  if (method.id === 'palmpay') {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src="/logos/palmpay.png" alt="PalmPay" className="w-10 h-10 rounded-full object-cover" />
      </div>
    );
  }
  if (method.icon) {
    const Icon = method.icon;
    return (
      <div className={`w-10 h-10 rounded-xl ${method.bgClass} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={method.textClass} />
      </div>
    );
  }
  return null;
}

function BrandPills({ brands }) {
  if (!brands || brands.length === 0) return null;

  const brandColors = {
    Visa: 'bg-[#1A1F71]',
    Mastercard: 'bg-[#EB001B]',
    Verve: 'bg-[#F7A600]',
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {brands.map((brand) => (
        <span
          key={brand}
          className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold tracking-wide text-white ${brandColors[brand] || 'bg-gray-400'}`}
        >
          {brand}
        </span>
      ))}
    </div>
  );
}

export default function PaymentMethodCard({ method, isSelected, onSelect, disabled, disabledMessage }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      whileHover={disabled ? {} : { scale: 1.01 }}
      onClick={() => !disabled && onSelect(method.id)}
      disabled={disabled}
      className={`w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-left ${
        isSelected
          ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)]/5 shadow-lg shadow-[var(--brand-gold)]/10'
          : disabled
          ? 'border-[var(--border)] bg-[var(--bg-card)] opacity-50 cursor-not-allowed'
          : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--brand-gold)]/30'
      }`}
    >
      <PaymentLogo method={method} />

      <div className="flex-1 min-w-0">
        <span className={`text-sm font-bold block ${isSelected ? 'text-[var(--brand-gold)]' : disabled ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
          {method.name}
        </span>
        <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">{method.description}</span>
        {method.brands && <BrandPills brands={method.brands} />}
        {disabled && disabledMessage && (
          <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1 block">{disabledMessage}</span>
        )}
      </div>
    </motion.button>
  );
}
