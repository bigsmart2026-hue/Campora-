import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types';

const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Electronics', slug: 'electronics', icon: 'Smartphone', isActive: true },
  { name: 'Books & Notes', slug: 'books', icon: 'BookOpen', isActive: true },
  { name: 'Furniture', slug: 'furniture', icon: 'Armchair', isActive: true },
  { name: 'Clothing', slug: 'clothing', icon: 'Shirt', isActive: true },
  { name: 'Sports & Gym', slug: 'sports', icon: 'Dumbbell', isActive: true },
  { name: 'Kitchen', slug: 'kitchen', icon: 'ChefHat', isActive: true },
  { name: 'Beauty', slug: 'beauty', icon: 'Sparkles', isActive: true },
  { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', isActive: true },
  { name: 'Musical Instruments', slug: 'music', icon: 'Music', isActive: true },
  { name: 'Services', slug: 'services', icon: 'Wrench', isActive: true },
  { name: 'Other', slug: 'other', icon: 'Package', isActive: true },
];

export async function getCategories(): Promise<Category[]> {
  const q = query(
    collection(db, 'categories'),
    where('isActive', '==', true)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return DEFAULT_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: `cat_${index + 1}`,
    })) as Category[];
  }

  const categories = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Category)
  );

  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const q = query(
    collection(db, 'categories'),
    where('slug', '==', slug),
    where('isActive', '==', true)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Category;
}

export async function getCategoryById(
  categoryId: string
): Promise<Category | null> {
  const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
  if (!categoryDoc.exists()) return null;
  return { id: categoryDoc.id, ...categoryDoc.data() } as Category;
}
