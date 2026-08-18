import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

const SignOutModal = ({ isOpen, onConfirm, onCancel, userName }) => {
  const modalRef = useRef(null);
  const cancelRef = useRef(null);
  const previousFocusRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        cancelRef.current?.focus();
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const raf = requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.2, delay: 0.05 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.88, y: 24 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 380,
        damping: 26,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      y: 12,
      transition: { duration: 0.18, ease: 'easeIn' },
    },
  };

  const stagger = (delay) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  });

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="signout-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-10000 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Sign out confirmation"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancel();
          }}
        >
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-115 rounded-3xl overflow-hidden
              bg-white dark:bg-[#111111]
              border border-gray-200/80 dark:border-white/[0.07]
              shadow-[0_8px_80px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_80px_rgba(0,0,0,0.65)]
              backdrop-blur-xl"
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#EAB308] to-transparent opacity-80" />

            {/* Ambient glow orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#EAB308]/6 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#EAB308]/4 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative px-8 pt-12 pb-10 sm:px-10 sm:pt-14 sm:pb-12 text-center">

              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 14,
                  delay: 0.12,
                }}
                className="mx-auto mb-8 w-20 h-20 rounded-full flex items-center justify-center relative"
              >
                {/* Outer glow ring */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="absolute -inset-1.5 rounded-full
                    bg-linear-to-br from-rose-500/20 to-rose-500/5
                    border border-rose-500/25"
                />
                {/* Soft pulse glow */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(244,63,94,0)',
                      '0 0 24px 4px rgba(244,63,94,0.15)',
                      '0 0 0 0 rgba(244,63,94,0)',
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: 1, delay: 0.5, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full"
                />
                {/* Icon container */}
                <div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center
                    bg-linear-to-br from-rose-500/15 to-rose-500/5
                    border-2 border-rose-500/30"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 18,
                      delay: 0.28,
                    }}
                  >
                    <LogOut
                      className="w-10 h-10 text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.35)]"
                      strokeWidth={2.2}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                {...stagger(0.2)}
                className="text-[22px] sm:text-[26px] font-bold tracking-tight
                  text-gray-900 dark:text-white mb-3 leading-tight"
              >
                Sign Out?
              </motion.h2>

              {/* Message */}
              <motion.p
                {...stagger(0.27)}
                className="text-[13px] sm:text-sm leading-[1.75] max-w-92.5 mx-auto mb-8
                  text-gray-500 dark:text-gray-400"
              >
                {userName
                  ? `Are you sure you want to sign out, ${userName}? You'll need to sign in again to access your account.`
                  : "Are you sure you want to sign out? You'll need to sign in again to access your account."}
              </motion.p>

              {/* Buttons */}
              <motion.div {...stagger(0.34)} className="flex gap-3">
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  className="flex-1 h-13 rounded-[14px] flex items-center justify-center
                    bg-gray-100 dark:bg-white/6
                    text-gray-700 dark:text-gray-300 font-bold text-sm tracking-wide
                    border border-gray-200 dark:border-white/8
                    hover:bg-gray-200 dark:hover:bg-white/10
                    transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2
                    dark:focus-visible:ring-offset-[#111111]"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 h-13 rounded-[14px] flex items-center justify-center gap-2
                    bg-linear-to-r from-rose-500 to-rose-600
                    text-white font-bold text-sm tracking-wide
                    shadow-[0_4px_24px_rgba(244,63,94,0.25)]
                    transition-all duration-200
                    hover:from-rose-600 hover:to-rose-700
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2
                    dark:focus-visible:ring-offset-[#111111]
                    active:shadow-[0_2px_12px_rgba(244,63,94,0.2)]
                    hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(244,63,94,0.35)]"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
};

export default SignOutModal;
