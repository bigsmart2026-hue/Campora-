import { useState, useEffect } from 'react';
import { Product, User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { isInWishlist } from '@/services/wishlistService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProductWithSeller extends Product {
  seller?: User | null;
}

interface UseProductListDataResult {
  productsWithSellers: ProductWithSeller[];
  wishlistedIds: Set<string>;
  toggleWishlist: (productId: string, wishlisted: boolean) => void;
  loading: boolean;
}

export function useProductListData(products: Product[]): UseProductListDataResult {
  const { user } = useAuth();
  const [productsWithSellers, setProductsWithSellers] = useState<ProductWithSeller[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length === 0) {
      setProductsWithSellers([]);
      setLoading(false);
      return;
    }

    const loadProductsData = async () => {
      try {
        // Collect unique seller IDs
        const sellerIds = [...new Set(products.map((p) => p.sellerId))];

        // Batch fetch seller profiles
        const sellerPromises = sellerIds.map(async (id) => {
          try {
            const sellerDoc = await getDoc(doc(db, 'users', id));
            if (sellerDoc.exists()) {
              return { id, data: { id: sellerDoc.id, ...sellerDoc.data() } as User };
            }
            return { id, data: null };
          } catch {
            return { id, data: null };
          }
        });

        const sellerResults = await Promise.all(sellerPromises);
        const sellerMap = new Map<string, User | null>(
          sellerResults.map((r) => [r.id, r.data])
        );

        // Map products with sellers
        const enriched = products.map((p) => ({
          ...p,
          seller: sellerMap.get(p.sellerId) ?? null,
        }));

        setProductsWithSellers(enriched);

        // Batch check wishlist
        if (user) {
          const wishlistPromises = products.map(async (p) => {
            try {
              const result = await isInWishlist(user.id, p.id);
              return { productId: p.id, isWishlisted: result };
            } catch {
              return { productId: p.id, isWishlisted: false };
            }
          });

          const wishlistResults = await Promise.all(wishlistPromises);
          const wishlistSet = new Set(
            wishlistResults.filter((r) => r.isWishlisted).map((r) => r.productId)
          );
          setWishlistedIds(wishlistSet);
        }
      } catch (error) {
        console.error('Failed to load products data:', error);
        setProductsWithSellers(products.map((p) => ({ ...p, seller: null })));
      } finally {
        setLoading(false);
      }
    };

    loadProductsData();
  }, [products, user]);

  const toggleWishlist = (productId: string, wishlisted: boolean) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (wishlisted) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return next;
    });
  };

  return {
    productsWithSellers,
    wishlistedIds,
    toggleWishlist,
    loading,
  };
}