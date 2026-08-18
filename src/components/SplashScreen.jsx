import { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [dots, setDots] = useState('');
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t = setTimeout(() => setPhase('visible'), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase !== 'visible') return;
    const t = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => onComplete?.(), 600);
    }, 2400);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  return (
    <div className={`splash-screen ${phase}`} aria-live="polite">
      <div className="splash-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`splash-particle splash-particle-${i}`} />
        ))}
      </div>

      <div className="splash-content">
        <div className="splash-logo-container">
          <div className="splash-logo-ring" />
          <div className="splash-logo-glow" />
          <div className="splash-logo-inner">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-logo-svg">
              <text x="40" y="30" textAnchor="middle" dominantBaseline="central" fill="#D4AF37" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="700" letterSpacing="0.05em">AURUM</text>
              <line x1="18" y1="40" x2="62" y2="40" stroke="#D4AF37" strokeWidth="0.5" opacity="0.6" />
              <text x="40" y="52" textAnchor="middle" dominantBaseline="central" fill="#D4AF37" fontFamily="'Playfair Display', serif" fontSize="18" fontWeight="700" letterSpacing="0.05em">&amp;</text>
              <text x="40" y="66" textAnchor="middle" dominantBaseline="central" fill="#D4AF37" fontFamily="'Playfair Display', serif" fontSize="14" fontWeight="600" letterSpacing="0.15em">EMBER</text>
            </svg>
          </div>
          <div className="splash-progress-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="56" stroke="rgba(212,175,55,0.1)" strokeWidth="1.5" fill="none" />
              <circle cx="60" cy="60" r="56" stroke="#D4AF37" strokeWidth="1.5" fill="none" strokeDasharray="352" strokeDashoffset="352" strokeLinecap="round" className="splash-progress-arc" />
            </svg>
          </div>
        </div>

        <h1 className="splash-title">Aurum &amp; Ember</h1>
        <p className="splash-subtitle">Preparing your dining experience{dots}</p>

        <div className="splash-dots">
          <span className="splash-dot" />
          <span className="splash-dot" />
          <span className="splash-dot" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
