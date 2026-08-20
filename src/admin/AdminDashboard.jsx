import { useState, useEffect, useRef } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import SplashScreen from '../components/SplashScreen';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Store, ShoppingBag, 
  Users, Truck, Settings, LogOut, 
  Bell, Moon, Sun,
  Calendar, MessageSquare, 
  X, User as UserIcon,
  DollarSign, AlertCircle, ShieldCheck, UserCog
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../hooks/useChat';
import SignOutModal from '../components/SignOutModal';

// Section Components
import DashboardOverview from './sections/DashboardOverview';
import OrderManager from './sections/OrderManager';
import MenuManager from './sections/MenuManager';
import ReservationManager from './sections/Reservation';
import CustomerManager from './sections/CustomerManager';
import DeliveryManager from './sections/DeliveryManager';
import SettingsPage from './sections/SettingsPage';
import TransactionManager from './sections/TransactionManager';
import PaymentVerification from './sections/PaymentVerification';
import Message from './sections/Message';
import AdminManager from './sections/AdminManager';

// Admin Components
import AdminSearch from './components/AdminSearch';
import Toast from '../components/Toast';

import '../styles/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, updateOrderStatus, markOrderPaid } = useOrders();
  const { isAdminAuthenticated, sendNotification } = useAuth();
  const { getAllChats } = useChat();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('admin-active-tab') || 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    sessionStorage.setItem('admin-active-tab', activeTab);
  }, [activeTab]);

  // Sync activeTab with URL path
  useEffect(() => {
    const pathMap = {
      '/admin/verification': 'verification',
      '/admin/orders': 'orders',
      '/admin/menu': 'menu',
      '/admin/messages': 'messages',
      '/admin/reservations': 'reservations',
      '/admin/customers': 'customers',
      '/admin/delivery': 'delivery',
      '/admin/admins': 'admins',
      '/admin/settings': 'settings',
    };
    const pathTab = pathMap[location.pathname];
    if (pathTab) setActiveTab(pathTab);
    else if (location.pathname === '/admin') {
      const saved = sessionStorage.getItem('admin-active-tab');
      if (saved) setActiveTab(saved);
    }
  }, [location.pathname]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-theme');
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    return true;
  });
  const [adminProfile, setAdminProfile] = useState({
    name: '',
    role: 'Administrator',
    image: null
  });
  const [viewedTabs, setViewedTabs] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Sync theme with document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Set Page Title
  useEffect(() => {
    document.title = "Aurum & Ember Admin";
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      sessionStorage.removeItem('ae-admin-token');
      sessionStorage.removeItem('admin-active-tab');
      navigate('/admin/login');
    }, 1500);
  };

  useEffect(() => {
    // Simulate a secure auth check on mount
    const verifyAuth = async () => {
      // Small delay for professional feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!isAdminAuthenticated) {
        navigate('/admin/login');
      } else {
        setIsAuthenticating(false);
      }
    };
    
    verifyAuth();
  }, [isAdminAuthenticated, navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = sessionStorage.getItem('ae-admin-token');
        const headers = { Authorization: `Bearer ${token}` };

        const [orderRes, adminRes] = await Promise.all([
          fetch('/api/orders/notifications', { headers }),
          fetch('/api/admin/notifications', { headers })
        ]);

        const orderData = orderRes.ok ? await orderRes.json() : [];
        const adminData = adminRes.ok ? await adminRes.json() : [];

        const orderNotifs = Array.isArray(orderData) ? orderData : orderData.orders || [];
        const adminNotifs = Array.isArray(adminData) ? adminData : [];

        const allNotifs = [
          ...adminNotifs.map(n => ({ ...n, source: 'admin' })),
          ...orderNotifs.map(n => ({ ...n, source: 'order' }))
        ];

        setNotifications(allNotifs);
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('ae-admin-token');
        const res = await fetch('/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAdminProfile({
            name: data.name || '',
            role: data.role || 'Administrator',
            image: data.image || null
          });
        }
      } catch (e) {
        console.error('Failed to fetch profile:', e);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...adminProfile, image: reader.result };
        setAdminProfile(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const restaurantName = 'Aurum & Ember';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={18} />, hasDot: orders.some(o => o.status === 'awaiting') && !viewedTabs.includes('orders') },
    { id: 'verification', label: 'Verify Payments', icon: <ShieldCheck size={18} />, hasDot: orders.some(o => o.status === 'awaiting') && !viewedTabs.includes('verification') },
    { id: 'finance', label: 'Finance', icon: <DollarSign size={18} /> },
    { id: 'menu', label: 'Menu', icon: <Store size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} />, hasDot: getAllChats().some(c => c.unreadCount > 0) && !viewedTabs.includes('messages'), divider: true },
    { id: 'reservations', label: 'Reservations', icon: <Calendar size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'delivery', label: 'Delivery', icon: <Truck size={18} />, hasDot: orders.some(o => o.status === 'delivering') && !viewedTabs.includes('delivery') },
    { id: 'admins', label: 'Admin Team', icon: <UserCog size={18} />, divider: true },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const handleReadNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const isExpanded = isSidebarOpen || isMobileMenuOpen;

  if (isAuthenticating) {
    return <SplashScreen onComplete={() => setIsAuthenticating(false)} />;
  }

  return (
    <div className={`admin-layout h-screen flex transition-all duration-500`}>
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-900 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'} ${isMobileMenuOpen ? 'mobile-open' : ''} h-screen sticky top-0 flex flex-col p-6 bg-admin-sidebar border-r border-admin-border transition-all duration-300 z-1000`}>
        
        {/* Mobile Close Header */}
        <div className="flex items-center justify-end mb-6 lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-9 h-9 bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-rose-500/30"
          >
            <X size={16} />
          </button>
        </div>

        <div className={`admin-logo flex items-center gap-3 mb-10 ${!isExpanded ? 'justify-center' : 'justify-start'}`}>
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-accent/30 shrink-0">
            <LayoutDashboard size={20} />
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-admin-text">{restaurantName}</span>
              <span className="text-[10px] uppercase tracking-[0.28em] text-admin-text-muted">Admin Panel</span>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
          {navItems.map(item => (
            <div key={item.id}>
              {item.divider && isExpanded && (
                <div className="border-t border-admin-border my-3 mx-4" />
              )}
              {item.divider && !isExpanded && (
                <div className="border-t border-admin-border my-3 mx-auto w-8" />
              )}
              <button 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (!viewedTabs.includes(item.id)) {
                  setViewedTabs(prev => [...prev, item.id]);
                }
                if (item.id !== 'dashboard' && item.id !== 'finance') {
                  navigate(`/admin/${item.id}`, { replace: true });
                } else {
                  navigate('/admin', { replace: true });
                }
                if (window.innerWidth <= 1024) setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 transition-all duration-300 ease-in-out cursor-pointer group relative ${
                isExpanded ? 'justify-start px-4 py-3 rounded-xl w-full' : 'justify-center px-0 rounded-xl w-14 h-14 mx-auto'
              } ${
                activeTab === item.id 
                ? 'bg-accent/10 text-accent border-l-[3px] border-accent' 
                : 'text-admin-text-muted hover:bg-accent/5 hover:text-accent'
              }`}
              title={item.label}
            >
              <span className={`transition-all ${activeTab === item.id ? 'text-accent' : 'group-hover:text-accent'}`}>
                {item.icon}
              </span>
              
              {isExpanded && (
                <span className="font-bold text-sm text-left whitespace-nowrap">
                  {item.label}
                </span>
              )}

              {item.hasDot && (
                 <div className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full animate-pulse border-2 border-admin-bg shadow-lg" />
              )}

              {activeTab === item.id && isExpanded && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-full" />
              )}
            </button>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-admin-border">
          <button
            onClick={() => setShowSignOutModal(true)}
            className={`flex items-center gap-3 transition-all duration-300 ease-in-out ${isExpanded ? 'justify-start px-4 py-2.5 rounded-xl w-full' : 'justify-center px-0 rounded-xl w-12 h-12 mx-auto'} bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 cursor-pointer group shadow-lg`}
            title="Logout"
          >
            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            {isExpanded && (
              <span className="font-semibold text-xs whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className={`h-14 md:h-16 px-3 md:px-6 flex items-center justify-between border-b border-admin-border backdrop-blur-md sticky top-0 z-40 transition-all bg-admin-sidebar/`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className={`hamburger ${isSidebarOpen || isMobileMenuOpen ? 'open' : ''} cursor-pointer`}
              aria-label="Toggle Navigation"
            >
              <span />
              <span />
              <span />
            </button>
            
            <AdminSearch 
              placeholder="Search..." 
              className="flex-1 lg:w-80 max-w-50 sm:max-w-xs md:max-w-md"
              onSearch={() => {}}
            />
          </div>

          <div className="flex items-center md:gap-4 gap-2">
            <button 
              onClick={handleReadNotifications}
              className="relative p-1.5 md:p-2 bg-admin-bg/50 hover:bg-admin-bg rounded-xl transition-all cursor-pointer border border-admin-border"
            >
              <Bell size={16} className="text-admin-text-muted" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-accent text-[8px] font-black rounded-full flex items-center justify-center border-2 border-admin-sidebar text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 md:p-2 bg-admin-bg/50 hover:bg-admin-bg rounded-xl transition-all cursor-pointer border border-admin-border"
            >
              {isDarkMode ? <Sun size={16} className="text-admin-text-muted" /> : <Moon size={16} className="text-admin-text-muted" />}
            </button>

            <div className="h-5 w-px bg-admin-border mx-0.5" />

            <div 
              onClick={() => navigate('/admin/profile')}
              className="flex items-center gap-2 cursor-pointer hover:bg-admin-bg/50 p-1 rounded-xl transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className={`text-[12px] font-bold leading-none text-admin-text`}>{adminProfile.name}</p>
                <p className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">Owner</p>
              </div>
              {adminProfile.image ? (
                <img 
                  src={adminProfile.image} 
                  alt="Profile" 
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-accent/20 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent">
                  <UserIcon size={14} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 relative ${activeTab === 'messages' ? 'overflow-hidden p-1.5 md:p-3' : 'overflow-y-auto p-3 md:p-6 lg:p-8'} custom-scrollbar bg-admin-bg`}>
          <div className={activeTab === 'messages' ? 'h-full' : 'max-w-7xl mx-auto'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={activeTab === 'messages' ? 'h-full' : ''}
              >
                {activeTab === 'dashboard' && <DashboardOverview orders={orders} />}
                {activeTab === 'messages' && <Message />}
                {activeTab === 'orders' && <OrderManager orders={orders} updateOrderStatus={updateOrderStatus} markOrderPaid={markOrderPaid} sendNotification={sendNotification} />}
                {activeTab === 'verification' && <PaymentVerification orders={orders} updateOrderStatus={updateOrderStatus} sendNotification={sendNotification} />}
                {activeTab === 'finance' && <TransactionManager orders={orders} />}
                {activeTab === 'menu' && <MenuManager />}
                {activeTab === 'reservations' && <ReservationManager />}
                {activeTab === 'customers' && <CustomerManager orders={orders} />}
                {activeTab === 'delivery' && <DeliveryManager orders={orders} updateOrderStatus={updateOrderStatus} />}
                {activeTab === 'admins' && <AdminManager />}
                 {activeTab === 'settings' && (
              <SettingsPage adminProfile={adminProfile}handleImageChange={handleImageChange}fileInputRef={fileInputRef}onResetData={() => setShowResetConfirm(true)}/>)}           </motion.div>
              </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10000 w-full max-w-md p-1 bg-linear-to-br from-rose-500/30 to-transparent rounded-3xl"
            >
              <div className="bg-admin-card p-8 rounded-[1.8rem] shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-admin-text">Clear All Data?</h3>
                    <p className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest mt-1">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-sm text-admin-text-muted mb-8 leading-relaxed">
                  This will clear your admin session and refresh the dashboard. Order data and user accounts will not be affected.
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 bg-admin-bg border border-admin-border text-admin-text font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-admin-border transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setShowResetConfirm(false);
                      const token = sessionStorage.getItem('ae-admin-token');
                      fetch('/api/admin/reset-data', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` }
                      }).then(() => {
                        sessionStorage.removeItem('admin-active-tab');
                        window.location.reload();
                      }).catch(() => {
                        window.location.reload();
                      });
                    }}
                    className="flex-1 py-3 bg-rose-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/40 z-600 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              className={`fixed top-0 right-0 h-screen w-full max-w-[320px] z-610 shadow-[-20px_0_60px_rgba(0,0,0,0.2)] p-0 flex flex-col bg-admin-sidebar/95 backdrop-blur-xl`}
            >
              <div className="p-6 flex items-center justify-between bg-admin-bg/20">
                <div>
                  <h3 className={`text-lg font-black text-admin-text`}>Notifications</h3>
                  <p className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest mt-1">Updates & Alerts</p>
                </div>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-admin-bg/50 rounded-full text-admin-text-muted hover:text-admin-text transition-all cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <NotificationItem 
                      key={`${notif.source || 'order'}-${notif.id}`}
                      title={notif.title || notif.message || 'Notification'}
                      desc={notif.desc || notif.message || ''}
                      time={notif.time || notif.createdAt || notif.date || ''}
                      type={notif.source === 'admin' ? 'admin' : notif.type}
                      isRead={notif.isRead}
                      onClick={() => setSelectedNotification(notif)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 bg-admin-bg/50 rounded-2xl flex items-center justify-center text-admin-text-muted mb-4">
                      <Bell size={24} className="opacity-20" />
                    </div>
                    <h4 className="text-sm font-bold text-admin-text mb-1">All caught up!</h4>
                    <p className="text-[10px] text-admin-text-muted font-bold uppercase tracking-widest">No new notifications at this time.</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-admin-bg/20">
                <button 
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    setShowNotifications(false);
                  }}
                  className="w-full py-3 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  Mark All Read
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Detail Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNotification(null)}
              className="fixed inset-0 z-2000 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-2001 p-1 bg-linear-to-br from-accent/30 to-transparent rounded-[2.5rem]"
            >
              <div className="bg-admin-card p-10 rounded-[2.4rem] shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-accent shadow-lg shadow-accent/20`}>
                    <Bell size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-admin-text">{selectedNotification.title || selectedNotification.message}</h3>
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest">{selectedNotification.time || selectedNotification.createdAt}</p>
                  </div>
                </div>
                
                <div className="bg-admin-bg/50 p-6 rounded-3xl mb-8">
                  <p className="text-admin-text leading-relaxed font-medium">
                    {selectedNotification.desc || selectedNotification.message}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={async () => {
                      setNotifications(notifications.map(n => 
                        (n.id === selectedNotification.id && n.source === selectedNotification.source) 
                          ? { ...n, isRead: true } : n
                      ));
                      if (selectedNotification.source === 'admin') {
                        try {
                          const token = sessionStorage.getItem('ae-admin-token');
                          await fetch(`/api/admin/notifications/${selectedNotification.id}`, {
                            method: 'PUT',
                            headers: { Authorization: `Bearer ${token}` }
                          });
                        } catch { /* Silently handle error */ }
                      }
                      setSelectedNotification(null);
                    }}
                    className="flex-1 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    Mark as Read
                  </button>
                  <button 
                    onClick={() => setSelectedNotification(null)}
                    className="flex-1 py-4 bg-admin-bg text-admin-text-muted rounded-2xl font-black text-xs uppercase tracking-widest border border-admin-border hover:bg-admin-border transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {isLoggingOut && (
        <Toast
          message="Signing out safely..."
          type="info"
          onClose={() => {}}
        />
      )}

      <SignOutModal
        isOpen={showSignOutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowSignOutModal(false)}
        userName={adminProfile?.name}
      />
    </div>
  );
};

const NotificationItem = ({ title, desc, time, type, isRead, onClick }) => {
  const getIcon = () => {
    switch(type) {
      case 'order': return <ShoppingBag size={18} />;
      case 'reservation': return <Calendar size={18} />;
      case 'stock': return <AlertCircle size={18} />;
      case 'admin': return <ShieldCheck size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getColors = () => {
    switch(type) {
      case 'order': return 'bg-amber-500/10 text-amber-500';
      case 'reservation': return 'bg-blue-500/10 text-blue-500';
      case 'stock': return 'bg-rose-500/10 text-rose-500';
      case 'admin': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-accent/10 text-accent';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl transition-all cursor-pointer shadow-sm group relative ${
        isRead ? 'bg-admin-bg/20' : 'bg-admin-bg/60 shadow-lg'
      } hover:bg-admin-bg/80`}
    >
      {!isRead && <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full animate-pulse" />}
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getColors()}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <p className="text-xs font-bold text-admin-text group-hover:text-accent transition-colors">{title}</p>
            <span className="text-[9px] text-admin-text-muted font-bold whitespace-nowrap ml-2">{time}</span>
          </div>
          <p className="text-[10px] text-admin-text-muted line-clamp-1 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
