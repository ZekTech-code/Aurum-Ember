import { Link } from 'react-router-dom';
import { FaUtensils } from 'react-icons/fa';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full bg-[#0F0E0C] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-10 text-center shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#c5a059] to-transparent opacity-60" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-[#c5a059]/5 rounded-full blur-[80px]" />
          <div className="relative z-10 mb-8">
            <span className="text-7xl font-black text-[#c5a059]/20">404</span>
          </div>
          <div className="relative z-10 space-y-3 mb-8">
            <h1 className="text-xl font-bold text-white tracking-tight">Page Not Found</h1>
            <p className="text-neutral-500 text-xs leading-relaxed max-w-55 mx-auto">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>
          <Link
            to="/"
            className="relative z-10 block w-full py-3.5 bg-[#c5a059] text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_8px_25px_rgba(197,160,89,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Go Home
          </Link>
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
