import { CreditCard, Smartphone, Zap, Banknote, Landmark, Car } from 'lucide-react';

export const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Card Payment',
    shortName: 'Card',
    description: 'Pay with Visa, Mastercard, or Verve',
    subtext: 'Powered by Paystack',
    icon: CreditCard,
    color: '#72F2A0',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600',
    brands: ['Visa', 'Mastercard', 'Verve'],
    channels: ['card', 'ussd', 'bank'],
    requiresRedirect: false,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer / USSD',
    shortName: 'Bank Transfer',
    description: 'Transfer to a dedicated account or pay via USSD',
    subtext: 'Virtual account provided',
    icon: Landmark,
    color: '#6366F1',
    bgClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-600',
    requiresRedirect: false,
  },
  {
    id: 'opay',
    name: 'OPay',
    shortName: 'OPay',
    description: 'Pay with your OPay wallet',
    subtext: 'Redirects to OPay',
    icon: Smartphone,
    color: '#0A6CFF',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-600',
    channels: ['opay'],
    requiresRedirect: true,
  },
  {
    id: 'palmpay',
    name: 'PalmPay',
    shortName: 'PalmPay',
    description: 'Pay with your PalmPay wallet',
    subtext: 'Redirects to PalmPay',
    icon: Smartphone,
    color: '#00B517',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-600',
    channels: ['palmpay'],
    requiresRedirect: true,
  },
  {
    id: 'pay_on_delivery',
    name: 'Pay on Delivery',
    shortName: 'Pay on Delivery',
    description: 'Pay when your order arrives',
    subtext: 'Cash or transfer to rider',
    icon: Car,
    color: '#F59E0B',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-600',
    requiresRedirect: false,
  },
];

export const PAYMENT_STATUS = {
  INITIALIZED: 'initialized',
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS = {
  AWAITING: 'awaiting',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const LOADING_MESSAGES = {
  preparingCheckout: 'Preparing your order...',
  loadingPaymentMethods: 'Loading payment methods...',
  confirmingPaymentMethod: 'Confirming payment method...',
  initializingPayment: 'Initializing secure payment...',
  connectingOPay: 'Connecting securely to OPay...',
  connectingPalmPay: 'Connecting securely to PalmPay...',
  generatingBankDetails: 'Generating secure payment instructions...',
  redirecting: 'Redirecting to secure payment...',
  waitingPayment: 'Waiting for your payment...',
  verifyingPayment: 'Verifying your payment...',
  finalizingOrder: 'Finalizing your order...',
  creatingOrder: 'Creating your order...',
  loadingOrderConfirmation: 'Loading order confirmation...',
};

export const BRAND_SVGS = {
  Visa: `<svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#1A1F71"/><path d="M19.5 21h-3l1.9-10h3l-1.9 10zm8.8-9.7c-.6-.2-1.5-.5-2.6-.5-2.9 0-4.9 1.5-4.9 3.7 0 1.6 1.5 2.5 2.6 3 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.3 0-2-.2-3-.7l-.4-.2-.4 2.5c.7.3 2 .6 3.4.6 3.1 0 5.1-1.5 5.1-3.8 0-1.3-.8-2.2-2.5-3-.7-.5-1.2-.8-1.2-1.3 0-.4.5-1 1.6-1 1 0 1.7.2 2.2.4l.3.1.5-2.3zm5.3-1h-2.3c-.7 0-1.3.2-1.6.9L26.5 21h3.2l.6-1.7h3.9l.4 1.7h2.8l-2.4-10h-3.3zm-1.8 6.4l.8-2.2.5-1.3.3 1.3.6 2.2h-2.2zM15.1 11l-2.9 6.6-.3-1.3c-.5-1.7-2.1-3.5-3.9-4.4l2.7 8.1h3.2l4.8-9h-3.6z" fill="white"/></svg>`,
  Mastercard: `<svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#252525"/><circle cx="19" cy="16" r="8" fill="#EB001B"/><circle cx="29" cy="16" r="8" fill="#F79E1B"/><path d="M24 10.3a8 8 0 010 11.4 8 8 0 000-11.4z" fill="#FF5F00"/></svg>`,
  Verve: `<svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" rx="4" fill="#F7A600"/><text x="24" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="Arial">VERVE</text></svg>`,
};

export function getPaymentMethodById(id) {
  return PAYMENT_METHODS.find((m) => m.id === id) || PAYMENT_METHODS[0];
}

export function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
