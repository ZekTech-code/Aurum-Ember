/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  Search, Filter, MoreHorizontal, Eye, 
  Printer, Download, Trash2, CheckCircle,
  Clock, Package, Truck, XCircle,
  CreditCard, Wallet, Banknote, ShoppingBag, X, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../components/Toast';
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

const OrderManager = ({ orders, updateOrderStatus, markOrderPaid, sendNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const exportOrdersPDF = () => {
    generatePdf({
      title: 'Order Management Report',
      subtitle: `Total: ${filteredOrders.length} orders • Filter: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`,
      headers: ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Payment'],
      rows: filteredOrders.map(o => [
        `#${o._id}`,
        getCustomerName(o),
        `${o.items.length} item(s)`,
        `$${(Number(o.totalAmount) || 0).toLocaleString('en-US')}`,
        o.status === 'Cancelled by User' ? 'Cancelled' : o.status,
        o.paymentMethod || 'N/A'
      ]),
      fileName: `orders_report_${statusFilter}_${new Date().toISOString().split('T')[0]}`
    });
  };

  const printOrderReport = () => {
    exportOrdersPDF();
  };

  const printSingleOrder = (order) => {
    generatePdf({
      title: 'Order Receipt',
      subtitle: `Order #${order._id} • ${order.date}`,
      headers: ['Item', 'Qty', 'Unit Price', 'Subtotal'],
      rows: order.items.map(item => [
        item.name,
        String(item.quantity || 1),
        `$${(Number(item.price) || 0).toLocaleString('en-US')}`,
        `$${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-US')}`
      ]),
      fileName: `order_${order._id}_receipt`
    });
  };

  const getPaymentBadge = (method) => {
    switch (method?.toLowerCase()) {
      case 'card': 
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md border border-blue-500/20 whitespace-nowrap">
            <CreditCard size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Card</span>
          </div>
        );
      case 'paystack': 
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md border border-blue-500/20 whitespace-nowrap">
            <CreditCard size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Paystack</span>
          </div>
        );
      case 'transfer':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20 whitespace-nowrap">
            <Wallet size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Transfer</span>
          </div>
        );
      case 'wallet':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-md border border-indigo-500/20 whitespace-nowrap">
            <Wallet className="rotate-90" size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Wallet</span>
          </div>
        );
      case 'pay_on_delivery':
      case 'cod':
      case 'cash on delivery':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20 whitespace-nowrap">
            <Banknote size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Pay on Delivery</span>
          </div>
        );
      default:
        // Better fallback - capitalize the method
        const displayMethod = method ? method.replace(/([A-Z])/g, ' $1').trim() : 'Unknown';
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-500/10 text-gray-500 rounded-md border border-gray-500/20 whitespace-nowrap">
            <DollarSign size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">{displayMethod}</span>
          </div>
        );
    }
  };

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

  // Get users from DB to resolve avatars
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

  const filteredOrders = (orders || []).filter(order => {
    const matchesSearch = 
      (order._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.deliveryInfo?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === 'all') matchesStatus = true;
    else if (statusFilter === 'pending') matchesStatus = order.status === 'awaiting';
    else if (statusFilter === 'confirmed') matchesStatus = order.status === 'processing' || order.status === 'delivering';
    else if (statusFilter === 'delivered') matchesStatus = order.status === 'delivered';
    else if (statusFilter === 'cancelled') matchesStatus = order.status === 'cancelled' || order.status === 'Cancelled by User';
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-amber-500/10 text-amber-500';
      case 'delivering': return 'bg-blue-500/10 text-blue-500';
      case 'processing': return 'bg-amber-500/10 text-amber-500';
      case 'awaiting': return 'bg-orange-500/10 text-orange-500';
      case 'cancelled': 
      case 'Cancelled by User': return 'bg-rose-500/10 text-rose-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} />;
      case 'delivering': return <Truck size={14} />;
      case 'processing': return <Package size={14} />;
      case 'awaiting': return <Clock size={14} />;
      case 'cancelled':
      case 'Cancelled by User': return <XCircle size={14} />;
      default: return null;
    }
  };

  const stats = [
    { label: 'Total Orders', value: (orders || []).length, icon: <ShoppingBag size={20} />, color: 'blue' },
    { label: 'Pending', value: (orders || []).filter(o => o.status === 'awaiting').length, icon: <Clock size={20} />, color: 'orange' },
    { label: 'Delivered', value: (orders || []).filter(o => o.status === 'delivered').length, icon: <CheckCircle size={20} />, color: 'amber' },
    { label: 'Revenue', value: `$${(orders || []).filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0).toLocaleString('en-US')}`, icon: <Banknote size={20} />, color: 'amber' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-admin-text tracking-tight">Order Management</h1>
          <p className="text-xs md:text-sm text-admin-text-muted mt-1 font-medium">Real-time overview of your restaurant's order pipeline.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={printOrderReport} className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-admin-card border border-admin-border hover:border-accent/40 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all text-admin-text-muted hover:text-admin-text shadow-sm hover:shadow-md">
            <Printer size={16} /> <span className="hidden sm:inline">Print Report</span>
          </button>
          <button onClick={exportOrdersPDF} className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-accent text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-bold shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95">
            <Download size={16} /> <span className="hidden sm:inline">Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Overview - Ultra Premium Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <div className={`absolute -inset-0.5 bg-linear-to-r ${
              stat.color === 'blue' ? 'from-blue-500/20 to-indigo-500/20' :
              stat.color === 'orange' ? 'from-orange-500/20 to-amber-500/20' :
              'from-accent/20 to-amber-500/20'
            } rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000`} />
            
            <div className="relative bg-admin-card p-3 md:p-5 rounded-xl flex items-center gap-3 md:gap-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${
                stat.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                stat.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                'bg-accent/10 text-accent'
              }`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-0.5 md:mb-1">{stat.label}</p>
                <p className="text-lg md:text-2xl font-black text-admin-text tracking-tight">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter & Search Bar - High Fidelity */}
      <div className="flex flex-col lg:flex-row gap-3 md:gap-6 mb-5 md:mb-8 items-stretch lg:items-center">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-admin-text-muted group-focus-within:text-accent transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search by ID, Customer Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 md:py-4 bg-admin-card border border-admin-border rounded-xl outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-xs md:text-sm font-semibold text-admin-text placeholder:text-admin-text-muted/30 shadow-sm"
          />
        </div>
        
        <div className="flex items-center p-1 md:p-1.5 bg-admin-card rounded-xl shadow-sm overflow-x-auto custom-scrollbar no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'In Progress' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 md:px-6 py-2 md:py-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer
                ${statusFilter === tab.id 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-admin-text-muted hover:text-accent hover:bg-accent/5'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-admin-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-300 border-separate border-spacing-0">
            <thead>
              <tr className="bg-admin-bg">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Order ID & Date</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Customer</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Purchased Items</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Total Value</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Workflow Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-admin-text-muted">Management</th>
              </tr>
            </thead>
            <tbody className="">
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <tr key={order._id} className="group hover:bg-accent/[0.03] transition-colors border-t border-admin-border first:border-t-0">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-black text-sm tracking-tight text-admin-text group-hover:text-accent transition-colors">
                        #{order._id}
                      </span>
                      <span className="text-[10px] text-admin-text-muted font-bold uppercase mt-1.5 flex items-center gap-1.5">
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
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-admin-bg border border-accent flex items-center justify-center text-accent font-black text-sm overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-110 p-0.5">
                          {(() => {
                            const customer = users.find(u => u.email.toLowerCase() === order.userEmail.toLowerCase());
                            const avatarUrl = order.userAvatar || customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.deliveryInfo?.fullName || 'G')}&background=EAB308&color=fff&bold=true`;
                            return (
                              <img 
                                src={avatarUrl} 
                                alt="" 
                                className="w-full h-full object-cover rounded-full" 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(order.deliveryInfo?.fullName || 'G')}&background=EAB308&color=fff&bold=true`;
                                }}
                              />
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-black text-admin-text tracking-tight">{getCustomerName(order)}</p>
                        <p className="text-[11px] text-admin-text-muted font-medium">{order.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                        {order.items.slice(0, 2).map((item, i) => (
                          <div key={i} className="w-11 h-11 rounded-full bg-admin-bg border border-accent flex items-center justify-center overflow-hidden shadow-lg p-0.5">
                            <MealImage name={item.name} image={item.image || item.img} className="w-full h-full object-cover rounded-full" />
                          </div>
                        ))}
                      </div>
                      
                      <div className="px-3 py-1.5 bg-admin-bg/50 rounded-xl flex items-center gap-2 shadow-sm">
                        <span className="text-xs font-black text-accent">
                          {order.items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)}
                        </span>
                        <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest">
                          {order.items.length === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <p className="font-black text-admin-text text-base tracking-tight">${(Number(order.totalAmount) || 0).toLocaleString('en-US')}</p>
                      <div className="mt-1.5 relative w-max">
                         {getPaymentBadge(order.paymentMethod)}
                         {order.paymentStatus !== 'paid' && (
                           <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 animate-bounce">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-admin-card shadow-sm"></span>
                           </span>
                         )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <div className={`status-badge shadow-sm transition-all group-hover:scale-110 relative min-w-28 justify-center ${
                        order.status === 'delivered' ? 'delivered' : 
                        (order.status === 'processing' || order.status === 'awaiting' || order.status === 'delivering') ? 'processing' : 
                        'cancelled'
                      }`}>
                        {(order.status === 'awaiting' || order.status === 'processing' || order.status === 'delivering') && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 animate-bounce">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border-2 border-admin-card shadow-sm"></span>
                          </span>
                        )}
                        {getStatusIcon(order.status)}
                        <span className="whitespace-nowrap">{order.status === 'Cancelled by User' ? 'User Voided' : order.status}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2.5 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="w-10 h-10 bg-admin-card shadow-sm hover:text-accent rounded-xl text-admin-text-muted flex items-center justify-center transition-all shadow-sm hover:shadow-lg hover:shadow-accent/10"
                        title="Open Control Panel"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => printSingleOrder(order)}
                        className="w-10 h-10 bg-admin-card shadow-sm hover:text-accent rounded-xl text-admin-text-muted flex items-center justify-center transition-all shadow-sm"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-admin-bg rounded-full flex items-center justify-center text-admin-text-muted/20">
                        <ShoppingBag size={40} />
                      </div>
                      <h3 className="text-xl font-black text-admin-text">No orders found</h3>
                      <p className="text-admin-text-muted max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-admin-card rounded-2xl shadow-lg border border-admin-border overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 bg-admin-bg flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-inner">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-admin-text tracking-tight">Order Analysis</h2>
                    <p className="text-[10px] text-admin-text-muted font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2 flex-wrap">
                      Reference: <span className="text-accent">#{selectedOrder._id}</span> • 
                      {(() => {
                        const dateInfo = formatOrderDate(selectedOrder.date);
                        return (
                          <span>
                            <span className="text-accent font-black">{dateInfo.dayOfWeek}</span>
                            {' '}{dateInfo.dateTime}
                          </span>
                        );
                      })()}
                      {selectedOrder.status === 'Cancelled by User' && (
                        <span className="px-2 py-0.5 bg-rose-500 text-white text-[7px] font-black uppercase rounded tracking-tighter shadow-lg shadow-rose-500/20 whitespace-nowrap">
                          Voided
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => printSingleOrder(selectedOrder)} className="p-3 bg-admin-bg border border-admin-border hover:border-accent/40 rounded-2xl text-admin-text-muted hover:text-accent transition-all shadow-sm">
                    <Printer size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-3 bg-admin-bg border border-admin-border hover:border-rose-500/40 rounded-2xl text-admin-text-muted hover:text-rose-500 transition-all shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {/* Progress Timeline */}
                <div className="mb-12 bg-admin-bg p-8 rounded-xl">
                  <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-admin-border z-0" />
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent transition-all duration-1000 z-0" 
                      style={{ width: 
                        selectedOrder.status === 'awaiting' ? '0%' : 
                        selectedOrder.status === 'processing' ? '33%' : 
                        selectedOrder.status === 'delivering' ? '66%' : 
                        selectedOrder.status === 'delivered' ? '100%' : '0%' 
                      }} 
                    />
                    
                    {[
                      { id: 'awaiting', label: 'Received', icon: <Clock size={16} /> },
                      { id: 'processing', label: 'Kitchen', icon: <Package size={16} /> },
                      { id: 'delivering', label: 'Transit', icon: <Truck size={16} /> },
                      { id: 'delivered', label: 'Arrival', icon: <CheckCircle size={16} /> }
                    ].map((step, idx) => {
                      const isCompleted = ['awaiting', 'processing', 'delivering', 'delivered'].indexOf(selectedOrder.status) >= ['awaiting', 'processing', 'delivering', 'delivered'].indexOf(step.id);
                      const isCurrent = selectedOrder.status === step.id;
                      
                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-admin-card shadow-lg
                            ${isCompleted ? 'bg-accent text-white scale-110' : 'bg-admin-bg text-admin-text-muted'}
                            ${isCurrent ? 'ring-4 ring-accent/20 animate-pulse' : ''}
                          `}>
                            {step.icon}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest mt-3 
                            ${isCompleted ? 'text-accent' : 'text-admin-text-muted'}
                          `}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Customer info */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-admin-bg p-6 rounded-xl">
                      <h3 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-6 pb-4">Customer Intelligence</h3>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-admin-card border border-accent flex items-center justify-center text-accent font-black text-sm overflow-hidden shadow-xl p-0.5">
                            {(() => {
                              const customer = users.find(u => u.email.toLowerCase() === selectedOrder.userEmail.toLowerCase());
                              const avatarUrl = selectedOrder.userAvatar || customer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getCustomerName(selectedOrder))}&background=EAB308&color=fff&bold=true`;
                              return (
                                <img 
                                  src={avatarUrl} 
                                  alt="" 
                                  className="w-full h-full object-cover rounded-full" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getCustomerName(selectedOrder))}&background=EAB308&color=fff&bold=true`;
                                  }}
                                />
                              );
                            })()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-admin-text">{getCustomerName(selectedOrder)}</p>
                            <p className="text-[11px] text-admin-text-muted font-medium">{selectedOrder.userEmail}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-admin-card p-4 rounded-2xl">
                            <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Phone Contact</p>
                            <p className="text-xs font-bold text-admin-text">{selectedOrder.deliveryInfo.phone || "No Contact"}</p>
                          </div>
                          <div className="bg-admin-card p-4 rounded-2xl">
                            <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Shipping Destination</p>
                            <p className="text-xs font-bold text-admin-text leading-relaxed">
                              {selectedOrder.deliveryInfo?.address}, {selectedOrder.deliveryInfo?.city}, {selectedOrder.deliveryInfo?.state}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-admin-card p-6 rounded-xl border border-admin-border">
                      <h3 className="text-[10px] font-black text-accent uppercase tracking-widest mb-4">Financial Overview</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-admin-text-muted">Subtotal</span>
                          <span className="text-xs font-bold text-admin-text">${(Number(selectedOrder.price) || 0).toLocaleString('en-US')}</span>
                          <span className="text-xs font-bold text-admin-text">${(Number(selectedOrder.price) || 0).toLocaleString('en-US')}</span>
                        </div>
                        <div className="pt-3 border-t border-accent/20 flex justify-between items-center">
                          <span className="text-sm font-black text-admin-text">Grand Total</span>
                          <span className="text-xl font-black text-accent">${(Number(selectedOrder.price) || 0).toLocaleString('en-US')}</span>
                        </div>
                      </div>
                      <div className="mt-6">
                        {getPaymentBadge(selectedOrder.paymentMethod)}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Items */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-admin-card rounded-xl overflow-hidden">
                      <div className="p-6 bg-admin-bg flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Ordered Manifest ({selectedOrder.items.length})</h3>
                        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[9px] font-black uppercase">{selectedOrder.paymentMethod === 'cod' || selectedOrder.paymentMethod === 'pay_on_delivery' ? 'Pay on Delivery' : selectedOrder.paymentMethod === 'paystack' ? 'Paid Online' : selectedOrder.paymentMethod || 'Standard'}</span>
                      </div>
                      <div className="p-6 space-y-4 max-h-100 overflow-y-auto custom-scrollbar">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="group flex items-center gap-5 p-4 bg-admin-bg hover:bg-admin-card rounded-2xl transition-all hover:shadow-md">
                            <div className="relative group/meal shrink-0">
                              <div className="w-16 h-16 rounded-full bg-admin-bg border border-accent flex items-center justify-center overflow-hidden shadow-lg p-0.5">
                                <MealImage name={item.name} image={item.image || item.img} className="w-full h-full rounded-full object-cover transition-transform group-hover:scale-110" />
                              </div>
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                                {item.quantity}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-admin-text">{item.name}</p>
                              <p className="text-[10px] text-admin-text-muted font-bold mt-1 uppercase tracking-tighter">SKU: FOOD-{idx + 1024}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-admin-text">${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-US')}</p>
                              <p className="text-[9px] text-admin-text-muted font-black mt-1 uppercase tracking-widest">${(Number(item.price) || 0).toLocaleString('en-US')} / unit</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="bg-admin-bg p-6 rounded-xl">
                      <h3 className="text-[10px] font-black text-admin-text-muted uppercase tracking-widest mb-6">Administrative Control</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatusButton 
                          active={selectedOrder.status === 'awaiting'} 
                          disabled={selectedOrder.status === 'Cancelled by User'}
                          label="Awaiting" 
                          icon={<Clock size={14} />} 
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, 'awaiting');
                            sendNotification(selectedOrder.userEmail, `Your order #${selectedOrder._id} has been received and is awaiting confirmation.`);
                            setSelectedOrder({...selectedOrder, status: 'awaiting'});
                          }}
                        />
                        <StatusButton 
                          active={selectedOrder.status === 'processing'} 
                          disabled={selectedOrder.status === 'Cancelled by User'}
                          label="Processing" 
                          icon={<Package size={14} />} 
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, 'processing');
                            sendNotification(selectedOrder.userEmail, `Your order #${selectedOrder._id} is now being prepared in the kitchen.`);
                            setSelectedOrder({...selectedOrder, status: 'processing'});
                          }}
                        />
                        <StatusButton 
                          active={selectedOrder.status === 'delivering'} 
                          disabled={selectedOrder.status === 'Cancelled by User'}
                          label="Deliver" 
                          icon={<Truck size={14} />} 
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, 'delivering', { paymentStatus: 'paid' });
                            sendNotification(selectedOrder.userEmail, `Your order #${selectedOrder._id} is out for delivery!`);
                            setSelectedOrder({...selectedOrder, status: 'delivering', paymentStatus: 'paid'});
                          }}
                        />
                        <StatusButton 
                          active={selectedOrder.status === 'delivered'} 
                          disabled={selectedOrder.status === 'Cancelled by User'}
                          label="Finish" 
                          icon={<CheckCircle size={14} />} 
                          onClick={() => {
                            updateOrderStatus(selectedOrder._id, 'delivered', { paymentStatus: 'paid' });
                            sendNotification(selectedOrder.userEmail, `Enjoy your meal! Order #${selectedOrder._id} delivered.`);
                            setSelectedOrder({...selectedOrder, status: 'delivered', paymentStatus: 'paid'});
                          }}
                        />
                      </div>
                      {selectedOrder.paymentMethod === 'pay_on_delivery' && selectedOrder.paymentStatus !== 'paid' && (
                        <button
                          onClick={async () => {
                            if (!markOrderPaid) return;
                            const result = await markOrderPaid(selectedOrder._id, {
                              paymentMethod: 'pay_on_delivery',
                              notes: 'Marked as paid by admin',
                            });
                            if (result?.order) {
                              setSelectedOrder({ ...selectedOrder, ...result.order });
                              setToast({ message: 'Payment recorded with audit trail', type: 'success' });
                            } else {
                              setToast({ message: 'Failed to record payment', type: 'error' });
                            }
                          }}
                          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                        >
                          <DollarSign size={14} />
                          Mark as Paid (with audit trail)
                        </button>
                      )}
                      <button
                        onClick={() => {
                          updateOrderStatus(selectedOrder._id, 'cancelled', { paymentStatus: 'failed' });
                          sendNotification(selectedOrder.userEmail, `Your order #${selectedOrder._id} has been cancelled by the restaurant.`);
                          setSelectedOrder({...selectedOrder, status: 'cancelled', paymentStatus: 'failed'});
                          setToast({ message: `Order #${selectedOrder._id} cancelled`, type: 'info' });
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 text-rose-500 rounded-2xl text-xs font-bold border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                      >
                        <XCircle size={14} />
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

const StatusButton = ({ active, label, icon, onClick, disabled, warning, onWarning }) => {
  const handleClick = () => {
    if (disabled && !active && warning) {
      if (onWarning) onWarning(warning);
      return;
    }
    if (!disabled && !active) {
      onClick();
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={active}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              active ? 'bg-accent text-white shadow-lg shadow-accent/20' : 
              disabled ? 'bg-admin-bg text-admin-text-muted/40 cursor-not-allowed opacity-50 grayscale' :
              'bg-admin-card text-admin-text-muted hover:bg-admin-bg hover:text-admin-text border border-admin-border'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default OrderManager;
