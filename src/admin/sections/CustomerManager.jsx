import { useState, useEffect } from 'react';
import { 
  Search, User, ShoppingBag, 
  TrendingUp, Shield, Ban, 
  ExternalLink, Mail, Phone, Filter,
  DollarSign, ArrowRight, Users,
  CheckCircle, AlertCircle, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { generatePdf } from '../../utils/exportPdf';

const CustomerManager = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSegment, setActiveSegment] = useState('all'); // all, vip, new, inactive
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('ae-admin-token');
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const users = Array.isArray(data) ? data : (data.users || []);
        setCustomers(users.map(user => {
      const userOrders = orders.filter(o => o.userEmail?.toLowerCase() === user.email?.toLowerCase());
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? (Number(o.totalAmount) || 0) : 0), 0);
      
      return {
        id: user.id || Math.random(),
        name: user.name || user.fullName || user.email?.split('@')[0] || 'Unknown User',
        email: user.email || 'no-email@ae.com',
        phone: user.phone || 'Not provided',
        totalOrders: userOrders.length,
        totalSpent: totalSpent,
        status: user.status || 'Active',
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name || user.fullName || user.email}&background=random`
      };
    }));
      } catch (e) {
        console.error("Customer DB fetch error:", e);
      }
    };
    fetchUsers();
  }, [orders]);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeSegment === 'vip') return matchesSearch && c.totalSpent > 500;
    if (activeSegment === 'new') return matchesSearch && c.totalOrders <= 1;
    if (activeSegment === 'inactive') return matchesSearch && c.status !== 'Active';
    
    return matchesSearch;
  });

  const exportToPDF = () => {
    generatePdf({
      title: 'Customer Report',
      subtitle: `Segment: ${activeSegment.charAt(0).toUpperCase() + activeSegment.slice(1)} • ${filteredCustomers.length} records`,
      headers: ['Customer Name', 'Email', 'Status', 'Total Orders', 'Total Spent'],
      rows: filteredCustomers.map(c => [
        c.name,
        c.email,
        c.status,
        String(c.totalOrders),
        `$${(Number(c.totalSpent) || 0).toLocaleString('en-US')}`
      ]),
      fileName: `customer_report_${activeSegment}`
    });
  };

  const toggleBan = (id) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, status: c.status === 'Active' ? 'Banned' : 'Active' } : c
    ));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header with Integrated Stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-admin-border">
        <div>
          <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-3">CRM & Intelligence</p>
          <h1 className="text-4xl font-black text-admin-text tracking-tight">Customer Base</h1>
        </div>
        
        <div className="flex items-center justify-center lg:justify-end gap-12 lg:flex-1">
          <HeaderStat label="Total Base" value={customers.length} />
          <HeaderStat label="VIP Segment" value={customers.filter(c => c.totalSpent > 500).length} />
          <HeaderStat label="Active Status" value={`${customers.length > 0 ? Math.round((customers.filter(c=>c.status==='Active').length/customers.length)*100) : 0}%`} />
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-admin-card p-2 rounded-[2rem] border border-admin-border">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-admin-text-muted opacity-40 group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Filter by identity or behavior..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-4 bg-transparent outline-none text-sm font-bold text-admin-text placeholder:text-admin-text-muted/40"
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
           <select 
            value={activeSegment}
            onChange={(e) => setActiveSegment(e.target.value)}
            className="px-6 py-3 bg-admin-bg/50 hover:bg-admin-bg rounded-2xl text-[10px] font-black text-admin-text uppercase tracking-widest transition-all cursor-pointer outline-none border border-admin-border appearance-none"
           >
              <option value="all" className="bg-admin-card text-admin-text">All Records</option>
              <option value="vip" className="bg-admin-card text-admin-text">VIP Tier</option>
              <option value="new" className="bg-admin-card text-admin-text">New Entries</option>
              <option value="inactive" className="bg-admin-card text-admin-text">Inactive</option>
           </select>
           <button 
            onClick={exportToPDF}
            className="px-6 py-3 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 cursor-pointer hover:scale-105 active:scale-95 transition-all"
           >
              Export PDF
           </button>
        </div>
      </div>

      {/* Modern Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => {
          const isVIP = customer.totalSpent > 500;
          
          return (
            <div key={customer.id} className="group admin-panel p-8 bg-admin-card transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden">


              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <img 
                      src={customer.avatar} 
                      alt={customer.name} 
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-admin-border group-hover:ring-accent/30 transition-all duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=EAB308&color=fff&bold=true`;
                      }}
                    />
                    <div className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-admin-card ${customer.status === 'Active' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-admin-text tracking-tight group-hover:text-accent transition-colors">{customer.name}</h3>
                    <p className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest mt-0.5">{customer.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Progress Bar for Spending Power */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest">Spending Power</span>
                       <span className="text-sm font-black text-admin-text">${(Number(customer.totalSpent) || 0).toLocaleString('en-US')}</span>
                    </div>
                    <div className="h-1.5 w-full bg-admin-bg rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((customer.totalSpent / 1000) * 100, 100)}%` }}
                        className={`h-full rounded-full ${isVIP ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-accent'}`}
                       />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-y border-admin-border">
                    <div className="text-center flex-1">
                       <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Orders</p>
                       <p className="text-lg font-black text-admin-text">{customer.totalOrders}</p>
                    </div>
                    <div className="w-px h-8 bg-admin-border" />
                    <div className="text-center flex-1">
                       <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-widest mb-1">Status</p>
                       <p className={`text-[10px] font-black uppercase tracking-widest ${isVIP ? 'text-amber-500' : 'text-accent'}`}>
                          {isVIP ? 'VIP Member' : 'Standard'}
                       </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-3.5 bg-admin-bg/50 hover:bg-admin-bg rounded-xl text-[9px] font-black text-admin-text uppercase tracking-[0.2em] transition-all cursor-pointer shadow-sm">
                      Profile
                    </button>
                    <button 
                      onClick={() => toggleBan(customer.id)}
                      className="p-3.5 bg-admin-bg/50 hover:bg-rose-500/10 rounded-xl text-admin-text-muted hover:text-rose-500 transition-all cursor-pointer shadow-sm hover:border-rose-500/20"
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-40 text-center bg-admin-card/20 rounded-[3rem] border-2 border-dashed border-admin-border">
             <Users size={48} className="mx-auto text-admin-text-muted opacity-10 mb-6" />
             <p className="text-[11px] font-black text-admin-text-muted uppercase tracking-[0.3em]">Identity record not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HeaderStat = ({ label, value }) => (
  <div className="text-center">
    <p className="text-[9px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className="text-3xl font-black text-admin-text tracking-tighter">{value}</p>
  </div>
);

export default CustomerManager;
