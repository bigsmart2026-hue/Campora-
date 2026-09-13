import { Link } from 'react-router-dom';
import { Heart, Star, Shield, CheckCircle, Eye, MapPin } from 'lucide-react';
import { Product, User } from '@/types';
import { formatPrice } from '@/utils/format';
import { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addToWishlist, removeFromWishlist } from '@/services/wishlistService';
import toast from 'react-hot-toast';
import LazyImage from '@/components/common/LazyImage';

interface ProductCardProps {
  product: Product;
  seller?: User | null;
  isWishlisted?: boolean;
  onWishlistChange?: (productId: string, wishlisted: boolean) => void;
  index?: number;
}

export default memo(function ProductCard({
  product,
  seller: sellerProp,
  isWishlisted: isWishlistedProp = false,
  onWishlistChange,
  index = 0,
}: ProductCardProps) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(isWishlistedProp);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setWishlisted(isWishlistedProp);
  }, [isWishlistedProp]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleWishlistToggle = useCallback(async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      const newState = !wishlisted;
      setWishlisted(newState);
      onWishlistChange?.(product.id, newState);

      if (newState) {
        await addToWishlist(user.id, product.id);
        toast.success('Added to wishlist');
      } else {
        await removeFromWishlist(user.id, product.id);
        toast.success('Removed from wishlist');
      }
    } catch {
      setWishlisted(!wishlisted);
      onWishlistChange?.(product.id, !wishlisted);
      toast.error('Failed to update wishlist');
    }
  }, [user, wishlisted, product.id, onWishlistChange]);

  const formatRating = (rating: number) => {
    return rating > 0 ? rating.toFixed(1) : 'New';
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100/80 dark:border-gray-700/80 transition-all duration-500 hover:shadow-card-hover hover:border-gray-200/80 dark:hover:border-gray-600/80 hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {product.images[0] ? (
            <LazyImage
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
              <Eye className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-xs font-medium">No Image</span>
            </div>
          )}

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isInspected && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500 rounded-lg text-white text-[11px] font-bold uppercase tracking-wide shadow-lg">
                <Shield className="w-3 h-3" />
                Inspected
              </div>
            )}
            {discount && (
              <div className="flex items-center px-2.5 py-1.5 bg-red-500 rounded-lg text-white text-[11px] font-bold shadow-lg">
                -{discount}%
              </div>
            )}
          </div>

          {/* Seller rating badge */}
          {sellerProp && sellerProp.reputation.totalReviews > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {formatRating(sellerProp.reputation.averageRating)}
            </div>
          )}

          {/* Wishlist button - always visible on touch, hover on desktop */}
          <button
            className={`absolute bottom-3 right-3 p-2.5 rounded-xl transition-all duration-300 shadow-lg focus-visible:ring-2 focus-visible:ring-primary-500 ${
              wishlisted
                ? 'bg-red-500 text-white scale-100'
                : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700'
            } md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 opacity-100 translate-y-0`}
            onClick={handleWishlistToggle}
            onTouchStart={handleWishlistToggle}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 transition-all duration-300 ${wishlisted ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category & Time */}
          <div className="flex items-center justify-between mb-2">
            {product.category && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                {product.category}
              </span>
            )}
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 leading-snug">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {discount && product.originalPrice && (
              <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              {sellerProp ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {sellerProp.fullName.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1">
                    {sellerProp.isIdVerified && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[100px]">
                      {sellerProp.fullName.split(' ')[0]}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500">Loading...</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <MapPin className="w-3 h-3" />
              {product.campus}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});
