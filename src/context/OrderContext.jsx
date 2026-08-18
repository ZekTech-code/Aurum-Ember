import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { OrderContext } from './OrderContextInstance';

const API_BASE = '/api';

function OrderProvider({ children }) {
  const { token: userToken, isAdminAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentFailedPopup, setPaymentFailedPopup] = useState(null);
  const prevOrdersRef = useRef([]);

  const headers = useCallback(() => {
    const adminToken = isAdminAuthenticated ? sessionStorage.getItem('ae-admin-token') : null;
    const t = adminToken || userToken;
    return {
      'Content-Type': 'application/json',
      ...(t ? { 'Authorization': `Bearer ${t}` } : {})
    };
  }, [userToken, isAdminAuthenticated]);

  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/orders?${query}`, { headers: headers() });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || data);
      }
    } catch {
      // Silent fail
    }
    setLoading(false);
  }, [headers]);

  useEffect(() => {
    if (userToken || isAdminAuthenticated) {
      (async () => { await fetchOrders(); })();

      const interval = setInterval(() => { fetchOrders(); }, 15000);
      return () => clearInterval(interval);
    }
  }, [fetchOrders, userToken, isAdminAuthenticated]);

  useEffect(() => {
    if (prevOrdersRef.current.length === 0) {
      prevOrdersRef.current = orders;
      return;
    }
    for (const order of orders) {
      const prev = prevOrdersRef.current.find(o => (o._id || o.id) === (order._id || order.id));
      if (prev) {
        const wasPending = prev.paymentStatus === 'pending' || prev.paymentStatus === 'pending_transfer';
        const isNowFailed = order.paymentStatus === 'failed' && order.status === 'cancelled';
        if (wasPending && isNowFailed && order.cancelReason?.includes('Payment timeout')) {
          setPaymentFailedPopup({
            orderId: order._id || order.id,
            message: `Order #${order._id || order.id} has been cancelled. Payment was not completed within 5 minutes.`
          });
          setTimeout(() => setPaymentFailedPopup(null), 8000);
        }
      }
    }
    prevOrdersRef.current = orders;
  }, [orders]);

  const addOrder = async (orderData) => {
    try {
      const payload = {
        ...orderData,
        subtotal: orderData.subtotal ?? 0,
        deliveryFee: orderData.deliveryFee ?? 0,
        totalAmount: orderData.totalAmount ?? orderData.price ?? 0,
        paymentMethod: orderData.paymentMethod ?? 'delivery',
        paymentStatus: orderData.paymentStatus ?? 'pending',
      };
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const newOrder = await response.json();
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      }
      return null;
    } catch {
      return null;
    }
  };

  const updateOrderStatus = async (orderId, status, extraData = {}) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ status, ...extraData })
      });
      if (response.ok) {
        const updated = await response.json();
        setOrders(prev => prev.map(o => (o._id === orderId || o.id === orderId) ? updated : o));
      }
    } catch {
      // Silent fail
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: headers()
      });
      if (response.ok) {
        const updated = await response.json();
        setOrders(prev => prev.map(o => (o._id === orderId || o.id === orderId) ? updated : o));
      }
    } catch {
      // Silent fail
    }
  };

  const markOrderPaid = async (orderId, { paymentMethod, notes } = {}) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/mark-paid`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ paymentMethod, notes }),
      });
      if (response.ok) {
        const data = await response.json();
        const updated = data.order || data;
        setOrders(prev => prev.map(o => (o._id === orderId || o.id === orderId) ? updated : o));
        return data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
        headers: headers()
      });
      if (response.ok) {
        setOrders(prev => prev.filter(o => (o._id || o.id) !== orderId));
      }
    } catch {
      // Silent fail
    }
  };

  const getUserOrders = (userEmail) => {
    return orders.filter(o => o.userEmail === userEmail);
  };

  const getAllOrders = () => orders;

  const clearAllOrders = async () => {
    try {
      await fetch(`${API_BASE}/orders`, {
        method: 'DELETE',
        headers: headers()
      });
      setOrders([]);
    } catch {
      // Silent fail
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      addOrder,
      updateOrderStatus,
      markOrderPaid,
      cancelOrder,
      deleteOrder,
      getUserOrders,
      getAllOrders,
      clearAllOrders,
      fetchOrders,
      paymentFailedPopup,
      dismissPaymentFailedPopup: () => setPaymentFailedPopup(null)
    }}>
      {children}
      <AnimatePresence>
        {paymentFailedPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => setPaymentFailedPopup(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative bg-[#1a1a1a] rounded-2xl border border-red-500/20 shadow-2xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPaymentFailedPopup(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle className="text-red-500 w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Payment Unsuccessful</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                {paymentFailedPopup.message}
              </p>
              <button
                onClick={() => setPaymentFailedPopup(null)}
                className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/30 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </OrderContext.Provider>
  );
}

export { OrderProvider };
