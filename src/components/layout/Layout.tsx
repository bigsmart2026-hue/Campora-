import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Package } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import BackToTop from '@/components/common/BackToTop';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';

function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const getItemCount = useCartStore((s) => s.getItemCount);
  const itemCount = getItemCount();

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) return null;

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Browse', icon: Search },
    { to: '/sell', label: 'Sell', icon: Package },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all duration-200 ${
              isActive(link.to)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            aria-label={link.label}
            aria-current={isActive(link.to) ? 'page' : undefined}
          >
            <div className="relative">
              <link.icon className="w-5 h-5" strokeWidth={isActive(link.to) ? 2.5 : 2} />
              {link.badge !== undefined && link.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {link.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive(link.to) ? 'text-primary-600 dark:text-primary-400' : ''}`}>
              {link.label}
            </span>
            {isActive(link.to) && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors duration-200">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <BackToTop />
    </div>
  );
}
