import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, ClipboardList, Heart, PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  onAction?: () => void;
  variant?: 'default' | 'search' | 'cart' | 'orders' | 'wishlist';
}

const VARIANT_ICONS = {
  search: Search,
  cart: ShoppingCart,
  orders: ClipboardList,
  wishlist: Heart,
  default: PackageOpen,
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const VariantIcon = VARIANT_ICONS[variant];

  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <div className="text-primary-500 dark:text-primary-400">
          <VariantIcon className="w-10 h-10" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>
      {action && (
        action.href ? (
          <Link to={action.href} className="btn-primary inline-flex">
            {action.label}
          </Link>
        ) : onAction ? (
          <button onClick={onAction} className="btn-primary">
            {action.label}
          </button>
        ) : null
      )}
    </div>
  );
}
