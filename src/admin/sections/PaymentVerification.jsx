/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, Clock, ShieldCheck, 
  Info, AlertCircle, Eye, X, Ban,
  CreditCard, Wallet, Banknote, Truck,
  Search, Filter, Download, MoreHorizontal,
  Mail, MessageSquare, ArrowUpRight, ArrowDownRight,
  RefreshCw, Trash2, CheckCircle2, AlertTriangle,
  FileText, History, DollarSign, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MealImage from '../../components/MealImage';
import { generatePdf } from '../../utils/exportPdf';

// Helper function to format date nicely
const formatOrderDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  // Parse the date string like "Mon, May 26, 2026, 03:45:30 PM"
  const parts = dateString.split(', ');
  if (parts.length >= 2) {
    const dayOfWeek = parts[0]; // Mon, Tue, etc
    const restDate = parts.slice(1).join(', '); // May 26, 2026, 03:45:30 PM
    return {
      full: dateString,
      dayOfWeek: dayOfWeek,
      dateTime: restDate
    };
  }
  return { full: dateString, dayOfWeek: '', dateTime: dateString };
};

// Skeleton Loader Component
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-6"><div className="w-20 h-4 bg-admin-card rounded" /></td>
    <td className="px-6 py-6"><div className="w-24 h-4 bg-admin-card rounded" /></td>
    <td className="px-6 py-6"><div className="w-16 h-4 bg-admin-card rounded" /></td>
    <td className="px-6 py-6"><div className="w-20 h-6 bg-admin-card rounded-lg" /></td>
    <td className="px-6 py-6"><div className="w-16 h-6 bg-admin-card rounded-full" /></td>
    <td className="px-6 py-6"><div className="w-20 h-8 bg-admin-card rounded-xl" /></td>
  </tr>
);

// Toast Component
const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-5000 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
      type === 'success' ? 'bg-amber-500 border-amber-400 text-white' : 
      type === 'error' ? 'bg-rose-500 border-rose-400 text-white' : 
      'bg-amber-500 border-amber-400 text-white'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
    <span className="font-bold text-sm tracking-wide">{message}</span>
    <button onClick={onClose} className="ml-2 hover:bg-white/10 p-1 rounded-lg transition-colors">
      <X size={16} />
    </button>
  </motion.div>
);

const PaymentVerification = ({ orders, updateOrderStatus, sendNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('ae-admin-token');
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : (data.users || []));
      } catch (e) {
        console.error("Failed to fetch users:", e);
      }
    };
    fetchUsers();
  }, []);

  // Helper function to get real customer name
  const getCustomerName = (order) => {
    // Try multiple sources for the customer name
    if (order.deliveryInfo?.fullName) return order.deliveryInfo.fullName;
    if (order.customerName) return order.customerName;
    if (order.userEmail) {
      // Extract name from email
      const emailName = order.userEmail.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Guest Account';
  };

  // Helper function to get payment method badge
  const getPaymentBadge = (method) => {
    switch (method?.toLowerCase()) {
      case 'card': 
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-600 text-xs font-bold">
            <CreditCard size={12} />
            <span>Card</span>
          </div>
        );
      case 'bank_transfer': 
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 text-xs font-bold">
            <Wallet size={12} />
            <span>Bank Transfer</span>
          </div>
        );
      case 'pay_on_delivery':
      case 'cod': 
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 text-xs font-bold">
            <Banknote size={12} />
            <span>Pay on Delivery</span>
          </div>
        );
      default: 
        const displayMethod = method ? method.replace(/([A-Z])/g, ' $1').trim() : 'Unknown';
        return (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/10 border border-gray-500/30 rounded-lg text-gray-600 text-xs font-bold">
            <DollarSign size={12} />
            <span>{displayMethod}</span>
          </div>
        );
    }
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const exportPaymentReport = () => {
    generatePdf({
      title: 'Payment Verification Report',
      subtitle: `${filteredOrders.length} records • ${statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`,
      headers: ['Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'],
      rows: filteredOrders.map(o => [
        `#${o._id}`,
        getCustomerName(o),
        `$${(Number(o.totalAmount) || 0).toLocaleString('en-US')}`,
        o.paymentMethod || 'N/A',
        o.paymentStatus || 'Pending',
        o.date || 'N/A'
      ]),
      fileName: `payment_verification_report_${new Date().toISOString().split('T')[0]}`
    });
  };

  // Filter Logic
  const pendingStatuses = ['pending', 'processing', 'unpaid'];

  const filteredOrders = (orders || [])
    .filter(order => {
      const matchesSearch = 
        (order._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.deliveryInfo?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.paymentRef || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'pending' && pendingStatuses.includes(order.paymentStatus)) ||
        (statusFilter === 'paid' && order.paymentStatus === 'paid') ||
        (statusFilter === 'failed' && order.paymentStatus === 'failed');
      
      const matchesMethod = methodFilter === 'all' || order.paymentMethod === methodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Stats
  const nonCancelledOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const pendingCount = orders.filter(o => pendingStatuses.includes(o.paymentStatus) && o.status !== 'cancelled').length;
  const successCount = orders.filter(o => o.paymentStatus === 'paid').length;
  const failedCount = orders.filter(o => o.paymentStatus === 'failed').length;
  const totalOrders = nonCancelledOrders.length || 1;
  const successRate = ((successCount / totalOrders) * 100).toFixed(0);
  const failedRate = ((failedCount / totalOrders) * 100).toFixed(0);

  const handleAction = (orderId, action, extraData = {}) => {
    setConfirmDialog(null);
    const order = orders.find(o => String(o._id) === String(orderId));
    
    if (action === 'approve') {
      updateOrderStatus(orderId, 'processing', { paymentStatus: 'paid', paymentConfirmedAt: new Date().toISOString() });
      sendNotification(
        order.userEmail, 
        `Payment Confirmed! Your Order #${orderId} is now being prepared. Total: $${(Number(order.totalAmount) || 0).toLocaleString('en-US')}`
      );
      showToast(`Payment for #${orderId} approved successfully`);
    } else if (action === 'reject') {
      updateOrderStatus(orderId, 'cancelled', { paymentStatus: 'failed', rejectionReason: extraData.reason });
      sendNotification(
        order.userEmail, 
        `Payment Rejected for Order #${orderId}. Reason: ${extraData.reason || 'Invalid transaction proof'}`
      );
      showToast(`Payment for #${orderId} rejected`, 'error');
    } else if (action === 'refund') {
      updateOrderStatus(orderId, 'cancelled', { paymentStatus: 'refunded' });
      sendNotification(order.userEmail, `A refund has been processed for Order #${orderId}.`);
      showToast(`Refund processed for #${orderId}`, 'info');
    }
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'card': return <CreditCard size={16} />;
      case 'bank_transfer': return <Banknote size={16} />;
      case 'cod': 
      case 'pay_on_delivery': return <Truck size={16} />;
      default: return <DollarSign size={16} />;
    }
  };

  return (
    <div className="space-y-5 md:space-y-8 pb-16 md:pb-20">
      {/* Header & Stats Container */}
      <div className="flex flex-col gap-5 md:gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2 md:mb-3 flex items-center gap-2">
              <ShieldCheck size={12} /> Financial Integrity
            </p>
            <h1 className="text-2xl md:text-4xl font-black text-admin-text tracking-tight">Payment Verification</h1>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setIsLoading(true)} className="p-2 md:p-3 bg-admin-card border border-admin-border rounded-xl text-admin-text-muted hover:text-accent transition-all">
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
             </button>
             <button onClick={exportPaymentReport} className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-3 bg-accent text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-105 transition-all">
                <Download size={14} /> Export Report
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString('en-US')}`} icon={<DollarSign />} trend={`${totalOrders} orders`} color="accent" />
          <StatCard label="Pending Approval" value={pendingCount} icon={<Clock />} trend={pendingCount > 0 ? 'Needs action' : 'Clear'} color="amber" />
          <StatCard label="Successful" value={successCount} icon={<CheckCircle />} trend={`${successRate}%`} color="amber" />
          <StatCard label="Failed/Rejected" value={failedCount} icon={<AlertCircle />} trend={`${failedRate}%`} color="rose" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 md:gap-4 p-3 md:p-4 bg-admin-card rounded-2xl md:rounded-3xl border border-admin-border">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-admin-text-muted group-focus-within:text-accent transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer, or Reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 bg-admin-card border border-admin-border rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-admin-text outline-none focus:border-accent transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 md:px-4 py-2.5 md:py-3 bg-admin-card border border-admin-border rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black text-admin-text uppercase tracking-widest outline-none focus:border-accent transition-all appearance-none cursor-pointer min-w-0 md:min-w-35"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="paid">Confirmed Paid</option>
            <option value="failed">Failed/Rejected</option>
          </select>
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 md:px-4 py-2.5 md:py-3 bg-admin-card border border-admin-border rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black text-admin-text uppercase tracking-widest outline-none focus:border-accent transition-all appearance-none cursor-pointer min-w-0 md:min-w-35"
          >
            <option value="all">All Methods</option>
            <option value="card">Card / Debit</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="pay_on_delivery">Pay on Delivery</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="admin-panel bg-admin-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-admin-bg border-b border-admin-border">
                <th className="px-6 py-5 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-6 py-5 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Customer</th>
                <th className="px-6 py-5 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Method</th>
                <th className="px-6 py-5 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border/50">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const customerAvatar = order.userAvatar || users.find(u => u.email.toLowerCase() === order.userEmail.toLowerCase())?.avatar || null;

                  return (
                    <motion.tr 
                      layout
                      key={order._id} 
                      className="hover:bg-admin-surface-hover transition-colors group"
                    >
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-admin-text">#{order._id}</span>
                        <span className="text-[10px] text-admin-text-muted font-bold mt-1 uppercase flex items-center gap-1.5">
                          <Clock size={10} className="text-accent" />
                          {(() => {
                            const dateInfo = formatOrderDate(order.date);
                            return (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-accent font-black">{dateInfo.dayOfWeek}</span>
                                <span className="text-admin-text-muted text-[9px]">{dateInfo.dateTime}</span>
                              </div>
                            );
                          })()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 overflow-hidden shadow-inner">
                           <img 
                             src={customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getCustomerName(order))}&background=EAB308&color=fff&bold=true`} 
                             alt="" 
                             className="w-full h-full object-cover" 
                             onError={(e) => {
                               e.target.onerror = null;
                               e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getCustomerName(order))}&background=EAB308&color=fff&bold=true`;
                             }}
                           />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-admin-text">{getCustomerName(order)}</span>
                          <span className="text-[10px] text-admin-text-muted truncate max-w-37.5">{order.userEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-admin-text">${(Number(order.totalAmount) || 0).toLocaleString('en-US')}</span>
                        <span className="text-[9px] text-admin-text-muted uppercase tracking-widest">{order.items?.length || 0} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        {getPaymentBadge(order.paymentMethod)}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <StatusBadge status={order.paymentStatus || 'pending'} />
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/admin/verification/${order._id}`}
                          className="p-2.5 bg-admin-bg hover:bg-admin-border border border-admin-border rounded-xl text-admin-text-muted hover:text-accent transition-all"
                          title="Verify Receipt"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/admin/verification/${order._id}`}
                          className="p-2.5 bg-admin-bg hover:bg-admin-border border border-admin-border rounded-xl text-admin-text-muted hover:text-admin-text transition-all"
                          title="Full Details"
                        >
                          <FileText size={18} />
                        </Link>
                        
                        {pendingStatuses.includes(order.paymentStatus) && order.status !== 'cancelled' && (
                          <div className="flex items-center gap-2 ml-2">
                            <button 
                              onClick={() => setConfirmDialog({ orderId: order._id, type: 'approve' })}
                              className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => setConfirmDialog({ orderId: order._id, type: 'reject' })}
                              className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                              title="Reject Payment"
                            >
                              <Ban size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
              ) : (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <ShieldCheck size={64} className="mb-4 text-admin-text-muted" />
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-admin-text-muted">No Payment Records Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <ModalWrapper onClose={() => setSelectedOrder(null)} title={`Order Details: #${selectedOrder._id}`}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-admin-bg rounded-2xl">
                   <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Customer Info</p>
                  <p className="text-sm font-bold text-admin-text">{getCustomerName(selectedOrder)}</p>
                  <p className="text-xs text-admin-text-muted">{selectedOrder.userEmail}</p>
                  <p className="text-xs text-admin-text-muted mt-1">{selectedOrder.deliveryInfo?.phone}</p>
                </div>
                <div className="p-4 bg-admin-bg rounded-2xl">
                   <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-2">Payment Info</p>
                  <div className="mb-2">{getPaymentBadge(selectedOrder.paymentMethod)}</div>
                  <p className="text-xs text-admin-text-muted">Ref: {selectedOrder.paymentRef || 'N/A'}</p>
                  <p className="text-xs font-black text-amber-500 mt-1">${(Number(selectedOrder.totalAmount) || 0).toLocaleString('en-US')}</p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-4">Ordered Items</p>
                <div className="space-y-3 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-admin-bg rounded-xl transition-all">
                      <div className="w-10 h-10 rounded-lg bg-admin-bg flex items-center justify-center shrink-0 overflow-hidden">
                        <MealImage name={item.name} image={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-admin-text truncate">{item.name}</p>
                        <p className="text-[10px] text-admin-text-muted">Qty: {item.quantity} • ${(Number(item.price) || 0).toLocaleString('en-US')}</p>
                      </div>
                      <p className="text-sm font-black text-admin-text">${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-US')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-4 bg-admin-bg border border-admin-border text-admin-text font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-admin-border transition-all"
                >
                  Close
                </button>
                <button className="flex-1 py-4 bg-accent/10 text-accent border border-accent/20 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-accent/20 transition-all flex items-center justify-center gap-2">
                  <Mail size={16} /> Message User
                </button>
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Receipt Verification Modal */}
      <AnimatePresence>
        {viewingReceipt && (
          <ModalWrapper onClose={() => setViewingReceipt(null)} title="Payment Verification">
            <div className="space-y-6">
              <div className="aspect-4/3 bg-black rounded-2xl overflow-hidden group relative">
                {viewingReceipt.receipt ? (
                  <img src={viewingReceipt.receipt} alt="Proof" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-admin-text-muted opacity-30">
                    <History size={48} className="mb-4" />
                    <p>No receipt uploaded</p>
                  </div>
                )}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <a href={viewingReceipt.receipt} target="_blank" rel="noreferrer" className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-all">
                      <ArrowUpRight size={20} />
                   </a>
                </div>
              </div>

              <div className="p-5 bg-admin-bg rounded-2xl">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-admin-border/50">
                  <span className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Transaction Details</span>
                  <StatusBadge status={viewingReceipt.paymentStatus} />
                </div>
                <div className="space-y-3">
                  <DetailRow label="Order ID" value={`#${viewingReceipt.id}`} />
                  <DetailRow label="Transaction Ref" value={viewingReceipt.paymentRef || 'N/A'} color="text-amber-500" />
                  <DetailRow label="Total Amount" value={`$${(Number(viewingReceipt.price) || 0).toLocaleString('en-US')}`} color="text-amber-500" />
                  <DetailRow label="Bank Used" value={viewingReceipt.deliveryInfo?.bankName || 'Unknown Bank'} />
                </div>
              </div>

              {pendingStatuses.includes(viewingReceipt.paymentStatus) && viewingReceipt.status !== 'cancelled' && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setViewingReceipt(null);
                      setConfirmDialog({ orderId: viewingReceipt.id, type: 'approve' });
                    }}
                    className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Confirm Payment
                  </button>
                  <button 
                    onClick={() => {
                      setViewingReceipt(null);
                      setConfirmDialog({ orderId: viewingReceipt.id, type: 'reject' });
                    }}
                    className="flex-1 py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Reject Proof
                  </button>
                </div>
              )}
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-6000 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-admin-card rounded-3xl p-8 shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                confirmDialog.type === 'approve' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {confirmDialog.type === 'approve' ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
              </div>
              <h3 className="text-xl font-black text-admin-text text-center mb-2">
                {confirmDialog.type === 'approve' ? 'Confirm Payment?' : 'Reject Payment?'}
              </h3>
              <p className="text-xs text-admin-text-muted text-center mb-8 leading-relaxed">
                {confirmDialog.type === 'approve' 
                  ? "This will mark the order as paid and notify the customer. Are you sure the funds have cleared?"
                  : "Please ensure you have verified that this transaction is indeed invalid before rejecting."
                }
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-3 bg-admin-bg border border-admin-border text-admin-text font-black text-[10px] uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAction(confirmDialog.orderId, confirmDialog.type)}
                  className={`flex-1 py-3 text-white font-black text-[10px] uppercase rounded-xl shadow-lg ${
                    confirmDialog.type === 'approve' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-rose-500 shadow-rose-500/20'
                  }`}
                >
                  {confirmDialog.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

// Sub-components for cleaner structure
const StatCard = ({ label, value, icon, trend, color }) => (
  <div className="admin-panel p-3 md:p-5 bg-admin-card group transition-all">
    <div className="flex justify-between items-start mb-2 md:mb-4">
      <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl bg-${color}/10 text-${color} border border-${color}/20 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className={`text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg bg-${color}/10 text-${color} uppercase tracking-widest`}>
        {trend}
      </span>
    </div>
    <p className="text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-0.5 md:mb-1">{label}</p>
    <p className="text-lg md:text-2xl font-black text-admin-text tracking-tighter">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'paid': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'processing': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    'unpaid': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'failed': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    'refunded': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };
  return (
    <span className={`relative inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-max ${styles[status] || styles.pending}`}>
      {status}
      {['pending', 'processing', 'unpaid'].includes(status) && (
        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 animate-bounce">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-admin-card shadow-sm"></span>
        </span>
      )}
    </span>
  );
};

const ModalWrapper = ({ children, onClose, title }) => (
  <div className="fixed inset-0 z-5000 flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-black/60 backdrop-blur-md"
    />
    <motion.div 
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="relative w-full max-w-2xl bg-admin-card rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
    >
      <div className="flex justify-between items-center mb-8 shrink-0">
        <h3 className="text-2xl font-black text-admin-text tracking-tight">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-admin-bg rounded-xl transition-all">
          <X size={24} className="text-admin-text-muted" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {children}
      </div>
    </motion.div>
  </div>
);

const DetailRow = ({ label, value, color = "text-admin-text" }) => (
  <div className="flex justify-between items-center text-[11px]">
    <span className="font-bold text-admin-text-muted uppercase tracking-widest">{label}</span>
    <span className={`font-black ${color}`}>{value}</span>
  </div>
);

export default PaymentVerification;
