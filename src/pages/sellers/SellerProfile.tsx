import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Shield,
  MapPin,
  Package,
  MessageCircle,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { User, Product, Review } from '@/types';
import { getSellerProfile, getSellerProducts, getSellerReviews } from '@/services/sellerService';
import ProductCard from '@/components/product/ProductCard';

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

  useEffect(() => {
    async function loadSellerData() {
      if (!id) return;

      try {
        const [sellerData, sellerProducts, sellerReviews] = await Promise.all([
          getSellerProfile(id),
          getSellerProducts(id),
          getSellerReviews(id, 20),
        ]);

        setSeller(sellerData);
        setProducts(sellerProducts);
        setReviews(sellerReviews);
      } catch (error) {
        console.error('Error loading seller data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSellerData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Seller not found</p>
        <Link to="/products" className="mt-4 text-primary-600 dark:text-primary-400 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/products"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to products
        </Link>

        {/* Seller Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="h-32 bg-primary-600" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl border-4 border-white dark:border-gray-800 shadow-sm flex items-center justify-center">
                {seller.avatar ? (
                  <img
                    src={seller.avatar}
                    alt={seller.fullName}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {seller.fullName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {seller.fullName}
                  </h1>
                  {seller.isIdVerified && (
                    <span className="badge badge-success">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {seller.campus || 'Campus not set'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {seller.reputation.averageRating > 0
                      ? seller.reputation.averageRating.toFixed(1)
                      : 'No ratings'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {seller.reputation.successfulTransactions} sales
                  </div>
                </div>
              </div>
              <Link
                to={`/messages/${seller.id}`}
                className="btn-secondary"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Seller
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 max-w-xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {activeTab === 'products' && products.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No products listed yet</p>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {review.reviewerId.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Buyer</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-sm text-gray-400 dark:text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                )}
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
                <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
