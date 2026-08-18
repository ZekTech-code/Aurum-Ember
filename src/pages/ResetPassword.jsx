import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CutleryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </svg>
);

export default function ResetPassword({ apiPrefix = '/api/users' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) return;
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiPrefix}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch {
      setError('Unable to connect. Please try again.');
    }
    setLoading(false);
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6 font-inter">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-110 rounded-3xl p-8 sm:p-10 text-center bg-[rgba(17,17,17,0.85)] backdrop-blur-xl border border-white/8 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)]"
        >
          <AlertCircle size={48} className="text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-white/40 text-sm mb-6">This password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-11.5 rounded-xl font-bold text-sm bg-(--brand-gold) text-[#111111] hover:brightness-110 transition-all cursor-pointer"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6 font-inter relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[15%] left-[8%] w-80 h-80 bg-(--brand-gold)/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-(--brand-gold)/4 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-full max-w-110 relative z-10"
      >
        <div className="rounded-3xl p-8 sm:p-10 relative overflow-hidden
          bg-[rgba(17,17,17,0.65)] backdrop-blur-xl
          border border-white/8
          shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)]"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-(--brand-gold)/50 to-transparent" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-(--brand-gold) to-(--brand-gold) flex items-center justify-center shadow-lg shadow-(--brand-gold)/25 mb-4">
              <div className="w-6 h-6 text-white"><CutleryIcon /></div>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Reset Password</h1>
            <p className="text-white/40 text-xs mt-2 font-medium text-center">
              Enter your new password below
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-(--brand-gold) transition-colors z-10" size={15} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="New Password"
                  required
                  className="w-full bg-white/4 border border-white/8 rounded-lg py-2.5 pl-10 pr-10 text-white text-[13px] font-medium placeholder-white/30 focus:border-(--brand-gold)/50 focus:bg-white/6 focus:shadow-[0_0_24px_rgba(201,146,42,0.08)] outline-none transition-all duration-300"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-(--brand-gold) transition-colors cursor-pointer z-10">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-(--brand-gold) transition-colors z-10" size={15} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Confirm Password"
                  required
                  className="w-full bg-white/4 border border-white/8 rounded-lg py-2.5 pl-10 pr-10 text-white text-[13px] font-medium placeholder-white/30 focus:border-(--brand-gold)/50 focus:bg-white/6 focus:shadow-[0_0_24px_rgba(201,146,42,0.08)] outline-none transition-all duration-300"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-(--brand-gold) transition-colors cursor-pointer z-10">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {error && (
                <div className="bg-rose-500/8 border border-rose-500/15 p-3 rounded-xl flex items-center gap-3">
                  <AlertCircle className="text-rose-400 shrink-0" size={14} />
                  <p className="text-rose-400 text-xs font-bold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token || !email}
                className="w-full h-12.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 cursor-pointer
                  bg-(--brand-gold) hover:brightness-110 text-[#111111]
                  shadow-[0_4px_24px_rgba(201,146,42,0.25)]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Lock size={16} /> Reset Password</>}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-(--brand-gold)/10 border border-(--brand-gold)/25 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-(--brand-gold)" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">Password Reset!</h3>
              <p className="text-white/40 text-xs leading-relaxed mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full h-11.5 rounded-xl font-bold text-sm bg-(--brand-gold) text-[#111111] hover:brightness-110 transition-all cursor-pointer"
              >
                Go to Login
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-5">
            <ShieldCheck size={11} className="text-(--brand-gold)/25" />
            <p className="text-[10px] text-white/18 font-medium">Secure & encrypted</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
