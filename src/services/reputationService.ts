import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review, User } from '@/types';

export async function addReview(
  orderId: string,
  reviewerId: string,
  revieweeId: string,
  productId: string,
  rating: number,
  comment?: string
): Promise<string> {
  // Check if user already reviewed this order
  const existingQuery = query(
    collection(db, 'reviews'),
    where('orderId', '==', orderId),
    where('reviewerId', '==', reviewerId)
  );

  const existingDocs = await getDocs(existingQuery);
  if (!existingDocs.empty) {
    throw new Error('You have already reviewed this order');
  }

  const docRef = await addDoc(collection(db, 'reviews'), {
    orderId,
    reviewerId,
    revieweeId,
    productId,
    rating,
    comment,
    isVisible: true,
    createdAt: serverTimestamp(),
  });

  // Update user reputation
  await updateReputation(revieweeId);

  return docRef.id;
}

export async function updateReputation(userId: string): Promise<void> {
  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('revieweeId', '==', userId),
    where('isVisible', '==', true)
  );

  const snapshot = await getDocs(reviewsQuery);

  if (snapshot.empty) return;

  let totalRating = 0;
  let count = 0;

  snapshot.docs.forEach((doc) => {
    const review = doc.data() as Review;
    totalRating += review.rating;
    count++;
  });

  const averageRating = count > 0 ? totalRating / count : 0;

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'reputation.averageRating': Math.round(averageRating * 10) / 10,
    'reputation.totalReviews': count,
  });
}

export async function getReviewsForUser(
  userId: string,
  countLimit = 10
): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('revieweeId', '==', userId),
    where('isVisible', '==', true),
    orderBy('createdAt', 'desc'),
    limit(countLimit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Review)
  );
}

export async function getReviewsByProduct(
  productId: string,
  countLimit = 10
): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId),
    where('isVisible', '==', true),
    orderBy('createdAt', 'desc'),
    limit(countLimit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Review)
  );
}

export async function getReviewsByOrder(
  orderId: string
): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('orderId', '==', orderId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Review)
  );
}

export async function getTrustScore(userId: string): Promise<{
  score: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  label: string;
}> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    return { score: 0, level: 'bronze', label: 'New User' };
  }

  const user = userDoc.data() as User;
  const { averageRating, totalReviews, successfulTransactions } = user.reputation;

  // Calculate trust score
  let score = 0;

  // Rating contribution (max 40 points)
  score += (averageRating / 5) * 40;

  // Reviews contribution (max 30 points)
  score += Math.min(totalReviews / 10, 1) * 30;

  // Transactions contribution (max 20 points)
  score += Math.min(successfulTransactions / 20, 1) * 20;

  // Verification bonus (10 points each)
  if (user.isCampusVerified) score += 5;
  if (user.isIdVerified) score += 5;

  score = Math.round(score);

  // Determine level
  let level: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
  let label = 'New User';

  if (score >= 80) {
    level = 'platinum';
    label = 'Trusted Seller';
  } else if (score >= 60) {
    level = 'gold';
    label = 'Established Seller';
  } else if (score >= 40) {
    level = 'silver';
    label = 'Verified Seller';
  } else if (score >= 20) {
    level = 'bronze';
    label = 'Active Seller';
  }

  return { score, level, label };
}
