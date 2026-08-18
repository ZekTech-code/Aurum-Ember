import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Lock,} from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'About', to: '/#about' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Events', to: '/#events' },
  { label: 'Contact', to: '/#contact' },
];

const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const CutleryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

function Navbar({ isDark, onToggleTheme, cart = [] }) {
  const { user, isAuthenticated,} = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      const clickedInsideNavbar = menuRef.current?.contains(e.target);
      const clickedInsideMobileMenu = mobileMenuRef.current?.contains(e.target);

      if (!clickedInsideNavbar && !clickedInsideMobileMenu) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchInput)}`);
      setSearchInput('');
      closeMenu();
    }
  };

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/' && !location.hash;
    if (to.includes('#')) return location.pathname === '/' && location.hash === `#${to.split('#')[1]}`;
    return location.pathname === to;
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const navOffset = window.innerWidth <= 1024 ? 64 : 76;
    const top = section.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  };

  const handleNavClick = (e, to) => {
    e.preventDefault();
    closeMenu();

    if (to === '/') {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
      return;
    }

    if (to.includes('#')) {
      const sectionId = to.split('#')[1];
      navigate(`/#${sectionId}`);
      setTimeout(() => scrollToSection(sectionId), 60);
      return;
    }

    navigate(to);
  };

  return (
    <>
      <nav
        ref={menuRef}
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" aria-label="Aurum & Ember – Home" onClick={closeMenu}>
            <div className="logo-emblem" aria-hidden="true">
              <CutleryIcon />
            </div>
            <div className="logo-text">
              <span className="logo-name">Aurum &amp; Ember</span>
              <span className="logo-tagline">Fine Dining</span>
            </div>
          </Link>

          {/* Search bar */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search meals..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search meals"
              />
              <button className="search-icon-btn" aria-label="Search" type="submit">
                <SearchIcon />
              </button>
            </div>
          </form>

          <ul className="navbar-links" role="list">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`nav-link${isActive(to) ? ' active' : ''}`}
                  onClick={(e) => handleNavClick(e, to)}
                  aria-current={isActive(to) ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <button
              className="theme-toggle"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            <Link to="/cart" className="cart-btn" aria-label="View shopping cart" title={`Cart (${cart.length} items)`}>
              <CartIcon />
              {cart.length > 0 && <span className="cart-badge">{cart.length > 9 ? "9+" : cart.length}</span>}
            </Link>

            {isAuthenticated ? (
              <Link to="/profile" className="profile-link" aria-label="My Profile" title="My Profile">
                <ProfileAvatar
                  src={user.avatar}
                  alt={user.name}
                  name={user.name}
                  size="xs"
                  editable={false}
                />
              </Link>
            ) : (
              <Link to="/login" className="login-link-nav">Login</Link>
            )}

            <Link to="/reserve" className="btn-reserve desktop-only" aria-label="Reserve a table">
              <CalendarIcon />
              Reserve a Table
            </Link>

            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="mobile-divider" />

        {NAV_LINKS.map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link${isActive(to) ? ' active' : ''}`}
            onClick={(e) => handleNavClick(e, to)}
            aria-current={isActive(to) ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
        <div className="mobile-divider" />
        <Link to="/reserve" className="btn-reserve" onClick={closeMenu} aria-label="Reserve a table">
          <CalendarIcon />
          Reserve a Table
        </Link>

        <div className="mobile-divider" />
        
        <div className="mobile-actions">
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <Link to="/cart" className="cart-btn" onClick={closeMenu} aria-label="View shopping cart">
            <CartIcon />
            <span>Cart ({cart.length})</span>
          </Link>
          
          {isAuthenticated ? (
            <Link to="/profile" className="cart-btn" onClick={closeMenu}>
              <User size={18} />
              <span>Profile</span>
            </Link>
          ) : (
            <Link to="/login" className="cart-btn" onClick={closeMenu}>
              <Lock size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
