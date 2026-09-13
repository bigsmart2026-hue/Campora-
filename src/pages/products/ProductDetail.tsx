import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Star,
  Shield,
  CheckCircle,
  MapPin,
  ChevronLeft,
  Share2,
  Flag,
  Eye,
  ArrowRight,
  Package,
  Clock,
  Truck,
  ZoomIn,
} from 'lucide-react';
import { Product, User } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { getProduct } from '@/services/productService';
import { getSellerProfile } from '@/services/sellerService';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/services/wishlistService';
import ImageLightbox from '@/components/common/ImageLightbox';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Skeleton } from '@/components/common/Skeleton';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const productData = await getProduct(id);
        setProduct(productData);

        if (productData) {
          const sellerData = await getSellerProfile(productData.sellerId);
          setSeller(sellerData);

          if (user) {
            const isWishlisted = await isInWishlist(user.id, id);
            setWishlisted(isWishlisted);
          }
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, user]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.images[0],
      sellerId: product.sellerId,
    });
    toast.success('Added to cart');
  };

  const handleWishlistToggle = async () => {
    if (!user || !product) return;

    try {
      if (wishlisted) {
        await removeFromWishlist(user.id, product.id);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(user.id, product.id);
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <Skeleton className="h-4 w-48" />
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-3xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">Product not found</p>
          <Link to="/products" className="btn-primary inline-flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const formatRating = (rating: number) => rating > 0 ? rating.toFixed(1) : 'New';

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const conditionLabels: Record<string, { label: string; color: string }> = {
    new: { label: 'New', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' },
    like_new: { label: 'Like New', color: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-100 dark:border-primary-800' },
    good: { label: 'Good', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' },
    fair: { label: 'Fair', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800' },
  };

  const condition = conditionLabels[product.condition] || conditionLabels.good;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4 animate-fade-in">
            <div
              className="relative aspect-square bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 group cursor-pointer"
              onClick={() => setShowLightbox(true)}
            >
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <Eye className="w-16 h-16 mb-3 opacity-50" />
                  <span className="text-sm font-medium">No Image Available</span>
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ZoomIn className="w-3.5 h-3.5" />
                Click to zoom
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isInspected && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 rounded-xl text-white text-xs font-bold shadow-lg">
                    <Shield className="w-3.5 h-3.5" />
                    Inspected
                  </div>
                )}
                {discount && (
                  <div className="flex items-center px-3 py-1.5 bg-red-500 rounded-xl text-white text-xs font-bold shadow-lg">
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Image counter & dots */}
            {product.images.length > 1 && (
              <div className="flex items-center justify-center gap-2 py-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`transition-all duration-300 rounded-full ${
                      selectedImage === index
                        ? 'w-6 h-2 bg-primary-600 dark:bg-primary-400'
                        : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? 'border-primary-500 ring-2 ring-primary-200 scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 animate-fade-in-up">
            {/* Title & Actions */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {product.category && (
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2 block">
                      {product.category}
                    </span>
                  )}
                   <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                    {product.title}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      wishlisted
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>
                    <button className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {discount && product.originalPrice && (
                  <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${condition.color}`}>
                {condition.label} Condition
              </span>
              {product.isInspected && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-lg text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  Platform Inspected
                </span>
              )}
              {seller?.isIdVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800 rounded-lg text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified Seller
                </span>
              )}
              {seller?.reputation && seller.reputation.totalReviews > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-lg text-xs font-semibold">
                  <Star className="w-3.5 h-3.5" />
                  {formatRating(seller.reputation.averageRating)} ({seller.reputation.totalReviews})
                </span>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Campus</p>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  {product.campus}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Posted</p>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Seller card */}
            {seller && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <Link to={`/seller/${seller.id}`} className="flex items-center gap-3 group">
                    <div className="relative">
                      {seller.avatar ? (
                        <img src={seller.avatar} alt={seller.fullName} className="w-14 h-14 rounded-2xl object-cover" />
                      ) : (
                        <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                          {seller.fullName.charAt(0)}
                        </div>
                      )}
                      {seller.isIdVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{seller.fullName}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {seller.reputation.totalReviews > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            {formatRating(seller.reputation.averageRating)}
                          </span>
                        )}
                        <span>{seller.reputation.successfulTransactions} sales</span>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to={`/seller/${seller.id}`}
                    className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                  >
                    View
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAddToCart} className="flex-1 btn-primary py-4 text-base group">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
                <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </button>
              <button className="flex-1 btn-secondary py-4 text-base">
                <Truck className="w-5 h-5 mr-2" />
                Request Delivery
              </button>
            </div>

            {/* Report */}
            <button className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors group">
              <Flag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Report this listing
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && product.images.length > 0 && (
        <ImageLightbox
          images={product.images}
          initialIndex={selectedImage}
          alt={product.title}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
}
