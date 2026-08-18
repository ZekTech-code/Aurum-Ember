/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';
import { 
  TrendingUp, Users, DollarSign, ShoppingBag, 
  Clock, CheckCircle, AlertCircle, ArrowUpRight,
  ChevronRight, Award, X, FileText, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MealImage from '../../components/MealImage';
import { generatePdf } from '../../utils/exportPdf';

const DashboardOverview = ({ orders = [] }) => {
  const [showReport, setShowReport] = useState(false);
  
  const exportSalesReport = () => {
    const salesData = Object.values(
      safeOrders.reduce((acc, order) => {
        if (!Array.isArray(order.items)) return acc;
        order.items.forEach(item => {
          if (!item || !item.name) return;
          if (!acc[item.name]) acc[item.name] = { name: item.name, category: item.category || 'Main', sold: 0, revenue: 0 };
          acc[item.name].sold += (Number(item.quantity) || 1);
          acc[item.name].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
        });
        return acc;
      }, {})
    ).sort((a, b) => b.sold - a.sold);

    generatePdf({
      title: 'Sales Performance Report',
      subtitle: `Full Menu Item Analysis • ${safeOrders.length} total orders`,
      headers: ['Item Name', 'Category', 'Qty Sold', 'Revenue'],
      rows: salesData.map(item => [
        item.name,
        item.category,
        String(item.sold),
        `$${item.revenue.toLocaleString('en-US')}`
      ]),
      fileName: `sales_performance_report_${new Date().toISOString().split('T')[0]}`
    });
  };
  
  // Ensure orders is an array
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  // Helper function to get real customer name
  const getCustomerName = (order) => {
    if (order.deliveryInfo?.fullName) return order.deliveryInfo.fullName;
    if (order.customerName) return order.customerName;
    if (order.userEmail) { 
      const emailName = order.userEmail.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Guest Account';
  };
  
  const totalRevenue = safeOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const pendingOrders = safeOrders.filter(o => o.status === 'awaiting').length;
  const activeCustomers = new Set(safeOrders.map(o => o.userEmail).filter(Boolean)).size;
  
  // Calculate Best Sellers from real orders
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const bestSellers = useMemo(() => {
    const counts = {};
    safeOrders.forEach(order => {
      if (!order || !Array.isArray(order.items)) return;
      order.items.forEach(item => {
        if (!item || !item.name) return;
        if (!counts[item.name]) {
          counts[item.name] = { ...item, count: 0, price: Number(item.price) || 0 };
        }
        counts[item.name].count += (Number(item.quantity) || 1);
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [safeOrders]);

  // Calculate real revenue for last 7 days
  const last7DaysRevenue = useMemo(() => {
    const days = [];
    const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const label = dayLabels[d.getDay()];
      const dayRevenue = safeOrders
        .filter(o => {
          const oDate = o.date ? new Date(o.date).toISOString().split('T')[0] : 
                        o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : null;
          return oDate === dayStr && o.status !== 'cancelled';
        })
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      days.push({ label, revenue: dayRevenue, date: dayStr });
    }
    return days;
  }, [safeOrders]);

  const maxRevenue = Math.max(...last7DaysRevenue.map(d => d.revenue), 1);

  // Calculate real order status distribution
  const orderDistribution = useMemo(() => {
    const total = safeOrders.length || 1;
    const delivered = safeOrders.filter(o => o.status === 'delivered').length;
    const preparing = safeOrders.filter(o => o.status === 'preparing').length;
    const delivering = safeOrders.filter(o => o.status === 'delivering').length;
    const awaiting = safeOrders.filter(o => o.status === 'awaiting').length;
    const cancelled = safeOrders.filter(o => o.status === 'cancelled' || o.status === 'Cancelled by User').length;
    const successful = delivered + preparing + delivering;
    const successRate = Math.round((successful / total) * 100);
    return { delivered, preparing, delivering, awaiting, cancelled, successful, total, successRate, totalNonCancelled: total - cancelled };
  }, [safeOrders]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-3xl font-black text-admin-text mb-1 md:mb-2">Welcome Back, Chief</h1>
        <p className="text-xs md:text-sm text-admin-text-muted">Here's what's happening with your restaurant today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard 
          title="Daily Revenue" 
          value={`$${totalRevenue.toLocaleString('en-US')}`} 
          icon={<DollarSign className="text-amber-500" />} 
          bg="bg-amber-500/10"
        />
        <StatCard 
          title="Total Orders" 
          value={safeOrders.length} 
          icon={<ShoppingBag className="text-blue-500" />} 
          bg="bg-blue-500/10"
        />
        <StatCard 
          title="Pending Orders" 
          value={pendingOrders} 
          icon={<Clock className="text-orange-500" />} 
          bg="bg-orange-500/10"
        />
        <StatCard 
          title="Active Customers" 
          value={activeCustomers} 
          icon={<Users className="text-purple-500" />} 
          bg="bg-purple-500/10"
        />
      </div>

      {/* Charts Section (High-Fidelity SVG Implementation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* REVENUE ANALYTICS - NOW BAR CHART */}
        <div className="admin-panel p-4 md:p-6 bg-admin-card">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <div>
              <h2 className="text-sm md:text-lg font-bold text-admin-text">Revenue Analytics</h2>
              <p className="text-[9px] md:text-[10px] text-admin-text-muted font-black uppercase tracking-widest">Weekly Sales Performance</p>
            </div>
            <select className="bg-admin-bg rounded-lg px-3 py-1 text-xs outline-none cursor-pointer text-admin-text">
              <option>Last 7 Days</option>
            </select>
          </div>
          
          <div className="h-40 md:h-62.5 w-full relative pt-4">
            <svg className="w-full h-full" viewBox="0 0 1000 350" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EAB308" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#EAB308" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="var(--admin-border)" strokeWidth="1" strokeDasharray="5,5" />
              ))}

              {/* Revenue Bars */}
              {last7DaysRevenue.map((day, i) => {
                const barWidth = 80;
                const spacing = 142.8;
                const x = (i * spacing) + (spacing - barWidth) / 2;
                const height = day.revenue > 0 ? Math.max((day.revenue / maxRevenue) * 300, 8) : 4;
                const y = 300 - height;
                
                return (
                  <g key={i} className="group/bar cursor-pointer">
                    <rect 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={height} 
                      rx="12" 
                      fill="url(#revBarGradient)" 
                      className="transition-all duration-300 group-hover/bar:fill-accent group-hover/bar:filter group-hover/bar:drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                    />
                    {day.revenue > 0 && (
                      <text 
                        x={x + barWidth/2} 
                        y={y - 10} 
                        textAnchor="middle" 
                        className="text-[14px] font-black fill-accent opacity-0 group-hover/bar:opacity-100 transition-opacity"
                      >
                        $${day.revenue.toLocaleString('en-US')}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Day Labels */}
              {last7DaysRevenue.map((day, i) => {
                const spacing = 142.8;
                const x = (i * spacing) + spacing / 2;
                return (
                  <text key={i} x={x} y={340} textAnchor="middle" className="text-[14px] font-black fill-admin-text-muted uppercase tracking-widest">{day.label}</text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ORDER DISTRIBUTION - DONUT CHART */}
        <div className="admin-panel p-4 md:p-6 bg-admin-card">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <div>
              <h2 className="text-sm md:text-lg font-bold text-admin-text">Order Distribution</h2>
              <p className="text-[9px] md:text-[10px] text-admin-text-muted font-black uppercase tracking-widest">Order Status Breakdown</p>
            </div>
            <TrendingUp size={18} className="text-accent" />
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="h-44 md:h-52 flex items-center justify-center relative">
              <svg className="w-40 h-40 md:w-52 md:h-52 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--admin-bg)" strokeWidth="10" />
                
                {/* Delivered - amber */}
                {(() => {
                  const pct = orderDistribution.delivered / orderDistribution.total;
                  if (pct === 0) return null;
                  return <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EAB308" strokeWidth="10" strokeDasharray={`${251.2 * pct} ${251.2 * (1 - pct)}`} strokeDashoffset="0" strokeLinecap="round" className="transition-all duration-1000 ease-out" />;
                })()}
                
                {/* Preparing - blue */}
                {(() => {
                  const pct = orderDistribution.preparing / orderDistribution.total;
                  if (pct === 0) return null;
                  const deliveredPct = orderDistribution.delivered / orderDistribution.total;
                  return <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="10" strokeDasharray={`${251.2 * pct} ${251.2 * (1 - pct)}`} strokeDashoffset={-251.2 * deliveredPct} strokeLinecap="round" className="transition-all duration-1000 ease-out" />;
                })()}
                
                {/* Delivering - emerald */}
                {(() => {
                  const pct = orderDistribution.delivering / orderDistribution.total;
                  if (pct === 0) return null;
                  const beforePct = (orderDistribution.delivered + orderDistribution.preparing) / orderDistribution.total;
                  return <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="10" strokeDasharray={`${251.2 * pct} ${251.2 * (1 - pct)}`} strokeDashoffset={-251.2 * beforePct} strokeLinecap="round" className="transition-all duration-1000 ease-out" />;
                })()}
                
                {/* Awaiting - orange */}
                {(() => {
                  const pct = orderDistribution.awaiting / orderDistribution.total;
                  if (pct === 0) return null;
                  const beforePct = (orderDistribution.delivered + orderDistribution.preparing + orderDistribution.delivering) / orderDistribution.total;
                  return <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F97316" strokeWidth="10" strokeDasharray={`${251.2 * pct} ${251.2 * (1 - pct)}`} strokeDashoffset={-251.2 * beforePct} strokeLinecap="round" className="transition-all duration-1000 ease-out" />;
                })()}
                
                {/* Cancelled - red */}
                {(() => {
                  const pct = orderDistribution.cancelled / orderDistribution.total;
                  if (pct === 0) return null;
                  const beforePct = (orderDistribution.delivered + orderDistribution.preparing + orderDistribution.delivering + orderDistribution.awaiting) / orderDistribution.total;
                  return <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="10" strokeDasharray={`${251.2 * pct} ${251.2 * (1 - pct)}`} strokeDashoffset={-251.2 * beforePct} strokeLinecap="round" className="transition-all duration-1000 ease-out" />;
                })()}
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl md:text-3xl font-black text-admin-text">{orderDistribution.successRate}%</span>
                <span className="text-[8px] md:text-[9px] text-admin-text-muted font-black uppercase tracking-widest mt-0.5">Success Rate</span>
                <span className="text-[8px] text-admin-text-muted mt-0.5">{orderDistribution.successful} of {orderDistribution.total} orders</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full">
              {[
                { label: 'Delivered', count: orderDistribution.delivered, color: '#EAB308' },
                { label: 'Preparing', count: orderDistribution.preparing, color: '#3B82F6' },
                { label: 'Delivering', count: orderDistribution.delivering, color: '#10B981' },
                { label: 'Awaiting', count: orderDistribution.awaiting, color: '#F97316' },
                { label: 'Cancelled', count: orderDistribution.cancelled, color: '#EF4444' },
              ].map(item => {
                const pct = orderDistribution.total > 0 ? Math.round((item.count / orderDistribution.total) * 100) : 0;
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-[10px] font-bold text-admin-text-muted">{item.label}</span>
                    <span className="text-[10px] font-black text-admin-text ml-auto">{item.count}</span>
                    <span className="text-[9px] font-bold text-admin-text-muted">({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 admin-panel p-4 md:p-6 bg-admin-card">
          <h2 className="text-sm md:text-lg font-bold mb-4 md:mb-6 text-admin-text">Recent Transactions</h2>
          <div className="space-y-2 md:space-y-4">
            {safeOrders.slice(0, 5).map(order => {
              const firstItem = order.items?.[0] || {};
              const otherItemsCount = (order.items?.length || 0) - 1;
              const orderPrice = Number(order.totalAmount) || 0;
              const customerName = getCustomerName(order);
              const itemImage = firstItem.image || firstItem.img;
              
              const getPaymentMethod = () => {
                const method = order.paymentMethod || 'Unknown';
                const methodMap = {
                  'card': '💳 Card',
                  'transfer': '🏦 Transfer',
                  'wallet': '👛 Wallet',
                  'cod': '🚚 Cash on Delivery'
                };
                return methodMap[method.toLowerCase()] || method;
              };
              
              return (
                <div key={order._id} className="flex items-center justify-between p-3 md:p-4 bg-admin-card rounded-xl md:rounded-2xl hover:bg-admin-bg transition-all cursor-pointer group border border-admin-border">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-admin-bg overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                      <MealImage 
                        name={firstItem.name || 'Order item'} 
                        image={itemImage}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-admin-text line-clamp-1">{customerName}</p>
                        {otherItemsCount > 0 && <span className="text-[9px] text-admin-text-muted font-bold px-1.5 py-0.5 bg-admin-bg/80 rounded-md">+{otherItemsCount} more</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-accent font-black uppercase tracking-wider">#{order._id}</span>
                        <span className="text-[10px] text-admin-text-muted font-medium">• {getPaymentMethod()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-admin-text">${orderPrice.toLocaleString('en-US')}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-amber-500' : 'bg-orange-500'}`} />
                      <p className={`text-[9px] font-black uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'text-amber-500' : 'text-orange-500'}`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling */}
        <div className="admin-panel p-4 md:p-6 bg-admin-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Award size={80} className="text-accent" />
          </div>
          <div className="flex justify-between items-center mb-5 md:mb-8">
            <div>
              <h2 className="text-sm md:text-lg font-bold text-admin-text">Best Sellers</h2>
              <p className="text-[9px] md:text-[10px] text-admin-text-muted font-black uppercase tracking-widest">Top Performing Dishes</p>
            </div>
            <button 
              onClick={() => setShowReport(true)}
              className="text-[9px] md:text-[10px] text-accent font-black uppercase tracking-widest hover:underline cursor-pointer"
            >
              View Report
            </button>
          </div>
          
          <div className="space-y-4 md:space-y-6">
            {bestSellers.length > 0 ? bestSellers.map((item, index) => (
              <TopItem 
                key={item.id || item.name}
                rank={index + 1}
                name={item.name} 
                price={`$${(Number(item.price) || 0).toLocaleString('en-US')}`} 
                orders={item.count} 
                image={item.image || item.img} 
                totalSales={bestSellers[0]?.count || 1}
              />
            )) : (
              <div className="py-12 text-center">
                 <ShoppingBag size={32} className="mx-auto text-admin-text-muted mb-4 opacity-20" />
                 <p className="text-xs text-admin-text-muted font-bold uppercase tracking-widest">No Sales Yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Report Modal */}
      <AnimatePresence>
        {showReport && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReport(false)}
              className="fixed inset-0 z-2000 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-2001 p-1 bg-linear-to-br from-accent/30 to-transparent rounded-[2.5rem]"
            >
              <div className="bg-admin-card p-10 rounded-[2.4rem] shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-admin-text">Sales Performance Report</h3>
                      <p className="text-[10px] text-admin-text-muted font-black uppercase tracking-widest">Full Menu Item Analysis</p>
                    </div>
                  </div>
                  <button onClick={() => setShowReport(false)} className="p-3 hover:bg-admin-bg rounded-2xl text-admin-text-muted transition-all cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-8">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-admin-card z-10">
                      <tr>
                        <th className="pb-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest">Item Name</th>
                        <th className="pb-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest text-center">Category</th>
                        <th className="pb-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest text-center">Sold</th>
                        <th className="pb-4 text-[10px] font-black text-admin-text-muted uppercase tracking-widest text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-border/30">
                      {Object.values(
                        safeOrders.reduce((acc, order) => {
                          if (!Array.isArray(order.items)) return acc;
                          order.items.forEach(item => {
                            if (!item || !item.name) return;
                            if (!acc[item.name]) acc[item.name] = { ...item, sold: 0, revenue: 0 };
                            acc[item.name].sold += (Number(item.quantity) || 1);
                            acc[item.name].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
                          });
                          return acc;
                        }, {})
                      )
                      .sort((a, b) => b.sold - a.sold)
                      .map(item => (
                        <tr key={item.id || item.name} className="hover:bg-admin-bg/30 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <MealImage 
                                name={item.name} 
                                image={item.image}
                                className="w-8 h-8 rounded-lg object-cover" 
                              />
                              <span className="text-xs font-bold text-admin-text">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-[9px] font-black text-admin-text-muted uppercase bg-admin-bg px-2 py-1 rounded-md">
                              {item.category || 'Main'}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-xs font-black text-admin-text">{item.sold}</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-xs font-black text-accent">${item.revenue.toLocaleString('en-US')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4">
                  <button onClick={exportSalesReport} className="flex-1 py-4 bg-admin-bg text-admin-text-muted rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-admin-border transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Download size={16} /> Export PDF
                  </button>
                  <button 
                    onClick={() => setShowReport(false)}
                    className="flex-1 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg }) => (
  <div className="admin-panel p-3 md:p-5 flex items-start justify-between bg-admin-card">
    <div>
      <p className="text-[10px] md:text-sm font-medium text-admin-text-muted mb-0.5 md:mb-1">{title}</p>
      <h3 className="text-lg md:text-2xl font-black text-admin-text">{value}</h3>
    </div>
    <div className={`w-8 h-8 md:w-11 md:h-11 rounded-xl md:rounded-2xl ${bg} flex items-center justify-center shadow-inner`}>
      {icon}
    </div>
  </div>
);

const TopItem = ({ rank, name, price, orders, image, totalSales }) => (
  <div className="group cursor-pointer">
    <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
      <div className="relative">
        <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-admin-bg flex items-center justify-center overflow-hidden shadow-lg p-0.5 group-hover:scale-105 transition-transform">
          <MealImage 
            name={name} 
            image={image}
            className="w-full h-full rounded-full object-cover" 
          />
        </div>
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border-2 border-admin-card shadow-lg bg-accent text-white">
          {rank}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[13px] font-bold text-admin-text line-clamp-1">{name}</p>
            <p className="text-[10px] text-admin-text-muted font-black uppercase tracking-widest">{orders} total sales</p>
          </div>
          <p className="text-[13px] font-black text-accent">{price}</p>
        </div>
      </div>
    </div>
    <div className="h-1.5 w-full bg-admin-bg rounded-full overflow-hidden">
      <div 
        className="h-full bg-accent rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(234,179,8,0.3)]"
        style={{ width: `${(orders / totalSales) * 100}%` }}
      />
    </div>
  </div>
);

export default DashboardOverview;
