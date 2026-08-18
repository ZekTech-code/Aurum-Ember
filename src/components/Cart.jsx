import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MealImage from "./MealImage";
import PageLayout from "./PageLayout";
import { fmt } from "../utils/currency";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "../hooks/useCart";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const subtotal = useMemo(() => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((t, item) => {
      const p = Number(item?.price) || 0;
      const q = Number(item?.quantity) || 0;
      return t + p * q;
    }, 0);
  }, [cart]);

  const handleCheckout = useCallback(() => {
    setCheckingOut(true);
    setTimeout(() => navigate("/checkout"), 800);
  }, [navigate]);

  return (
    <PageLayout>
      <div className="transition-colors duration-400">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6 sm:mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary)">
              Your Cart
            </h1>
            <p className="text-sm text-(--text-muted) mt-1">
              {cart.length} {cart.length === 1 ? "item" : "items"} in your bag
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => navigate("/menu")}
              className="flex items-center gap-2 text-sm font-semibold text-(--brand-gold) hover:text-(--brand-gold) transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-(--brand-gold)/10"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Continue Shopping</span>
            </button>
          )}
        </motion.div>

        {/* ── Empty State ── */}
        {cart.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-(--bg-secondary) flex items-center justify-center mb-6">
              <ShoppingCart size={40} className="text-(--text-muted)" />
            </div>
            <h2 className="text-xl font-bold text-(--text-primary) mb-2">
              Your cart is empty
            </h2>
            <p className="text-(--text-muted) mb-8 max-w-xs">
              Looks like you haven&apos;t added anything yet. Browse our menu to
              find something delicious.
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="px-8 py-3.5 bg-(--brand-gold) hover:bg-(--brand-gold) text-white rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-(--brand-gold)/25 cursor-pointer"
            >
              Start Shopping
            </button>
          </motion.div>
        )}

        {/* ── Cart Summary Card (above items) ── */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 sm:mb-6 bg-(--bg-card) rounded-[18px] sm:rounded-[20px] border border-(--border) shadow-md px-5 sm:px-7 py-5 sm:py-6 transition-colors duration-300"
          >
            <h4 className="text-xs font-bold text-(--text-muted) uppercase tracking-widest mb-3">
              Cart Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-(--text-secondary)">
                  Cart({cart.length})
                </span>
                <span className="text-sm font-semibold text-(--text-primary) tabular-nums">
                  {fmt(subtotal)}
                </span>
              </div>

              <div className="border-t border-(--border)" />

              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-(--text-primary)">
                  Subtotal
                </span>
                <span className="text-2xl font-black text-(--brand-gold) tabular-nums">
                  {fmt(subtotal)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Cart Items Card ── */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-(--bg-card) rounded-[18px] sm:rounded-[20px] border border-(--border) shadow-md overflow-hidden transition-colors duration-300"
          >
            {/* Header */}
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-(--border)">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-(--text-primary)">
                  Your Items
                </h2>
                <span className="text-sm font-semibold text-(--brand-gold)">
                  {fmt(subtotal)}
                </span>
              </div>
            </div>

            {/* Scrollable Items */}
            <div
              className="cart-scroll overflow-y-auto"
              style={{ maxHeight: "min(600px, 65vh)" }}
            >
              <AnimatePresence initial={false}>
                {cart.map((item, i) => {
                  const price = Number(item?.price) || 0;
                  const qty = Number(item?.quantity) || 0;
                  const lineTotal = price * qty;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: { duration: 0.3 },
                      }}
                      transition={{
                        opacity: { duration: 0.3 },
                        height: { duration: 0.35 },
                        layout: { duration: 0.3 },
                      }}
                    >
                      <div className="flex gap-3.5 sm:gap-5 px-5 sm:px-7 py-4 sm:py-5 group hover:bg-(--bg-secondary)/50 transition-colors duration-200">
                        {/* Image */}
                        <div className="w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-(--bg-secondary) border border-(--border)">
                          <MealImage
                            name={item.name}
                            image={item.image}
                            category={item.category}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-(--text-primary) text-sm sm:text-[15px] truncate leading-snug">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.category && (
                                <span className="text-[11px] text-(--text-muted)">
                                  {item.category}
                                </span>
                              )}
                              <span className="text-[11px] text-emerald-500 font-medium">
                                In Stock
                              </span>
                            </div>
                          </div>

                          {/* Actions Row */}
                          <div className="flex items-center justify-between mt-2.5">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded-md transition-all cursor-pointer"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 size={13} />
                              Remove
                            </button>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-0.5 bg-(--bg-secondary) rounded-lg border border-(--border) p-0.5">
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() =>
                                  updateQuantity(item.id, qty - 1)
                                }
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-(--brand-gold) text-white flex items-center justify-center hover:bg-(--brand-gold) transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </motion.button>
                              <motion.span
                                key={qty}
                                initial={false}
                                animate={{ scale: [0.6, 1.15, 1] }}
                                transition={{ duration: 0.2 }}
                                className="w-8 text-center font-bold text-sm text-(--text-primary) tabular-nums"
                              >
                                {qty > 9 ? "9+" : qty}
                              </motion.span>
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() =>
                                  updateQuantity(item.id, qty + 1)
                                }
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-(--brand-gold) text-white flex items-center justify-center hover:bg-(--brand-gold) transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex flex-col justify-between items-end ml-1 shrink-0">
                          <span className="font-bold text-(--brand-gold) text-sm sm:text-[15px] whitespace-nowrap">
                            {fmt(lineTotal)}
                          </span>
                          {qty > 1 && (
                            <span className="text-[10px] text-(--text-muted) whitespace-nowrap">
                              {fmt(price)} ea
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      {i < cart.length - 1 && (
                        <div className="mx-5 sm:mx-7 border-b border-(--border)" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Checkout Button */}
            <div className="px-5 sm:px-7 pt-4 pb-5 sm:pb-6">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full h-14 sm:h-15 rounded-2xl bg-(--brand-gold) hover:bg-(--brand-gold) text-white font-bold text-base tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-(--brand-gold)/25 hover:shadow-xl hover:shadow-(--brand-gold)/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {checkingOut ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    Proceed to Checkout
                  </>
                )}
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="px-5 sm:px-7 pb-5 sm:pb-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs text-(--text-muted)">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="font-medium">Secure Checkout</span>
              </div>

              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                {["Visa", "Mastercard", "PayPal"].map((m) => (
                  <span
                    key={m}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-(--bg-secondary) text-(--text-muted) border border-(--border)"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-(--text-muted)">
                <Clock size={14} />
                <span>
                  Estimated delivery:{" "}
                  <span className="font-semibold text-(--text-secondary)">
                    25–35 min
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </PageLayout>
  );
}
