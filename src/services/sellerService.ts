import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Product, Review } from '@/types';

export async function getSellerProfile(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function getSellerProducts(
  sellerId: string,
  activeOnly = true
): Promise<Product[]> {
  const conditions = [
    where('sellerId', '==', sellerId),
    orderBy('createdAt', 'desc'),
  ];

  if (activeOnly) {
    conditions.splice(1, 0, where('status', '==', 'active'));
  }

  const q = query(collection(db, 'products'), ...conditions);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Product)
  );
}

export async function getSellerReviews(
  sellerId: string,
  countLimit = 10
): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('revieweeId', '==', sellerId),
    where('isVisible', '==', true),
    orderBy('createdAt', 'desc'),
    limit(countLimit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Review)
  );
}

export async function getTopSellers(
  campusId: string,
  countLimit = 10
): Promise<User[]> {
  const q = query(
    collection(db, 'users'),
    where('campus', '==', campusId),
    where('isIdVerified', '==', true),
    where('isActive', '==', true),
    limit(countLimit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as User)
  );
}
