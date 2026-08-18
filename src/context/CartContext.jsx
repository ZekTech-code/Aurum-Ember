import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';
import { CartContext } from './CartContextInstance';

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(() => !!user && !!token);
  const syncTimeoutRef = useRef(null);

  const debounceSync = useCallback((newCart) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      if (user && token && user.role !== 'admin') {
        fetch('/api/users/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ cart: newCart })
        }).catch(() => {});
      }
    }, 300);
  }, [user, token]);

  useEffect(() => {
    if (user && token && user.role !== 'admin') {
      fetch('/api/users/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => setCart(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, token]);

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      const newCart = existing
        ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }];

      debounceSync(newCart);

      setToast({
        message: existing ? `${item.name} qty updated to ${existing.quantity + 1}` : item.name,
        type: 'success',
        image: item.image || null
      });
      return newCart;
    });
  }, [debounceSync]);

  const removeFromCart = useCallback((id) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      const newCart = prev.filter(i => i.id !== id);
      debounceSync(newCart);

      if (item) {
        setToast({
          message: item.name,
          type: 'remove',
          image: item.image || null
        });
      }

      return newCart;
    });
  }, [debounceSync]);

  const updateQuantity = useCallback((id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => {
      const newCart = prev.map(item => item.id === id ? { ...item, quantity: qty } : item);
      debounceSync(newCart);
      return newCart;
    });
  }, [removeFromCart, debounceSync]);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (user && token && user.role !== 'admin') {
      try {
        await fetch('/api/users/cart', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch { /* Silently handle error */ }
    }
  }, [user, token]);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalCartCount
    }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          image={toast.image}
          onClose={() => setToast(null)}
        />
      )}
    </CartContext.Provider>
  );
}

