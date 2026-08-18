import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Mail, ArrowLeft, CheckCircle2,
  AlertCircle, Loader2, Eye, EyeOff, KeyRound,
  User, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SLIDESHOW_IMAGES = [
  { src: '/images/hero_salmon.png', alt: 'Pan-seared salmon fillet' },
  { src: '/images/suya_platter.png', alt: 'Signature suya platter' },
  { src: '/images/jollof_rice.jpg', alt: 'Jollof rice' },
];

const CutleryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </svg>
);

function GoldParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2.5,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * 10,
      driftX: -20 + Math.random() * 40,
      driftY: -30 + Math.random() * 60,
      opacity: 0.15 + Math.random() * 0.35
    }))
  , []);

  return (
    <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: 'var(--brand-gold)',
            opacity: 0,
            '--drift-x': `${p.driftX}px`,
            '--drift-y': `${p.driftY}px`,
            '--particle-opacity': p.opacity,
            animation: `particleFloat ${p.duration}s ${p.delay}s ease-in-out infinite`
          }}
        />
      ))}
    </div>
  );
}

function FloatingInput({ icon: Icon, type: initialType, name, label, value, onChange, required, isPassword, showPassword, onTogglePassword, autoComplete }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <div className="relative group">
        <Icon
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${
            focused ? 'text-[var(--brand-gold)]' : 'text-white/25'
          }`}
          size={15}
        />
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : initialType}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          placeholder={label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="peer w-full bg-white/[0.04] border border-white/[0.08] rounded-lg py-2.5 pl-10 pr-4 text-white text-[13px] font-medium placeholder-white/30 focus:border-[var(--brand-gold)]/50 focus:bg-white/[0.06] focus:shadow-[0_0_24px_rgba(201,146,42,0.08)] outline-none transition-all duration-300"
        />
        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 cursor-pointer z-10 ${
              focused ? 'text-[var(--brand-gold)]' : 'text-white/25 hover:text-white/40'
            }`}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

const API_BASE = '/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, adminBootstrap } = useAuth();
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSetupToken, setShowSetupToken] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', email: '', password: '', confirmPassword: '', setupToken: ''
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const nextIdx = (currentSlide + 1) % SLIDESHOW_IMAGES.length;
    const img = new Image();
    img.src = SLIDESHOW_IMAGES[nextIdx].src;
  }, [currentSlide]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/setup-status`)
      .then(r => r.json())
      .then(data => {
        setView(data.isConfigured ? 'login' : 'signup');
      })
      .catch(() => {
        setView('login');
      });
  }, []);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await adminLogin(loginData.email, loginData.password);
      if (result.success) {
        setShowSuccess(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred');
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupData.name.trim()) { setError('Full name is required.'); return; }
    if (signupData.password !== signupData.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!signupData.setupToken.trim()) { setError('Setup token is required.'); return; }
    setLoading(true);
    try {
      const result = await adminBootstrap({
        name: signupData.name, email: signupData.email,
        password: signupData.password, setupToken: signupData.setupToken
      });
      if (result.success) {
        setShowSuccess(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setForgotMsg('Please enter your email.'); return; }
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await fetch(`${API_BASE}/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSent(true);
        setForgotMsg(data.message || 'If an account exists, a reset link has been sent.');
      } else {
        setForgotMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setForgotMsg('Unable to connect. Please try again later.');
    }
    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center relative overflow-hidden font-inter">

      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {SLIDESHOW_IMAGES.map((img, i) => {
          const isActive = i === currentSlide;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                opacity: isActive ? 1 : 0,
                transition: 'opacity 1.4s ease-in-out',
                willChange: 'opacity'
              }}
            >
              <img
                src={img.src}
                alt=""
                loading="eager"
                draggable={false}
                className="w-full h-full object-cover select-none"
                style={{
                  animation: prefersReducedMotion ? 'none' : `kenBurns 14s ease-in-out ${i * 0.3}s infinite alternate`
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-[2]" style={{
        background: 'linear-gradient(180deg, rgba(17,17,17,0.65) 0%, rgba(17,17,17,0.55) 40%, rgba(17,17,17,0.7) 100%)'
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 z-[2] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)'
      }} />

      {/* Gold particles */}
      {!prefersReducedMotion && <GoldParticles />}

      {/* Ambient glow orbs */}
      <div className="absolute top-[15%] left-[8%] w-80 h-80 bg-[var(--brand-gold)]/[0.05] rounded-full blur-[120px] z-[2] pointer-events-none" style={{ animation: 'floatOrb 10s ease-in-out infinite' }} />
      <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-[var(--brand-gold)]/[0.04] rounded-full blur-[100px] z-[2] pointer-events-none" style={{ animation: 'floatOrb 12s ease-in-out infinite reverse' }} />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-[5] w-full max-w-[440px] mx-4"
      >
        <div className="rounded-[24px] p-5 sm:p-6 relative overflow-hidden
          bg-[rgba(17,17,17,0.65)] backdrop-blur-xl
          border border-white/[0.08]
          shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6),0_0_0_1px_rgba(201,146,42,0.04)]"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--brand-gold)]/50 to-transparent" />

          {/* Corner glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--brand-gold)]/[0.06] rounded-full blur-[80px] pointer-events-none" />

          {/* Logo + Branding */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col items-center mb-4"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-gold)] to-[var(--brand-gold)] flex items-center justify-center shadow-lg shadow-[var(--brand-gold)]/25 mb-2">
              <div className="w-4 h-4 text-white"><CutleryIcon /></div>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-[0.04em] uppercase text-center leading-tight">
              Admin Portal
            </h1>
            <p className="text-[#CFCFCF]/50 text-[11px] mt-1 font-medium text-center">
              {view === 'login' ? 'Secure administrator access.' : 'Initialize your admin account.'}
            </p>
          </motion.div>

          {/* Mode Tabs */}
          {!showForgot && (
            <div className="flex mb-4 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.04]">
              <button
                onClick={() => { setView('login'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
                  view === 'login'
                    ? 'bg-[var(--brand-gold)] text-[#111111] shadow-md shadow-[var(--brand-gold)]/20'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setView('signup'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
                  view === 'signup'
                    ? 'bg-[var(--brand-gold)] text-[#111111] shadow-md shadow-[var(--brand-gold)]/20'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                Signup
              </button>
            </div>
          )}

          {/* Forms */}
          {!showForgot ? (
            <AnimatePresence mode="wait">
              {view === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleLogin}
                  className="space-y-3"
                >
                  <FloatingInput
                    icon={Mail}
                    type="email"
                    name="email"
                    label="Email Address"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    autoComplete="email"
                  />

                  <FloatingInput
                    icon={Lock}
                    name="password"
                    label="Password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    isPassword
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    autoComplete="current-password"
                  />

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded border border-white/10 bg-white/[0.04] peer-checked:bg-[var(--brand-gold)] peer-checked:border-[var(--brand-gold)] transition-all duration-300 flex items-center justify-center">
                          {rememberMe && <CheckCircle2 size={10} className="text-[#111111]" />}
                        </div>
                      </div>
                      <span className="text-xs text-white/30 font-medium group-hover:text-white/50 transition-colors">Remember me</span>
                    </label>
                    <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(loginData.email); setError(''); }} className="text-xs font-bold text-[var(--brand-gold)]/50 hover:text-[var(--brand-gold)] transition-colors duration-300 cursor-pointer">
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <div className="bg-rose-500/8 border border-rose-500/15 p-3.5 rounded-xl flex items-center gap-3">
                      <AlertCircle className="text-rose-400 shrink-0" size={16} />
                      <p className="text-rose-400 text-xs font-bold">{error}</p>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { y: -2 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="w-full h-[50px] rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 cursor-pointer
                      bg-[var(--brand-gold)] hover:brightness-110
                      text-[#111111]
                      shadow-[0_4px_24px_rgba(201,146,42,0.25)]"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Shield size={14} />
                        <span>Sign In Securely</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSignup}
                  className="space-y-2"
                >
                  <FloatingInput
                    icon={User}
                    type="text"
                    name="name"
                    label="Full Name"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    required
                    autoComplete="name"
                  />

                  <FloatingInput
                    icon={Mail}
                    type="email"
                    name="email"
                    label="Email Address"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required
                    autoComplete="email"
                  />

                  <FloatingInput
                    icon={Lock}
                    name="password"
                    label="Password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                    isPassword
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    autoComplete="new-password"
                  />

                  <FloatingInput
                    icon={Lock}
                    name="confirmPassword"
                    label="Confirm Password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    required
                    isPassword
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    autoComplete="new-password"
                  />

                  <FloatingInput
                    icon={KeyRound}
                    name="setupToken"
                    label="Setup Token"
                    value={signupData.setupToken}
                    onChange={handleSignupChange}
                    required
                    isPassword
                    showPassword={showSetupToken}
                    onTogglePassword={() => setShowSetupToken(!showSetupToken)}
                    autoComplete="off"
                  />

                  {error && (
                    <div className="bg-rose-500/8 border border-rose-500/15 p-3.5 rounded-xl flex items-center gap-3">
                      <AlertCircle className="text-rose-400 shrink-0" size={16} />
                      <p className="text-rose-400 text-xs font-bold">{error}</p>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { y: -2 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="w-full h-[50px] rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 cursor-pointer
                      bg-[var(--brand-gold)] hover:brightness-110
                      text-[#111111]
                      shadow-[0_4px_24px_rgba(201,146,42,0.25)]"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Shield size={16} />
                        <span>Create Admin Account</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          ) : (
            /* Forgot Password View */
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => { setShowForgot(false); setForgotMsg(''); setForgotSent(false); }}
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-[var(--brand-gold)] hover:border-[var(--brand-gold)]/30 transition-all cursor-pointer"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="text-base font-bold text-white">Reset Password</h2>
                  <p className="text-[11px] text-white/30">We'll send you a reset link</p>
                </div>
              </div>

              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <FloatingInput
                    icon={Mail}
                    type="email"
                    name="forgotEmail"
                    label="Your Email Address"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setForgotMsg(''); }}
                    required
                    autoComplete="email"
                  />

                  {forgotMsg && (
                    <div className="bg-rose-500/8 border border-rose-500/15 p-3 rounded-xl flex items-center gap-3">
                      <AlertCircle className="text-rose-400 shrink-0" size={14} />
                      <p className="text-rose-400 text-xs font-bold">{forgotMsg}</p>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={forgotLoading}
                    whileHover={!forgotLoading ? { y: -2 } : {}}
                    whileTap={!forgotLoading ? { scale: 0.98 } : {}}
                    className="w-full h-[50px] rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 cursor-pointer
                      bg-[var(--brand-gold)] hover:brightness-110
                      text-[#111111]
                      shadow-[0_4px_24px_rgba(201,146,42,0.25)]"
                  >
                    {forgotLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </motion.button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/25 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-[var(--brand-gold)]" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">Check Your Email</h3>
                  <p className="text-white/40 text-xs leading-relaxed mb-6">
                    {forgotMsg || 'If an account exists with this email, you will receive a password reset link shortly.'}
                  </p>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); setForgotMsg(''); }}
                    className="text-xs font-bold text-[var(--brand-gold)] hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Security note */}
          {!showForgot && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <ShieldCheck size={10} className="text-[var(--brand-gold)]/25" />
              <p className="text-[9px] text-white/18 font-medium text-center">
                Secure SSL Protected Login &middot; All activities are encrypted
              </p>
            </div>
          )}

          {/* Back to Website */}
          {!showForgot && (
            <div className="mt-3 pt-3 border-t border-white/[0.04] flex justify-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-white/30 text-xs font-bold hover:border-[var(--brand-gold)]/30 hover:text-[var(--brand-gold)] transition-all duration-300 cursor-pointer"
              >
                <ArrowLeft size={14} />
                Back to Website
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="max-w-[440px] w-full rounded-[28px] p-10 sm:p-12 text-center relative overflow-hidden
                bg-[rgba(17,17,17,0.9)] backdrop-blur-2xl border border-white/[0.06] shadow-[0_64px_128px_-16px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--brand-gold)]/60 to-transparent" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--brand-gold)]/[0.06] rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--brand-gold)]/[0.04] rounded-full blur-[70px] pointer-events-none" />

              <div className="relative w-[100px] h-[100px] mx-auto mb-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="absolute inset-[-8px] rounded-full border border-[var(--brand-gold)]/15"
                  style={{ animation: 'ringPulse 2.5s ease-in-out infinite' }}
                />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-[var(--brand-gold)]/20 to-[var(--brand-gold)]/5 border border-[var(--brand-gold)]/25"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 14, delay: 0.3 }}
                  className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-[var(--brand-gold)]/15 to-[var(--brand-gold)]/5 border-2 border-[var(--brand-gold)]/30 flex items-center justify-center relative"
                >
                  <CheckCircle2 size={42} className="text-[var(--brand-gold)]" />
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ animation: 'shimmerSweep 2.5s ease-in-out 0.8s infinite' }} />
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/20 mb-6"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-gold)] animate-pulse" />
                <span className="text-[11px] font-bold text-[var(--brand-gold)] tracking-[0.12em] uppercase">
                  {view === 'login' ? 'Session Active' : 'Admin Initialized'}
                </span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-[22px] sm:text-2xl font-black text-white tracking-tight mb-2 leading-tight"
              >
                {view === 'login' ? 'Welcome Back, Admin' : 'Account Created'}
              </motion.h3>

              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-6" />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/35 text-[13px] leading-relaxed mb-8 font-medium"
              >
                {view === 'login'
                  ? 'Welcome to the Command Center. All system modules are operational and your access level has been verified.'
                  : 'Your administrative account has been successfully initialized. You now have full access to the management dashboard.'}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (view === 'login') {
                    navigate('/admin/dashboard');
                  } else {
                    setView('login');
                    setShowSuccess(false);
                    setLoginData({ email: signupData.email, password: '' });
                    setSignupData({ name: '', email: '', password: '', confirmPassword: '', setupToken: '' });
                  }
                }}
                className="w-full h-[52px] rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5
                  bg-[var(--brand-gold)] hover:brightness-110
                  text-[#111111]
                  shadow-[0_4px_24px_rgba(201,146,42,0.3)]
                  transition-all duration-300 cursor-pointer"
              >
                {view === 'login' ? (
                  <>
                    <ShieldCheck size={16} />
                    <span>Enter Dashboard</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    <span>Sign In Now</span>
                  </>
                )}
              </motion.button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 mt-6"
              >
                <ShieldCheck size={10} className="text-[var(--brand-gold)]/20" />
                <p className="text-[10px] text-white/15 font-medium">
                  SSL Encrypted &middot; Secure Session
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyframes */}
      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -15px); }
        }
        @keyframes particleFloat {
          0% { opacity: 0; transform: translate(0, 0); }
          15% { opacity: var(--particle-opacity, 0.3); }
          85% { opacity: var(--particle-opacity, 0.3); }
          100% { opacity: 0; transform: translate(var(--drift-x, 10px), var(--drift-y, -15px)); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.06); opacity: 0.7; }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%) rotate(25deg); opacity: 0; }
          30% { opacity: 0.15; }
          70% { opacity: 0.15; }
          100% { transform: translateX(200%) rotate(25deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes kenBurns { 0%, 100% { transform: scale(1.08); } }
          @keyframes floatOrb { 0%, 100% { transform: translate(0, 0); } }
          @keyframes particleFloat { 0%, 100% { opacity: 0; } }
          @keyframes ringPulse { 0%, 100% { transform: scale(1); opacity: 0.5; } }
          @keyframes shimmerSweep { 0%, 100% { opacity: 0; } }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;