import { useEffect,  useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const AuthSuccessModal = ({ isOpen, onClose, isLogin }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => setReady(true), 600);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      setReady(false);
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!ready) return;
    onClose();
  };

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-success-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-10000 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.8 }}
            className="relative w-full max-w-115 rounded-3xl overflow-hidden
              bg-white dark:bg-[#111111]
              border border-gray-200/80 dark:border-white/[0.07]
              shadow-[0_8px_80px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_80px_rgba(0,0,0,0.65)]
              backdrop-blur-xl"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#EAB308] to-transparent opacity-80" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#EAB308]/6 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#EAB308]/4 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative px-8 pt-12 pb-10 sm:px-10 sm:pt-14 sm:pb-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 14, delay: 0.12 }}
                className="mx-auto mb-8 w-20 h-20 rounded-full flex items-center justify-center relative"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="absolute -inset-1.5 rounded-full bg-linear-to-br from-[#EAB308]/20 to-[#EAB308]/5 border border-[#EAB308]/25"
                />
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(201,146,42,0)',
                      '0 0 24px 4px rgba(201,146,42,0.15)',
                      '0 0 0 0 rgba(201,146,42,0)',
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: 1, delay: 0.5, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full"
                />
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-linear-to-br from-[#EAB308]/15 to-[#EAB308]/5 border-2 border-[#EAB308]/30">
                  <motion.div
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18, delay: 0.28 }}
                  >
                    <CheckCircle className="w-10 h-10 text-[#22c55e] drop-shadow-[0_0_10px_rgba(34,197,94,0.35)]" strokeWidth={2.2} />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="text-[22px] sm:text-[26px] font-bold tracking-tight text-gray-900 dark:text-white mb-3 leading-tight"
              >
                {isLogin ? 'Welcome Back!' : 'Account Created Successfully!'}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.27, duration: 0.35 }}
                className="text-[13px] sm:text-sm leading-[1.75] max-w-92.5 mx-auto mb-9 text-gray-500 dark:text-gray-400"
              >
                {isLogin
                  ? 'You have successfully signed in. Welcome back! Your account is ready, and you can now continue exploring our restaurant.'
                  : 'Your account has been created successfully. Welcome to our restaurant! You can now sign in to explore our menu, place orders, and enjoy a seamless dining experience.'}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.35 }}
                whileHover={ready ? { y: -2, boxShadow: '0 8px 32px rgba(201,146,42,0.35)' } : {}}
                whileTap={ready ? { scale: 0.97 } : {}}
                onClick={handleClose}
                className="w-full h-13 rounded-[14px] flex items-center justify-center
                  bg-linear-to-r from-[#EAB308] to-[#EAB308]
                  text-white font-bold text-sm tracking-wide
                  shadow-[0_4px_24px_rgba(201,146,42,0.25)]
                  transition-all duration-200
                  hover:from-[#EAB308] hover:to-[#EAB308]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308] focus-visible:ring-offset-2
                  dark:focus-visible:ring-offset-[#111111]
                  active:shadow-[0_2px_12px_rgba(201,146,42,0.2)]"
              >
                {isLogin ? 'Okay' : 'Sign In Now'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
};

export default AuthSuccessModal;
