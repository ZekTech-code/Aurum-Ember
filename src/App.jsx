import { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import Navbar from "./components/Navbar";
import MenuSection from "./components/Menu";
import "./index.css";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLayout from "./components/PageLayout";
import { useAuth } from "./hooks/useAuth";
import { useOrders } from "./hooks/useOrders";
import { useCart } from "./hooks/useCart";
import AuthPage from "./pages/AuthPage";
import Home from "./components/Hero";

const OfflinePage = lazy(() => import("./pages/OfflinePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function RouteFallback() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--brand-gold)', animation: 'routeSpin 0.8s linear infinite' }} />
      <style>{`@keyframes routeSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

import AboutPage from "./components/About";
import Testimonials from "./components/Testimonials";
import Events from "./components/Events";
import Contact from "./components/Contact";

const Gallery = lazy(() => import("./pages/Gallery"));
const ReservePage = lazy(() => import("./pages/ReservePage"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const MenuItemPage = lazy(() => import("./pages/MenuItemPage"));
const DrinkDetailPage = lazy(() => import("./pages/DrinkDetailPage"));
const SearchMeals = lazy(() => import("./components/SearchMeals"));
const Cart = lazy(() => import("./components/Cart"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProfileMyProfile = lazy(() => import("./pages/ProfileMyProfile"));
const ProfileOrders = lazy(() => import("./pages/ProfileOrders"));
const ProfileTracking = lazy(() => import("./pages/ProfileTracking"));
const ProfileReservations = lazy(() => import("./pages/ProfileReservations"));
const ProfileNotifications = lazy(() => import("./pages/ProfileNotifications"));
const ProfileSupport = lazy(() => import("./pages/ProfileSupport"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const ProfileTransactions = lazy(() => import("./pages/ProfileTransactions"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const VerifyPayment = lazy(() => import("./admin/sections/VerifyPayment"));
const AdminProfile = lazy(() => import("./admin/sections/AdminProfile"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

export default function App() {
  const { user } = useAuth();
  const { orders, deleteOrder, cancelOrder } = useOrders();
  const { cart, addToCart, updateQuantity, clearCart, totalCartCount } = useCart();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCheckoutRoute = location.pathname === '/checkout' || location.pathname === '/order-success';
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  useEffect(() => {
    if (!navigator.onLine) setIsOffline(true);
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname, location.key]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.key, user]);

  useEffect(() => {
    if (!location.hash) return;
    const sectionId = location.hash.replace("#", "");
    const timer = setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      const navOffset = window.innerWidth <= 768 ? 72 : 84;
      const top = section.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    }, 60);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!location.hash) {
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.key, user]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      setShowScrollTop(y > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const sectionId = location.hash.replace("#", "");
    const timer = setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      const navOffset = window.innerWidth <= 768 ? 72 : 84;
      const top = section.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    }, 60);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(".reveal-on-scroll");
      if (!elements.length) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px 100px 0px" }
      );
      elements.forEach((el) => observer.observe(el));
      observerRef.current = observer;
    }, 100);
    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [location.pathname, user]);

  return (
    <ErrorBoundary>
      {isOffline && !isAdminRoute && (
        <Suspense fallback={<RouteFallback />}>
          <OfflinePage />
        </Suspense>
      )}
      {!isOffline && user && !isAdminRoute && (
        <Navbar
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          cart={{ length: totalCartCount }}
        />
      )}

      {!isOffline && (
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                !user ? (
                  <AuthPage />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <HomePage />
                  </motion.div>
                )
              }
            />
            <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute><MenuPage /></ProtectedRoute>} />
            <Route path="/menu/:mealId" element={<ProtectedRoute><MenuItemPage /></ProtectedRoute>} />
            <Route path="/drink/:drinkId" element={<ProtectedRoute><DrinkDetailPage /></ProtectedRoute>} />
            <Route path="/reserve" element={<ProtectedRoute><ReservePage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><ProfileMyProfile /></ProtectedRoute>} />
            <Route path="/profile/orders" element={<ProtectedRoute><ProfileOrders /></ProtectedRoute>} />
            <Route path="/profile/transactions" element={<ProtectedRoute><ProfileTransactions /></ProtectedRoute>} />
            <Route path="/profile/tracking" element={<ProtectedRoute><ProfileTracking /></ProtectedRoute>} />
            <Route path="/profile/reservations" element={<ProtectedRoute><ProfileReservations /></ProtectedRoute>} />
            <Route path="/profile/notifications" element={<ProtectedRoute><ProfileNotifications /></ProtectedRoute>} />
            <Route path="/profile/support" element={<ProtectedRoute><ProfileSupport /></ProtectedRoute>} />
            <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchMeals /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart orders={orders.filter(o => user ? o.userEmail === user.email : true)} onCancelOrder={cancelOrder} /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
            <Route path="/reset-password" element={<ResetPassword apiPrefix="/api/users" />} />
            <Route path="/admin/reset-password" element={<ResetPassword apiPrefix="/api/admin" />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/verification" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/verification/:orderId" element={<AdminRoute><VerifyPayment /></AdminRoute>} />
            <Route path="/admin/finance" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/menu" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/reservations" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/delivery" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/admins" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      )}
      {!isOffline && user && !isAdminRoute && !isCheckoutRoute && <Footer />}

      {!isAdminRoute && (
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, y: 24, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="group fixed bottom-6 right-6 z-40 grid place-items-center p-3.5 md:p-4 rounded-full bg-(--brand-gold) text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] cursor-pointer"
            >
              <span className="absolute inset-[-3px] rounded-full border-2 border-(--brand-gold)/40 border-t-transparent opacity-0 group-hover:opacity-100 group-hover:animate-spin [animation-duration:3s] transition-opacity duration-300" />
              <ArrowUp size={20} className="transition-transform duration-400 group-hover:-translate-y-1.5 group-hover:animate-bounce [animation-duration:1.2s]" />
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </ErrorBoundary>
  );
}

const AdminRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAuth();
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" />;
};

function HomePage() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.6, 0.35, 1] }
    }
  };

  return (
    <PageLayout>
      <Home />
      <div id="menu">
        <MenuSection mode="home" />
      </div>
      <motion.section
        id="about"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <AboutPage />
      </motion.section>
      <motion.section
        id="events"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <Events />
      </motion.section>
      <motion.section
        id="testimonials"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <Testimonials />
      </motion.section>
      <motion.section
        id="contact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <Contact />
      </motion.section>
    </PageLayout>
  );
}
