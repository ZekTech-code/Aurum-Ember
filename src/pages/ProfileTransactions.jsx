import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import ProfileLayout from '../components/ProfileLayout';
import { CreditCard, Banknote, Smartphone, Truck, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const METHOD_META = {
  card: { icon: CreditCard, label: 'Card', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  bank_transfer: { icon: Banknote, label: 'Bank Transfer', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  opay: { icon: null, label: 'OPay', color: 'text-blue-600', bg: 'bg-blue-600/10' },
  palmpay: { icon: null, label: 'PalmPay', color: 'text-green-600', bg: 'bg-green-600/10' },
  pay_on_delivery: { icon: Truck, label: 'Pay on Delivery', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  cod: { icon: Truck, label: 'Pay on Delivery', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ussd: { icon: Smartphone, label: 'USSD', color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

const STATUS_META = {
  paid: { icon: CheckCircle, label: 'Paid', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  pending: { icon: Clock, label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  pending_transfer: { icon: Clock, label: 'Awaiting Transfer', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  refunded: { icon: XCircle, label: 'Refunded', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
};

function getMethod(method) {
  return METHOD_META[method] || METHOD_META.card;
}

function getStatus(status) {
  return STATUS_META[status] || STATUS_META.pending;
}

export default function ProfileTransactions() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const myOrders = useMemo(() => {
    return (orders || [])
      .filter((o) => o.userEmail === user?.email)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, user]);

  const filtered = useMemo(() => {
    if (filter === 'all') return myOrders;
    if (filter === 'paid') return myOrders.filter((o) => o.paymentStatus === 'paid');
    if (filter === 'pending') return myOrders.filter((o) => o.paymentStatus === 'pending' || o.paymentStatus === 'pending_transfer');
    if (filter === 'failed') return myOrders.filter((o) => o.paymentStatus === 'failed' || o.paymentStatus === 'refunded');
    return myOrders;
  }, [myOrders, filter]);

  const totalSpent = myOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const pendingTotal = myOrders
    .filter((o) => o.paymentStatus === 'pending' || o.paymentStatus === 'pending_transfer')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'paid', label: 'Paid' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' },
  ];

  return (
    <ProfileLayout title="Transaction History" subtitle="Your payment and order activity">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mb-1">Total Spent</p>
          <p className="text-lg font-black text-emerald-500">${totalSpent.toLocaleString('en-US')}</p>
        </div>
        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mb-1">Pending</p>
          <p className="text-lg font-black text-amber-500">${pendingTotal.toLocaleString('en-US')}</p>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-(--brand-gold) text-white shadow-lg shadow-(--brand-gold)/20'
                : 'bg-(--bg-secondary) text-(--text-muted) border border-(--border) hover:border-(--brand-gold)/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Transactions List ── */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((order) => {
            const method = getMethod(order.paymentMethod);
            const status = getStatus(order.paymentStatus);
            const MethodIcon = method.icon;
            const StatusIcon = status.icon;
            const isExpanded = expandedId === order._id;
            const orderDate = order.date || order.createdAt;

            return (
              <div
                key={order._id}
                className="bg-(--bg-card) border border-(--border) rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                  className="w-full p-4 flex items-center gap-3 text-left cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${(order.paymentMethod === 'opay' || order.paymentMethod === 'palmpay') ? '' : method.bg}`}>
                    {method.icon ? (
                      <MethodIcon size={18} className={method.color} />
                    ) : (
                      <img src={order.paymentMethod === 'opay' ? "/logos/opay.jpg" : "/logos/palmpay.png"} alt={method.label} className="w-6 h-6 rounded-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-(--text-primary) truncate">Order #{order._id}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${status.bg} ${status.color}`}>
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-(--text-muted) mt-0.5">{method.label} &middot; {orderDate}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <p className="text-sm font-black text-(--text-primary)">${(Number(order.totalAmount) || 0).toLocaleString('en-US')}</p>
                    {isExpanded ? <ChevronUp size={14} className="text-(--text-muted)" /> : <ChevronDown size={14} className="text-(--text-muted)" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-(--border)">
                    <div className="grid grid-cols-2 gap-3 mt-3 text-[11px]">
                      <div>
                        <p className="text-(--text-muted) font-bold mb-1">Items</p>
                        {(order.items || []).map((item, i) => (
                          <p key={i} className="text-(--text-primary)">
                            {item.quantity}x {item.name} — ${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-US')}
                          </p>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-(--text-muted) font-bold">Payment Method</p>
                          <p className="text-(--text-primary)">{method.label}</p>
                        </div>
                        <div>
                          <p className="text-(--text-muted) font-bold">Reference</p>
                          <p className="text-(--text-primary)">{order.paymentRef || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-(--text-muted) font-bold">Delivery</p>
                          <p className="text-(--text-primary)">{order.deliveryInfo?.address || 'N/A'}{order.deliveryInfo?.city ? `, ${order.deliveryInfo.city}` : ''}</p>
                        </div>
                        <div className="pt-2 border-t border-(--border) flex justify-between">
                          <span className="text-(--text-muted) font-bold">Total</span>
                          <span className="font-black text-(--brand-gold)">${(Number(order.totalAmount) || 0).toLocaleString('en-US')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <CreditCard size={32} className="mx-auto text-(--text-muted)/20 mb-3" />
          <p className="text-sm text-(--text-muted) font-bold">No transactions found</p>
        </div>
      )}
    </ProfileLayout>
  );
}
