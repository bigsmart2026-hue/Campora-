import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, ProductStatus } from '@/types';

const PRODUCTS_PER_PAGE = 12;

export async function createProduct(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'viewCount' | 'trustScore'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'products'), {
    ...product,
    viewCount: 0,
    trustScore: product.isInspected ? 100 : 50,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });
  return docRef.id;
}

export async function getProduct(productId: string): Promise<Product | null> {
  const productDoc = await getDoc(doc(db, 'products', productId));
  if (!productDoc.exists()) return null;

  await updateDoc(doc(db, 'products', productId), {
    viewCount: increment(1),
  });

  return { id: productDoc.id, ...productDoc.data() } as Product;
}

export async function getProductById(productId: string): Promise<Product | null> {
  const productDoc = await getDoc(doc(db, 'products', productId));
  if (!productDoc.exists()) return null;
  return { id: productDoc.id, ...productDoc.data() } as Product;
}

export async function updateProduct(
  productId: string,
  data: Partial<Product>
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, 'products', productId));
}

export async function getProductsByCampus(
  campusId: string,
  lastVisible?: DocumentSnapshot
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, 'products'),
    where('campus', '==', campusId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(PRODUCTS_PER_PAGE)
  );

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Product)
  );
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { products, lastDoc };
}

export async function getProductsByCategory(
  campusId: string,
  categoryId: string,
  lastVisible?: DocumentSnapshot
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, 'products'),
    where('campus', '==', campusId),
    where('category', '==', categoryId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(PRODUCTS_PER_PAGE)
  );

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Product)
  );
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { products, lastDoc };
}

export async function searchProducts(
  campusId: string,
  searchTerm: string
): Promise<Product[]> {
  const searchLower = searchTerm.toLowerCase();

  const q = query(
    collection(db, 'products'),
    where('campus', '==', campusId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
    .filter(
      (product) =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    )
    .slice(0, 20);
}

export async function getProductsBySeller(
  sellerId: string,
  statusFilter?: ProductStatus[]
): Promise<Product[]> {
  const statuses = statusFilter || ['active', 'sold', 'reserved'];

  const q = query(
    collection(db, 'products'),
    where('sellerId', '==', sellerId),
    where('status', 'in', statuses as string[]),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Product)
  );
}

export async function getRecentProducts(
  campusId: string,
  countLimit = 8
): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('campus', '==', campusId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(countLimit)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Product)
  );
}
