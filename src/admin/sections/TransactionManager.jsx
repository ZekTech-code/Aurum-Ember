import { useState, useMemo } from 'react';
import {
  Search, Download, DollarSign,
  ArrowUpRight, ArrowDownLeft, Calendar,
  ExternalLink, CheckCircle, Clock, XCircle,
  TrendingUp, BarChart3, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generatePdf } from '../../utils/exportPdf';

const PAYMENT_METHODS = {
  card: { label: 'Card', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  bank_transfer: { label: 'Bank Transfer', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  opay: { label: 'OPay', color: 'text-blue-600', bg: 'bg-blue-600/10' },
  palmpay: { label: 'PalmPay', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  pay_on_delivery: { label: 'Pay on Delivery', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  cod: { label: 'Pay on Delivery', color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

const STATUS_CONFIG = {
  paid: { label: 'Paid', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle },
  pending: { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
  unpaid: { label: 'Unpaid', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Clock },
  failed: { label: 'Failed', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
  refunded: { label: 'Refunded', color: 'text-gray-500', bg: 'bg-gray-500/10', icon: XCircle },
  awaiting: { label: 'Awaiting', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Clock },
};

const METHOD_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'card', label: 'Card' },
  { id: 'bank_transfer', label: 'Transfer' },
  { id: 'opay', label: 'OPay' },
  { id: 'palmpay', label: 'PalmPay' },
  { id: 'pay_on_delivery', label: 'Pay on Delivery' },
];

export default function TransactionManager({ orders = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeTab, setActiveTab] = useState('all');

  const transactions = useMemo(() => {
    return (orders || []).map((order) => {
      const ps = (order.paymentStatus || 'unpaid').toLowerCase();
      const pm = (order.paymentMethod || 'pay_on_delivery').toLowerCase();
      const amount = Number(order.totalAmount) || 0;
      const customerName = order.deliveryInfo?.fullName || order.customerName || (order.userEmail ? order.userEmail.split('@')[0].charAt(0).toUpperCase() + order.userEmail.split('@')[0].slice(1) : 'Guest');
      const items = order.items || [];
      const itemCount = items.length;
      const firstItem = items[0]?.name || '';

      return {
        _id: order._id,
        reference: order.paymentRef || `ORD-${String(order._id).slice(-6).toUpperCase()}`,
        email: order.userEmail || 'N/A',
        customerName,
        amount,
        method: pm,
        status: ps,
        orderStatus: order.status || 'unknown',
        date: order.date || order.createdAt || '',
        items: itemCount,
        firstItem,
        orderId: order._id,
      };
    });
  }, [orders]);

  const summary = useMemo(() => {
    const nonCancelled = transactions.filter((t) => t.orderStatus !== 'cancelled');
    const paid = nonCancelled.filter((t) => t.status === 'paid');
    const pending = nonCancelled.filter((t) => ['pending', 'unpaid', 'awaiting'].includes(t.status));
    const failed = nonCancelled.filter((t) => t.status === 'failed');

    const totalRevenue = paid.reduce((sum, t) => sum + t.amount, 0);
    const pendingRevenue = pending.reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = nonCancelled.length;
    const successCount = paid.length;
    const successRate = totalTransactions > 0 ? ((successCount / totalTransactions) * 100).toFixed(1) : '0.0';

    return { totalRevenue, pendingRevenue, totalTransactions, successRate, successCount, paidCount: paid.length, pendingCount: pending.length, failedCount: failed.length };
  }, [transactions]);

  const methodBreakdown = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      if (t.orderStatus === 'cancelled') return;
      const m = t.method || 'pay_on_delivery';
      if (!map[m]) map[m] = { count: 0, totalAmount: 0, paid: 0, pending: 0, failed: 0 };
      map[m].count++;
      map[m].totalAmount += t.amount;
      if (t.status === 'paid') map[m].paid++;
      else if (['pending', 'unpaid', 'awaiting'].includes(t.status)) map[m].pending++;
      else if (t.status === 'failed') map[m].failed++;
    });
    return map;
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.orderStatus === 'cancelled') return false;

      const matchesSearch =
        !searchTerm ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'paid') matchesStatus = t.status === 'paid';
      else if (statusFilter === 'pending') matchesStatus = ['pending', 'unpaid', 'awaiting'].includes(t.status);
      else if (statusFilter === 'failed') matchesStatus = t.status === 'failed';

      let matchesMethod = true;
      if (methodFilter !== 'all') {
        if (methodFilter === 'pay_on_delivery') {
          matchesMethod = t.method === 'pay_on_delivery' || t.method === 'cod';
        } else {
          matchesMethod = t.method === methodFilter;
        }
      }

      let matchesDate = true;
      if (dateRange.start) {
        const d = t.date ? new Date(t.date) : null;
        if (d) matchesDate = matchesDate && d >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        const d = t.date ? new Date(t.date) : null;
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999);
        if (d) matchesDate = matchesDate && d <= end;
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [transactions, searchTerm, statusFilter, methodFilter, dateRange]);

  const statusTabs = [
    { id: 'all', label: 'All', count: summary.totalTransactions },
    { id: 'paid', label: 'Paid', count: summary.paidCount },
    { id: 'pending', label: 'Pending', count: summary.pendingCount },
    { id: 'failed', label: 'Failed', count: summary.failedCount },
  ];

  const formatAmount = (n) => `$${Number(n || 0).toLocaleString('en-US')}`;

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const getMethodInfo = (method) => PAYMENT_METHODS[method] || { label: method || 'N/A', color: 'text-gray-500', bg: 'bg-gray-500/10' };

  const handleExportPdf = () => {
    const headers = ['Reference', 'Customer', 'Method', 'Amount', 'Status', 'Date'];
    const rows = filteredTransactions.map((t) => [
      t.reference,
      t.customerName,
      getMethodInfo(t.method).label,
      formatAmount(t.amount),
      t.status.toUpperCase(),
      t.date ? new Date(t.date).toLocaleDateString() : 'N/A',
    ]);
    generatePdf({
      title: 'Transaction Report',
      subtitle: `${filteredTransactions.length} transactions • ${new Date().toLocaleDateString()}`,
      headers,
      rows,
      fileName: `transactions_${statusFilter}_${new Date().toISOString().split('T')[0]}`,
    });
  };

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-admin-text tracking-tight mb-1">Payment Management</h1>
          <p className="text-xs md:text-sm text-admin-text-muted">All transactions across every payment method and status.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportPdf} className="flex items-center gap-1.5 px-4 md:px-6 py-2.5 bg-accent text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Revenue', value: formatAmount(summary.totalRevenue), icon: DollarSign, color: 'amber' },
          { label: 'Pending Revenue', value: formatAmount(summary.pendingRevenue), icon: ArrowDownLeft, color: 'orange' },
          { label: 'Total Orders', value: summary.totalTransactions, icon: BarChart3, color: 'blue' },
          { label: 'Success Rate', value: `${summary.successRate}%`, icon: TrendingUp, color: 'emerald' },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <div className="admin-panel p-3 md:p-4 bg-admin-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-widest">{stat.label}</p>
                <div className={`w-7 h-7 md:w-8 md:h-8 bg-${stat.color}-500/10 rounded-lg flex items-center justify-center text-${stat.color}-500`}>
                  <stat.icon size={14} />
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-black text-admin-text">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Method Breakdown */}
      {Object.keys(methodBreakdown).length > 0 && (
        <div className="admin-panel p-4 md:p-5 bg-admin-card">
          <h3 className="text-[10px] md:text-xs font-black text-admin-text-muted uppercase tracking-widest mb-3">Payment Method Breakdown</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {Object.entries(methodBreakdown).map(([method, data]) => {
              const info = getMethodInfo(method);
              return (
                <div
                  key={method}
                  className="bg-admin-card rounded-xl p-3 text-center cursor-pointer hover:bg-admin-bg transition-all border border-admin-border"
                  onClick={() => setMethodFilter(methodFilter === method ? 'all' : method)}
                >
                  <p className="text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-1">{info.label}</p>
                  <p className="text-base md:text-lg font-black text-admin-text">{data.count}</p>
                  <p className="text-[10px] text-admin-text-muted">{formatAmount(data.totalAmount)}</p>
                  <div className="flex justify-center gap-2 mt-1">
                    <span className="text-[9px] text-emerald-500 font-bold">{data.paid} paid</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted group-focus-within:text-accent transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search by reference, customer, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 md:py-3 bg-admin-card border border-admin-border rounded-xl text-xs md:text-sm font-semibold text-admin-text outline-none focus:border-accent transition-all shadow-sm placeholder:text-admin-text-muted/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-admin-card rounded-xl shadow-sm overflow-x-auto no-scrollbar">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-admin-text-muted hover:text-accent hover:bg-accent/5'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Method Filter + Date Range */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex items-center p-1 bg-admin-card rounded-xl shadow-sm overflow-x-auto no-scrollbar">
          {METHOD_FILTERS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethodFilter(m.id)}
              className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                methodFilter === m.id
                  ? 'bg-admin-text text-admin-bg shadow-sm'
                  : 'text-admin-text-muted hover:text-admin-text hover:bg-admin-bg/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-admin-text-muted" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="px-2.5 py-1.5 bg-admin-card border border-admin-border rounded-lg text-[10px] md:text-xs font-semibold text-admin-text outline-none focus:border-accent transition-all"
            />
            <span className="text-admin-text-muted text-[10px]">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="px-2.5 py-1.5 bg-admin-card border border-admin-border rounded-lg text-[10px] md:text-xs font-semibold text-admin-text outline-none focus:border-accent transition-all"
            />
          </div>
          {(dateRange.start || dateRange.end) && (
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="px-2 py-1.5 text-[9px] font-black text-accent uppercase tracking-widest hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-widest">
            {filteredTransactions.length} transactions
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[900px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-admin-bg">
                <th className="px-4 md:px-5 py-3.5 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Reference</th>
                <th className="px-4 md:px-5 py-3.5 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Customer</th>
                <th className="px-4 md:px-5 py-3.5 text-left text-[9px] md:text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Method</th>
                <th className="px-4 md:px-5 py-3.5 text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Amount</th>
                <th className="px-4 md:px-5 py-3.5 text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Status</th>
                <th className="px-4 md:px-5 py-3.5 text-right text-[9px] md:text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border/50">
              {filteredTransactions.map((tx) => {
                const st = getStatusConfig(tx.status);
                const StatusIcon = st.icon;
                const mi = getMethodInfo(tx.method);

                return (
                  <tr key={tx._id} className="group hover:bg-accent/[0.02] transition-colors">
                    <td className="px-4 md:px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-black text-xs md:text-sm text-admin-text group-hover:text-accent transition-colors">
                          {tx.reference}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-admin-text-muted font-bold mt-0.5 flex items-center gap-1">
                          <Calendar size={9} className="text-accent" />
                          {tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-5 py-4 whitespace-nowrap">
                      <p className="text-xs md:text-sm font-black text-admin-text">{tx.customerName}</p>
                      <p className="text-[9px] md:text-[10px] text-admin-text-muted truncate max-w-32">{tx.email}</p>
                    </td>
                    <td className="px-4 md:px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest ${mi.bg} ${mi.color}`}>
                        {mi.label}
                      </span>
                    </td>
                    <td className="px-4 md:px-5 py-4 text-right whitespace-nowrap">
                      <p className="font-black text-xs md:text-sm text-admin-text">{formatAmount(tx.amount)}</p>
                    </td>
                    <td className="px-4 md:px-5 py-4 text-center whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${st.bg} ${st.color} text-[9px] md:text-[10px] font-black uppercase tracking-widest`}>
                        <StatusIcon size={10} />
                        {st.label}
                      </div>
                    </td>
                    <td className="px-4 md:px-5 py-4 text-right">
                      <Link
                        to={`/admin/verification/${tx.orderId}`}
                        className="inline-flex items-center gap-1 h-7 px-3 bg-admin-bg hover:bg-accent/10 hover:text-accent border border-admin-border rounded-lg text-admin-text-muted transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100"
                      >
                        View <ExternalLink size={10} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center">
                    <DollarSign size={48} className="mx-auto text-admin-text-muted/10 mb-4" />
                    <h3 className="text-sm md:text-base font-black text-admin-text-muted opacity-30 uppercase tracking-widest">No Transactions Found</h3>
                    <p className="text-[10px] md:text-xs text-admin-text-muted mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
