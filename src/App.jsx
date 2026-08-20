import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import MenuSection from "./components/Menu";
import "./index.css";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";
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
  const [showSplash, setShowSplash] = useState(true);
  const observerRef = useRef(null);
  const offlineTimerRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const handleOffline = () => {
      offlineTimerRef.current = setTimeout(() => {
        if (!navigator.onLine) setIsOffline(true);
      }, 3000);
    };
    const handleOnline = () => {
      clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = null;
      setIsOffline(false);
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      clearTimeout(offlineTimerRef.current);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
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
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {isOffline && (
        <Suspense fallback={<SplashScreen onComplete={() => {}} />}>
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
        <Suspense fallback={<SplashScreen onComplete={() => {}} />}>
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
      <motion.div
        id="menu"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <MenuSection mode="home" />
      </motion.div>
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
