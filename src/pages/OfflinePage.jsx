import { useState, useEffect } from 'react';
import { FaWifi, FaUtensils } from 'react-icons/fa';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0E0C] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-10 text-center shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Top gold accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#c5a059] to-transparent opacity-60" />

          {/* Subtle glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#c5a059]/5 rounded-full blur-[80px]" />

          {/* Wifi-off icon circle */}
          <div className="relative z-10 mx-auto mb-8">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-red-500/30 flex items-center justify-center mx-auto bg-red-950/20">
              <div className="w-16 h-16 rounded-full bg-red-950/40 flex items-center justify-center">
                <FaWifi className="text-red-500 text-2xl" style={{ transform: 'rotate(45deg)' }} />
              </div>
            </div>
            {/* Slash line over wifi */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-0.5 h-16 bg-red-500/50 rotate-45 rounded-full" />
            </div>
          </div>

          {/* Text */}
          <div className="relative z-10 space-y-3 mb-8">
            <h1 className="text-xl font-bold text-white tracking-tight">
              No Internet Connection
            </h1>
            <p className="text-neutral-500 text-xs leading-relaxed max-w-55 mx-auto">
              Please check your network settings and try again
            </p>
          </div>

          {/* Retry Button */}
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="relative z-10 w-full py-3.5 bg-[#c5a059] text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_8px_25px_rgba(197,160,89,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isRetrying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              'Try Again'
            )}
          </button>

          {/* Brand */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
            <FaUtensils className="text-[#c5a059] text-[10px]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-600">
              Aurum &amp; Ember
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
