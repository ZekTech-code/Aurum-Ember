/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { 
  LayoutDashboard, Store, ShoppingBag, 
  Users, Settings, LogOut, 
  Bell, Moon, Sun, Camera,
  MessageSquare, User as UserIcon,
  BarChart3, ChevronRight, X, Search, ShieldCheck, Calendar, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSearch from './components/AdminSearch';
import SignOutModal from '../components/SignOutModal';
import '../styles/admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useOrders();
  const { isAdminAuthenticated, adminLogout } = useAuth();
  const { getAllChats } = useChat();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-theme');
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    return true;
  });
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const markAsRead = async (id) => {
    const token = sessionStorage.getItem('ae-admin-token');
    try {
      await fetch(`/api/orders/notifications/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleViewNotification = (notif) => {
    markAsRead(notif.id);
    setSelectedNotification(notif);
  };

  const markAllAsRead = async () => {
    const token = sessionStorage.getItem('ae-admin-token');
    try {
      for (const n of notifications) {
        if (!n.isRead) {
          await fetch(`/api/orders/notifications/${n.id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
    } catch (e) {
      console.error("Failed to mark notifications as read:", e);
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const [adminProfile, setAdminProfile] = useState({
    name: '',
    role: 'Administrator',
    image: null
  });

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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

  const handleLogout = () => {
    if (adminLogout) {
      adminLogout();
    } else {
      sessionStorage.removeItem('ae-admin-token');
    }
    navigate('/admin/login');
  };

  const pendingPaymentStatuses = ['Pending', 'Processing', 'Unpaid'];

  const navItems = [
    { id: 'dashboard', path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', path: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} />, badge: (orders || []).filter(o => o.status === 'awaiting').length },
    { id: 'payments', path: '/admin/verification', label: 'Verify Payments', icon: <ShieldCheck size={18} />, badge: (orders || []).filter(o => pendingPaymentStatuses.includes(o.paymentStatus) && o.status !== 'cancelled').length },
    { id: 'menu', path: '/admin/menu', label: 'Menu', icon: <Store size={18} /> },
    { id: 'messages', path: '/admin/messages', label: 'Messages', icon: <MessageSquare size={18} />, badge: (getAllChats() || []).filter(c => c.unreadCount > 0).length, divider: true },
    { id: 'reservations', path: '/admin/reservations', label: 'Reservations', icon: <Calendar size={18} /> },
    { id: 'users', path: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { id: 'analytics', path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={18} />, divider: true },
    { id: 'settings', path: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];


  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

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

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`admin-layout h-screen flex bg-admin-bg transition-colors duration-300`}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-90 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-100 bg-admin-sidebar border-r border-admin-border transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${!isSidebarOpen ? 'lg:w-24' : 'lg:w-72'}
      `}>
        <div className={`flex flex-col h-full ${!isSidebarOpen ? 'p-3' : 'p-4'}`}>
          {/* Logo & Mobile Close */}
          <div className={`flex items-center justify-between mb-6 h-12 overflow-hidden ${!isSidebarOpen && window.innerWidth > 1024 ? 'px-0' : 'px-2'}`}>
            <div className={`flex items-center gap-4 ${!isSidebarOpen && window.innerWidth > 1024 ? 'mx-auto' : ''}`}>
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-accent/20 shrink-0">
                <LayoutDashboard size={22} />
              </div>
              {(isSidebarOpen || window.innerWidth <= 1024) && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-black tracking-tight text-admin-text whitespace-nowrap"
                >
                  AdminHub
                </motion.span>
              )}
            </div>
            
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-admin-bg/50 rounded-xl transition-all text-admin-text-muted hover:text-rose-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map(item => (
              <div key={item.id}>
                {item.divider && isSidebarOpen && (
                  <div className="border-t border-admin-border my-3 mx-4" />
                )}
                {item.divider && !isSidebarOpen && window.innerWidth > 1024 && (
                  <div className="border-t border-admin-border my-3 mx-auto w-8" />
                )}
                <motion.div
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to={item.path}
                  onClick={() => window.innerWidth <= 1024 && setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 transition-all duration-300 ease-in-out group relative
                    ${!isSidebarOpen && window.innerWidth > 1024 ? 'justify-center px-0 rounded-xl w-12 h-12 mx-auto mb-2' : 'justify-start px-4 py-3 rounded-xl w-full'}
                    ${isActive(item.path) 
                      ? 'bg-accent/10 text-accent border-l-[3px] border-accent' 
                      : 'text-admin-text-muted hover:bg-accent/5 hover:text-accent'}
                  `}
                >
                  <span className={`shrink-0 transition-transform duration-300 ${!isSidebarOpen ? 'scale-110' : ''}`}>{item.icon}</span>
                  <AnimatePresence mode="wait">
                    {(isSidebarOpen || window.innerWidth <= 1024) && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="font-semibold text-sm whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {(isSidebarOpen || window.innerWidth <= 1024) && item.badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${isActive(item.path) ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                  {(!isSidebarOpen && window.innerWidth > 1024) && item.badge > 0 && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-admin-sidebar z-20" />
                  )}
                </Link>
              </motion.div>
              </div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto pt-3 border-t border-admin-border space-y-0.5">
            <Link 
              to="/admin/profile"
              className={`
                flex items-center gap-4 px-4 py-3 transition-all group
                ${!isSidebarOpen && window.innerWidth > 1024 ? 'justify-center px-0 rounded-full w-12 h-12 mx-auto' : 'px-4 rounded-xl'}
                ${isActive('/admin/profile') ? 'bg-accent/10 text-accent border-l-[3px] border-accent' : 'text-admin-text-muted hover:bg-accent/5 hover:text-accent'}
              `}
            >
              <UserIcon size={18} className={!isSidebarOpen ? 'scale-110' : ''} />
              <AnimatePresence>
                {(isSidebarOpen || window.innerWidth <= 1024) && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-bold text-sm whitespace-nowrap"
                  >
                    Profile
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <button
              onClick={() => setShowSignOutModal(true)}
              className={`
                w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:bg-rose-500/10 transition-all group
                ${!isSidebarOpen && window.innerWidth > 1024 ? 'justify-center px-0 rounded-full w-12 h-12 mx-auto' : 'px-4 rounded-xl'}
              `}
            >
              <LogOut size={18} className={`group-hover:-translate-x-1 transition-transform ${!isSidebarOpen ? 'scale-110' : ''}`} />
              <AnimatePresence>
                {(isSidebarOpen || window.innerWidth <= 1024) && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-bold text-sm whitespace-nowrap"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 px-3 sm:px-4 md:px-8 flex items-center justify-between bg-admin-sidebar/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <button 
              onClick={toggleSidebar}
              className="p-2.5 bg-admin-bg/50 hover:bg-admin-bg rounded-xl transition-all text-admin-text-muted hover:text-accent group shadow-sm shrink-0"
            >
              {((window.innerWidth > 1024 && isSidebarOpen) || (window.innerWidth <= 1024 && isMobileMenuOpen)) ? (
                <X size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Menu size={22} />
              )}
            </button>
            
            {/* Desktop Search */}
            <AdminSearch 
              placeholder="Search anything..." 
              className="max-w-xs md:max-w-md hidden sm:block"
            />

            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden p-2.5 bg-admin-bg/50 hover:bg-admin-bg rounded-xl transition-all text-admin-text-muted hover:text-accent shadow-sm shrink-0"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Mobile Search Bar - Expandable */}
          <AnimatePresence>
            {isMobileSearchOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="absolute top-full left-0 right-0 p-3 bg-admin-sidebar/95 backdrop-blur-md z-50 sm:hidden border-b border-admin-border"
              >
                <AdminSearch 
                  placeholder="Search anything..." 
                  className="max-w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 shrink-0">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 sm:p-2.5 bg-admin-bg/50 hover:bg-admin-bg rounded-xl transition-all shadow-sm"
            >
              <Bell size={18} className="text-admin-text-muted sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-accent text-[8px] sm:text-[9px] font-black rounded-full flex items-center justify-center border-2 border-admin-sidebar text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 sm:p-2.5 bg-admin-bg/50 hover:bg-admin-bg rounded-xl transition-all shadow-sm"
            >
              {isDarkMode ? <Sun size={18} className="text-admin-text-muted sm:w-5 sm:h-5" /> : <Moon size={18} className="text-admin-text-muted sm:w-5 sm:h-5" />}
            </button>

            <div className="h-6 sm:h-8 w-px bg-admin-border hidden sm:block" />

            <Link 
              to="/admin/profile"
              className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-admin-bg/50 p-1 sm:p-1.5 rounded-xl transition-all"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold leading-none text-admin-text">{adminProfile.name}</p>
                <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1">Administrator</p>
              </div>
              <div className="relative">
                {adminProfile.image ? (
                  <img 
                    src={adminProfile.image} 
                    alt="Profile" 
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-accent/20"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent">
                    <UserIcon size={16} className="sm:w-5 sm:h-5" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-500 border-2 border-admin-sidebar rounded-full" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar bg-(--admin-bg) relative`}>
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/40 z-110 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-full sm:max-w-sm z-120 bg-(--admin-sidebar) border-l border-(--admin-border) shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-(--admin-border) flex items-center justify-between bg-(--admin-bg)">
                <div>
                  <h3 className="text-lg font-black text-(--admin-text)">Notifications</h3>
                  <p className="text-[10px] text-(--admin-text-muted) font-bold uppercase tracking-widest mt-1">Latest updates</p>
                </div>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-(--admin-surface-hover) text-(--admin-text-muted) rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => handleViewNotification(notif)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                        notif.isRead 
                          ? 'bg-(--admin-bg) border-(--admin-border) opacity-60 hover:opacity-100' 
                          : 'bg-(--admin-card) border-amber-500/30 hover:border-amber-500 shadow-lg shadow-amber-500/5'
                      }`}
                    >
                      {!notif.isRead && (
                        <span className="absolute top-4 right-4 w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50" />
                      )}
                      <div className="flex justify-between items-start mb-1 pr-4">
                        <p className={`text-sm font-bold ${notif.isRead ? 'text-[var(--admin-text-muted)]' : 'text-[var(--admin-text)]'}`}>{notif.title}</p>
                        <span className="text-[10px] text-[var(--admin-text-muted)] shrink-0 ml-2">{notif.time}</span>
                      </div>
                      <p className={`text-xs line-clamp-2 ${notif.isRead ? 'text-[var(--admin-text-muted)]' : 'text-[var(--admin-text)] opacity-80'}`}>{notif.desc}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Bell size={48} className="text-[var(--admin-text-muted)] opacity-30 mb-4" />
                    <h4 className="font-bold text-[var(--admin-text)]">No notifications</h4>
                    <p className="text-xs text-[var(--admin-text-muted)] mt-1">We'll notify you when something happens.</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-[var(--admin-border)] bg-[var(--admin-bg)]">
                <button 
                  onClick={markAllAsRead}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Mark All As Read
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Detail Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNotification(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--admin-sidebar)] border border-[var(--admin-border)] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden mx-4"
            >
              <div className="p-6 sm:p-8 border-b border-[var(--admin-border)] flex items-center justify-between bg-[var(--admin-bg)]">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[var(--admin-text)] tracking-tight">Notification Detail</h3>
                    <p className="text-[10px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest mt-1">{selectedNotification.time}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="p-3 bg-[var(--admin-surface-hover)] rounded-2xl text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 sm:p-10">
                <h4 className="text-lg font-bold text-[var(--admin-text)] mb-4 leading-tight">{selectedNotification.title}</h4>
                <div className="p-6 bg-[var(--admin-bg)] rounded-3xl border border-[var(--admin-border)]">
                  <p className="text-sm text-[var(--admin-text)] opacity-80 leading-relaxed whitespace-pre-wrap">
                    {selectedNotification.desc}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-8 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] flex justify-end">
                <button 
                  onClick={() => setSelectedNotification(null)}
                  className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Confirm & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SignOutModal
        isOpen={showSignOutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowSignOutModal(false)}
        userName="Admin"
      />
    </div>
  );
};

export default AdminLayout;
