import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, 
  FaEye, 
  FaEyeSlash, 
  FaGoogle, 
  FaBars, 
  FaTimes,
  FaStar,
  FaUtensils,
  FaArrowRight,
  FaCamera
} from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthSuccessModal from '../components/AuthSuccessModal';

const GOOGLE_CLIENT_ID = ''; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    state: '',
    avatar: null,
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [shakeField, setShakeField] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [successIsLogin, setSuccessIsLogin] = useState(true);
  const { login, register, googleLogin, finalizeLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleCredentialResponseRef = useRef(null);

  useEffect(() => {
    handleGoogleCredentialResponseRef.current = async (response) => {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        setLoading(true);
        const result = await googleLogin({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        });
        if (result.success) {
          setPendingUser(result.user);
          setShowSuccess(true);
        } else {
          setErrors({ auth: result.error });
        }
      } catch {
        setErrors({ auth: 'Google sign-in failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadGoogleScript = () => {
      if (document.getElementById('google-gis-script')) return;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-gis-script';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle();
      document.head.appendChild(script);
    };

    const initGoogle = () => {
      if (window.google && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handleGoogleCredentialResponseRef.current(response),
        });
      }
    };

    loadGoogleScript();
  }, []);

  const handleGoogleClick = () => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt();
    } else {
      setErrors({ auth: 'Google Sign-In is not configured. Please add a Google Client ID.' });
    }
  };

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear errors when switching between login and signup
  useEffect(() => {
    setErrors({});
  }, [isLogin]);

  const validateForm = () => {
    let newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      // Full Name validation
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.trim().length < 3) {
        newErrors.fullName = 'Name must be at least 3 characters';
      }

      // Phone validation
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number (min 10 digits)';
      }

      // Location validation
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }

      // State validation
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.keys(newErrors)[0];
      setShakeField(firstError);
      setTimeout(() => setShakeField(null), 600);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({ 
          name: formData.fullName, 
          email: formData.email, 
          phone: formData.phone,
          location: formData.location,
          state: formData.state,
          avatar: formData.avatar,
          password: formData.password
        });
      }

      if (result.success) {
        setLoading(false);
        setSuccessIsLogin(isLogin);
        setPendingUser(result.user);
        setShowSuccess(true);
      } else {
        setErrors({ auth: result.error });
        setLoading(false);
      }
    } catch {
      setErrors({ auth: 'Something went wrong. Please try again.' });
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail || !emailRegex.test(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSuccess(true);
      } else {
        setForgotError(data.message || 'Failed to send reset link.');
      }
    } catch {
      setForgotError('Unable to connect. Please try again.');
    }
    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0E0C] text-[#F5F0E8] relative overflow-x-hidden font-sans selection:bg-[#c5a059]/30 transition-colors duration-400 dark">
      
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/jollof_rice.jpg" 
          alt="Aurum & Ember Ambiance" 
          className="w-full h-full object-cover opacity-20 dark:opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0F0E0C] via-[#0F0E0C]/80 to-[#0F0E0C]/90" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#c5a059] to-transparent opacity-50 z-50" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-16 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-2xl group-hover:border-[#c5a059]/50 transition-all duration-500">
             <FaUtensils className="text-[#c5a059] text-xl" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-widest uppercase leading-none">Aurum <span className="text-[#c5a059] font-serif italic lowercase">&amp;</span> Ember</span>
            <span className="text-[10px] tracking-[0.4em] text-neutral-500 uppercase font-medium">Fine Dining Est. 2026</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-12 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          <Link to="/" className="hover:text-[#c5a059] transition-colors">Home</Link>
          <Link to="/menu" className="hover:text-[#c5a059] transition-colors">The Menu</Link>
          <a href="#experiences" className="hover:text-[#c5a059] transition-colors">Experiences</a>
          <Link to="/reserve" className="hover:text-[#c5a059] transition-colors">Reservations</Link>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="hidden sm:flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500"
          >
            {isLogin ? 'Register' : 'Sign In'}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-2xl hover:text-[#c5a059] transition-colors"
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-100 bg-[#0a0a0a] flex flex-col p-8"
          >
            <div className="flex items-center justify-between mb-20">
              <div className="flex items-center gap-3">
                <FaUtensils className="text-[#c5a059] text-xl" />
                <span className="text-xl font-bold tracking-widest uppercase">Aurum & Ember</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-3xl hover:text-[#c5a059] transition-colors"
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {[
                { name: 'Home', path: '/' },
                { name: 'The Menu', path: '/menu' },
                { name: 'Experiences', path: '#experiences' },
                { name: 'Reservations', path: '/reserve' }
              ].map((item) => (
                item.path.startsWith('#') ? (
                  <a 
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-4xl font-bold tracking-tighter hover:text-[#c5a059] transition-colors"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link 
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-4xl font-bold tracking-tighter hover:text-[#c5a059] transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <button 
                onClick={() => {
                  setIsLogin(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setIsLogin(false);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Register
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className="relative z-10 max-w-screen-2xl mx-auto px-6 md:px-16 pt-8 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]">Exquisite Culinary Journey</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-[90px] font-bold leading-[0.9] tracking-tighter">
              Where <span className="text-[#c5a059] font-serif italic font-normal">Gold</span> <br className="hidden sm:block" />
              Meets <span className="text-white">Flames</span>
            </h1>
            
            <p className="text-neutral-400 text-lg max-w-lg leading-relaxed font-light">
              Experience the harmony of traditional fire-cooking techniques and modern culinary artistry at Aurum & Ember.
            </p>

            <div className="flex flex-wrap items-center gap-10 py-4">
               <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-white">4.9<span className="text-[#c5a059]">/5</span></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Michelin Recommended</span>
               </div>
               <div className="w-px h-10 bg-white/10 hidden md:block" />
               <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-white">12k+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Happy Diners</span>
               </div>
               <div className="w-px h-10 bg-white/10 hidden md:block" />
               <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-white">20+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Signature Dishes</span>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-md bg-white/3 backdrop-blur-2xl border border-white/5 p-8 rounded-4xl flex flex-col gap-6 relative group hover:border-[#c5a059]/30 transition-all duration-700"
          >
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#c5a059] rounded-2xl flex items-center justify-center text-black rotate-[-10deg] group-hover:rotate-0 transition-transform duration-500">
              <span className="text-2xl font-serif">"</span>
            </div>
            <p className="text-sm text-neutral-300 italic font-light leading-loose">
              "The atmosphere at Aurum & Ember is unparalleled. Every dish tells a story of passion and precision. A true masterpiece of fine dining."
            </p>
            <div className="flex items-center justify-between border-t border-white/5 pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c5a059]/30">
                  <img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=c5a059&color=000&bold=true" alt="Sarah" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white tracking-wide">Sarah Jenkins</span>
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Food Critic</span>
                </div>
              </div>
              <div className="flex text-[8px] text-[#c5a059] gap-1">
                <FaStar/><FaStar/><FaStar/><FaStar/><FaStar/>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Auth Card */}
        <div className="flex justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-120 bg-[#111111]/90 backdrop-blur-3xl border border-white/10 rounded-4xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                  {isLogin ? 'Welcome Back' : 'Join the Table'}
                </h2>
                <p className="text-neutral-500 text-[10px] uppercase tracking-[0.2em] font-medium">
                  {isLogin ? 'Access your private dining profile' : 'Begin your gastronomic journey with us'}
                </p>
                {errors.auth && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="mt-4 p-4 bg-red-950/40 border-2 border-red-500/40 rounded-2xl text-center shadow-[0_0_20px_rgba(239,68,68,0.12)]"
                  >
                    <p className="text-red-400 text-xs font-bold">{errors.auth}</p>
                  </motion.div>
                )}
              </div>

              <div className="flex bg-white/5 rounded-2xl p-1 mb-8 relative">
                <button 
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 ${isLogin ? 'text-black' : 'text-neutral-400'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 ${!isLogin ? 'text-black' : 'text-neutral-400'}`}
                >
                  Sign Up
                </button>
                <motion.div 
                  animate={{ x: isLogin ? 0 : '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-lg"
                />
              </div>

              <AnimatePresence mode="wait">
                {showForgot && isLogin ? (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {!forgotSuccess ? (
                      <>
                        <div className="flex items-center gap-2 mb-5">
                          <button type="button" onClick={() => { setShowForgot(false); setForgotError(''); }} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#c5a059] hover:bg-white/10 transition-all cursor-pointer text-xs">
                            &#8592;
                          </button>
                          <h3 className="text-sm font-bold text-white tracking-wide">Reset Password</h3>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed mb-4">Enter the email address associated with your account and we'll send a password reset link.</p>
                        <form onSubmit={handleForgotSubmit} className="space-y-4">
                          <div className="space-y-1">
                            <div className="relative">
                              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={13} />
                              <input
                                type="email"
                                placeholder="Email address"
                                value={forgotEmail}
                                onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                                className="w-full bg-white/5 border-2 border-white/5 focus:border-[#c5a059]/50 outline-none rounded-xl py-3 pl-10 pr-4 text-xs transition-all duration-300 placeholder:text-neutral-600 focus:bg-white/[0.07]"
                                autoFocus
                              />
                            </div>
                          </div>
                          {forgotError && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 font-bold px-1 flex items-center gap-1">
                              <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                              {forgotError}
                            </motion.p>
                          )}
                          <button
                            type="submit"
                            disabled={forgotLoading}
                            className="w-full py-4 bg-[#c5a059] text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(197,160,89,0.2)] hover:scale-[1.01] transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                          >
                            {forgotLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Send Reset Link'}
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-14 h-14 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/25 flex items-center justify-center mx-auto mb-4">
                          <FaEnvelope size={22} className="text-[#c5a059]" />
                        </div>
                        <h3 className="text-white font-bold text-sm mb-2">Check Your Email</h3>
                        <p className="text-neutral-500 text-[11px] leading-relaxed mb-5">
                          We've sent a password reset link to <span className="text-white/70 font-medium">{forgotEmail}</span>. It may take a moment to arrive.
                        </p>
                        <button
                          onClick={() => { setShowForgot(false); setForgotSuccess(false); setForgotEmail(''); }}
                          className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-500 cursor-pointer"
                        >
                          Back to Login
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                  >
                {!isLogin && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center mb-2">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#c5a059]/30 flex items-center justify-center overflow-hidden bg-white/5 group-hover:border-[#c5a059]/80 transition-all cursor-pointer relative shadow-xl">
                          {formData.avatar ? (
                            <img 
                              src={formData.avatar} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                if (!e.target.dataset.fallbackTried) {
                                  e.target.dataset.fallbackTried = "true";
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || formData.name || 'User')}&background=EAB308&color=fff`;
                                } else {
                                  e.target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                                }
                              }}

                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-xl text-neutral-500 group-hover:text-[#c5a059] transition-colors">
                                <FaCamera className="mx-auto" />
                              </div>
                              <span className="text-[8px] uppercase tracking-widest mt-1 block opacity-50">Upload</span>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleImageUpload}
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#c5a059] rounded-full flex items-center justify-center border-4 border-[#111111] shadow-lg">
                          <FaCamera className="text-black text-[10px]" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <input 
                          type="text" 
                          placeholder="Full Name"
                          className={`w-full bg-white/5 border-2 ${errors.fullName ? 'border-red-500/60 bg-red-950/20' : 'border-white/5'} focus:border-[#c5a059]/50 outline-none rounded-xl py-3 px-4 text-xs transition-all duration-300 placeholder:text-neutral-600 focus:bg-white/[0.07] ${shakeField === 'fullName' ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                          style={shakeField === 'fullName' ? { animation: 'shake 0.4s ease-in-out' } : {}}
                          onChange={(e) => {
                            setFormData({...formData, fullName: e.target.value});
                            if (errors.fullName) setErrors({...errors, fullName: null});
                          }}
                        />
                        {errors.fullName && (
                          <motion.p 
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-400 font-bold px-1 flex items-center gap-1"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                            {errors.fullName}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <input 
                          type="tel" 
                          placeholder="Phone Number"
                          className={`w-full bg-white/5 border-2 ${errors.phone ? 'border-red-500/60 bg-red-950/20' : 'border-white/5'} focus:border-[#c5a059]/50 outline-none rounded-xl py-3 px-4 text-xs transition-all duration-300 placeholder:text-neutral-600 focus:bg-white/[0.07] ${shakeField === 'phone' ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                          style={shakeField === 'phone' ? { animation: 'shake 0.4s ease-in-out' } : {}}
                          onChange={(e) => {
                            setFormData({...formData, phone: e.target.value});
                            if (errors.phone) setErrors({...errors, phone: null});
                          }}
                        />
                        {errors.phone && (
                          <motion.p 
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-400 font-bold px-1 flex items-center gap-1"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                            {errors.phone}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <input 
                          type="text" 
                          placeholder="Location/City"
                          className={`w-full bg-white/5 border-2 ${errors.location ? 'border-red-500/60 bg-red-950/20' : 'border-white/5'} focus:border-[#c5a059]/50 outline-none rounded-xl py-3 px-4 text-xs transition-all duration-300 placeholder:text-neutral-600 focus:bg-white/[0.07] ${shakeField === 'location' ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                          style={shakeField === 'location' ? { animation: 'shake 0.4s ease-in-out' } : {}}
                          onChange={(e) => {
                            setFormData({...formData, location: e.target.value});
                            if (errors.location) setErrors({...errors, location: null});
                          }}
                        />
                        {errors.location && (
                          <motion.p 
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-400 font-bold px-1 flex items-center gap-1"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                            {errors.location}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <input 
                          type="text" 
                          placeholder="State"
                          className={`w-full bg-white/5 border-2 ${errors.state ? 'border-red-500/60 bg-red-950/20' : 'border-white/5'} focus:border-[#c5a059]/50 outline-none rounded-xl py-3 px-4 text-xs transition-all duration-300 placeholder:text-neutral-600 focus:bg-white/[0.07] ${shakeField === 'state' ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                          style={shakeField === 'state' ? { animation: 'shake 0.4s ease-in-out' } : {}}
                          onChange={(e) => {
                            setFormData({...formData, state: e.target.value});
                            if (errors.state) setErrors({...errors, state: null});
                          }}
                        />
                        {errors.state && (
                          <motion.p 
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-400 font-bold px-1 flex items-center gap-1"
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                            {errors.state}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              <form onSubmit={handleAuth} className={`space-y-5${!isLogin ? ' mt-6' : ''}`}>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className={`w-full bg-white/5 border-2 ${errors.email ? 'border-red-500/60 bg-red-950/20' : 'border-white/5'} focus:border-[#c5a059]/50 outline-none rounded-xl py-3 px-4 text-xs transition-all duration-300 placeholder:text-neutral-600 focus:bg-white/[0.07] ${shakeField === 'email' ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                      style={shakeField === 'email' ? { animation: 'shake 0.4s ease-in-out' } : {}}
                      onChange={(e) => {
                        setFormData({...formData, email: e.target.value});
                        if (errors.email) setErrors({...errors, email: null});
                      }}
                    />
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 font-bold px-1 flex items-center gap-1"
                      >
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Password"
                        className={`w-full bg-white/5 border-2 ${errors.password ? 'border-red-500/60 bg-red-950/20' : 'border-white/5'} focus:border-[#c5a059]/50 outline-none rounded-xl py-3 px-4 text-xs transition-all duration-300 placeholder:text-neutral-600 focus:bg-white/[0.07] ${shakeField === 'password' ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                        style={shakeField === 'password' ? { animation: 'shake 0.4s ease-in-out' } : {}}
                        onChange={(e) => {
                          setFormData({...formData, password: e.target.value});
                          if (errors.password) setErrors({...errors, password: null});
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-[#c5a059] text-xs"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 font-bold px-1 flex items-center gap-1"
                      >
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                        {errors.password}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-3 h-3 rounded border-white/10 bg-neutral-800 accent-[#c5a059]" />
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500 group-hover:text-neutral-300">Remember Me</span>
                  </label>
                  <button type="button" onClick={() => { setShowForgot(true); setForgotError(''); setForgotSuccess(false); }} className="text-[9px] font-bold uppercase tracking-widest text-[#c5a059] hover:text-white transition-colors cursor-pointer">Forgot?</button>
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-[#c5a059] text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(197,160,89,0.2)] hover:scale-[1.01] transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : (isLogin ? 'Enter The Lounge' : 'Create Credentials')}
                </button>
              </form>

              <div className="relative flex items-center justify-center my-6">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                 <span className="relative bg-[#111111] px-4 text-[8px] text-neutral-600 uppercase font-black tracking-[0.2em]">OR</span>
              </div>

              <div className="flex items-center justify-center my-6">
                <button 
                  type="button"
                  onClick={handleGoogleClick}
                  className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-4 rounded-2xl hover:bg-white hover:text-black transition-all duration-500"
                >
                  <FaGoogle className="text-lg" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Continue with Google</span>
                </button>
              </div>

              <p className="mt-6 text-center text-[8px] text-neutral-600 font-bold uppercase tracking-[0.2em]">
                {isLogin ? "New? " : "Exists? "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-[#c5a059] hover:text-white transition-colors">
                  {isLogin ? 'Join Us' : 'Sign In'}
                </button>
              </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Experiences Section */}
      <section id="experiences" className="relative z-10 py-32 px-6 md:px-16 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059]">Curated Moments</span>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Beyond The <span className="font-serif italic font-normal text-[#c5a059]">Plate</span></h2>
            </div>
            <p className="max-w-md text-neutral-500 text-sm leading-relaxed">
              We believe dining is a multi-sensory journey. Explore our signature experiences designed to elevate your evening.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Chef's Table",
                desc: "An intimate front-row seat to the culinary ballet. Watch as our master chefs craft a 12-course narrative right before your eyes.",
                img: "/images/hero_salmon.png"
              },
              {
                title: "The Ember Vault",
                desc: "Deep within our cellar lies a private sanctuary for rare vintage tastings and exclusive multi-course fire-side pairings.",
                img: "/images/suya_platter.png"
              },
              {
                title: "Moonlight Terrace",
                desc: "Al fresco dining under the stars. Experience the cooling breeze and rhythmic jazz as you savor our signature smoked delicacies.",
                img: "/images/jollof_rice.jpg"
              }
            ].map((exp, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative h-150 rounded-[2.5rem] overflow-hidden border border-white/5"
              >
                <img 
                  src={exp.img} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60" 
                  alt={exp.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";
                  }}

                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 p-10 space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight">{exp.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {exp.desc}
                  </p>
                  <button className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] flex items-center gap-2 group-hover:gap-4 transition-all">
                    Explore Details <FaArrowRight className="text-[8px]" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 py-24 border-t border-white/5 bg-[#0a0a0a] text-center">
         <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                  <FaUtensils className="text-[#c5a059] text-xs" />
               </div>
               <span className="text-xl font-bold tracking-widest uppercase">Aurum <span className="text-[#c5a059] font-serif italic lowercase">&amp;</span> Ember</span>
            </div>
            <div className="flex items-center gap-12 text-[9px] font-black uppercase tracking-[0.4em] text-neutral-500">
               <Link to="/" className="hover:text-white transition-colors">Home</Link>
               <Link to="/menu" className="hover:text-white transition-colors">Menu</Link>
               <a href="#experiences" className="hover:text-white transition-colors">Experiences</a>
               <Link to="/reserve" className="hover:text-white transition-colors">Reservations</Link>
            </div>
            <p className="text-[10px] text-neutral-700 uppercase tracking-[0.6em] mt-8">
               © 2026 Aurum <span className="font-serif italic font-normal">&amp;</span> Ember. All rights reserved.
            </p>
         </div>
      </footer>

      {/* Auth Success Modal */}
      <AuthSuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          if (successIsLogin) {
            finalizeLogin(pendingUser);
            navigate('/');
          } else {
            setIsLogin(true);
          }
        }}
        isLogin={successIsLogin}
        user={pendingUser}
      />
    </div>
  );
};

export default AuthPage;
