import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PageLayout from './PageLayout';

const ProfileLayout = ({ title, subtitle, children }) => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="min-h-screen bg-(--bg-primary)">
        <div className="w-full max-w-3xl mx-auto px-5 sm:px-8 py-6 sm:py-8">
          {/* ── Back Button ── (desktop only) */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate('/profile')}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-(--brand-gold) hover:text-(--brand-gold) transition-colors cursor-pointer mb-6 sm:mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </motion.button>

          {/* ── Page Title ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mb-8 sm:mb-10"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary)">{title}</h1>
            {subtitle && (
              <p className="text-sm text-(--text-muted) mt-1">{subtitle}</p>
            )}
          </motion.div>

          {/* ── Page Content ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfileLayout;
