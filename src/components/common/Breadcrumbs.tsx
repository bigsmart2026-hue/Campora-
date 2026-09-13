import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const ROUTE_LABELS: Record<string, string> = {
  products: 'Products',
  sell: 'Sell',
  cart: 'Cart',
  checkout: 'Checkout',
  orders: 'Orders',
  profile: 'Profile',
  wishlist: 'Wishlist',
  categories: 'Categories',
  verification: 'Verification',
  'how-it-works': 'How It Works',
  admin: 'Admin',
  help: 'Help',
  disputes: 'Disputes',
  contact: 'Contact',
  safety: 'Safety',
};

export default function Breadcrumbs({ items }: { items?: BreadcrumbItem[] }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbs: BreadcrumbItem[] = items || pathnames.map((name, index) => ({
    label: ROUTE_LABELS[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
    path: `/${pathnames.slice(0, index + 1).join('/')}`,
  }));

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm mb-6 animate-fade-in">
      <Link
        to="/"
        className="flex items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <span key={breadcrumb.path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            {isLast ? (
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                to={breadcrumb.path}
                className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 truncate max-w-[150px]"
              >
                {breadcrumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
