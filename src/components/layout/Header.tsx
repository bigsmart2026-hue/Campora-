import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart, Sun, Moon, Package, LayoutGrid, ClipboardList, ShoppingBag, Shield, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import NotificationBell from '@/components/common/NotificationBell';
import Logo from '@/components/common/Logo';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const getItemCount = useCartStore((s) => s.getItemCount);
  const { setTheme, getEffectiveTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = getItemCount();
  const searchRef = useRef<HTMLFormElement>(null);
  const isDark = getEffectiveTheme() === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark', !isDark);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  const navLinks = isAuthenticated
    ? [
        { to: '/products', label: 'Browse' },
        { to: '/sell', label: 'Sell' },
        { to: '/orders', label: 'Orders' },
      ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-soft'
          : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Campora home">
            <Logo size="sm" showText={false} />
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              Campora
            </span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form
              ref={searchRef}
              onSubmit={handleSearch}
              className={`relative w-full transition-all duration-300 ${
                searchFocused ? 'scale-[1.02]' : ''
              }`}
            >
              <div className={`relative flex items-center rounded-xl transition-all duration-300 ${
                searchFocused
                  ? 'bg-white dark:bg-gray-800 shadow-lg ring-2 ring-primary-500/20 border-primary-300 dark:border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750'
              } border`}>
                <Search className={`absolute left-3.5 w-4.5 h-4.5 transition-colors duration-200 ${
                  searchFocused ? 'text-primary-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search products, categories, sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-11 pr-4 py-2.5 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-xl"
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
                aria-current={isActive(link.to) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                <Link
                  to="/wishlist"
                  className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                    isActive('/wishlist')
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                      : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                <NotificationBell />

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all duration-200"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <Link
                  to="/cart"
                  className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                    isActive('/cart')
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20'
                  }`}
                  aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg animate-bounce-in" aria-hidden="true">
                      {itemCount}
                    </span>
                  )}
                </Link>

                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* Profile */}
                <Link
                  to="/profile"
                  className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-xl transition-all duration-200 ${
                    isActive('/profile')
                      ? 'bg-primary-50 dark:bg-primary-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  aria-label="Your profile"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-200 ${
                    isActive('/profile') ? 'ring-2 ring-primary-500' : ''
                  }`}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                        {user?.fullName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className={`text-sm font-medium hidden lg:block transition-colors ${
                    isActive('/profile') ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {user?.fullName?.split(' ')[0]}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="ml-1 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn-primary ml-2">
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              aria-label="Search products"
            />
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-fade-in-down">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-10 h-10 rounded-xl overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white font-bold">
                        {user?.fullName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>

                {[
                  { to: '/products', label: 'Browse Products', icon: ShoppingBag },
                  { to: '/sell', label: 'Start Selling', icon: Package },
                  { to: '/sell/dashboard', label: 'Seller Dashboard', icon: LayoutGrid },
                  { to: '/wishlist', label: 'Wishlist', icon: Heart },
                  { to: '/orders', label: 'My Orders', icon: ClipboardList },
                  { to: '/cart', label: `Cart (${itemCount})`, icon: ShoppingCart },
                  { to: '/profile', label: 'Profile', icon: User },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.to)
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive('/admin')
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5" />
                    Admin Dashboard
                  </Link>
                )}

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                  {/* Theme toggle mobile */}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-full transition-all duration-200"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 w-full transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-3 text-center text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block btn-primary text-center py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
