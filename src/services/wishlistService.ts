import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

export async function addToWishlist(
  userId: string,
  productId: string
): Promise<void> {
  const existing = await query(
    collection(db, 'wishlists'),
    where('userId', '==', userId),
    where('productId', '==', productId)
  );

  const snapshot = await getDocs(existing);
  if (!snapshot.empty) return;

  await addDoc(collection(db, 'wishlists'), {
    userId,
    productId,
    createdAt: serverTimestamp(),
  });
}

export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<void> {
  const q = query(
    collection(db, 'wishlists'),
    where('userId', '==', userId),
    where('productId', '==', productId)
  );

  const snapshot = await getDocs(q);
  snapshot.docs.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
}

export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const q = query(
    collection(db, 'wishlists'),
    where('userId', '==', userId),
    where('productId', '==', productId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function getUserWishlist(userId: string): Promise<string[]> {
  const q = query(
    collection(db, 'wishlists'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().productId);
}

export async function getWishlistProducts(
  productIds: string[]
): Promise<Product[]> {
  if (productIds.length === 0) return [];

  const products: Product[] = [];

  // Firestore 'in' queries are limited to 10 items
  const chunks = productIds.reduce<string[][]>((acc, id, i) => {
    const chunkIndex = Math.floor(i / 10);
    if (!acc[chunkIndex]) acc[chunkIndex] = [];
    acc[chunkIndex].push(id);
    return acc;
  }, []);

  for (const chunk of chunks) {
    const q = query(
      collection(db, 'products'),
      where('__name__', 'in', chunk)
    );

    const snapshot = await getDocs(q);
    products.push(
      ...snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product))
    );
  }

  return products;
}
