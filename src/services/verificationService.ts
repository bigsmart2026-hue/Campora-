import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Verification, VerificationStatus } from '@/types';
import { uploadVerificationDocsToFirestore } from '@/utils/imageStorage';

export async function submitVerification(
  userId: string,
  type: Verification['type'],
  documents: File[]
): Promise<string> {
  const existingQuery = query(
    collection(db, 'verifications'),
    where('userId', '==', userId),
    where('type', '==', type),
    where('status', '==', 'pending')
  );

  const existingDocs = await getDocs(existingQuery);
  if (!existingDocs.empty) {
    throw new Error('You already have a pending verification for this type');
  }

  const documentUrls = await uploadVerificationDocsToFirestore(
    documents,
    userId,
    type
  );

  const docRef = await addDoc(collection(db, 'verifications'), {
    userId,
    type,
    documentUrls,
    status: 'pending' as VerificationStatus,
    submittedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getVerification(
  verificationId: string
): Promise<Verification | null> {
  const docRef = await getDoc(doc(db, 'verifications', verificationId));
  if (!docRef.exists()) return null;
  return { id: docRef.id, ...docRef.data() } as Verification;
}

export async function getUserVerifications(
  userId: string
): Promise<Verification[]> {
  const q = query(
    collection(db, 'verifications'),
    where('userId', '==', userId),
    orderBy('submittedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Verification)
  );
}

export async function getPendingVerifications(): Promise<Verification[]> {
  const q = query(
    collection(db, 'verifications'),
    where('status', '==', 'pending'),
    orderBy('submittedAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Verification)
  );
}

export async function approveVerification(
  verificationId: string,
  adminId: string
): Promise<void> {
  const docRef = doc(db, 'verifications', verificationId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Verification not found');
  }

  const verification = docSnap.data() as Verification;

  await updateDoc(docRef, {
    status: 'approved' as VerificationStatus,
    reviewedBy: adminId,
    reviewedAt: serverTimestamp(),
  });

  const userRef = doc(db, 'users', verification.userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const updateData: Record<string, unknown> = {};

    if (verification.type === 'campus_id' || verification.type === 'student_id') {
      updateData.isCampusVerified = true;
    }

    if (verification.type === 'seller') {
      updateData.isIdVerified = true;
    }

    await updateDoc(userRef, updateData);
  }
}

export async function rejectVerification(
  verificationId: string,
  adminId: string,
  reason: string
): Promise<void> {
  const docRef = doc(db, 'verifications', verificationId);

  await updateDoc(docRef, {
    status: 'rejected' as VerificationStatus,
    reviewedBy: adminId,
    reviewedAt: serverTimestamp(),
    reviewNote: reason,
  });
}

export async function getVerificationByUserAndType(
  userId: string,
  type: Verification['type']
): Promise<Verification | null> {
  const q = query(
    collection(db, 'verifications'),
    where('userId', '==', userId),
    where('type', '==', type),
    where('status', 'in', ['pending', 'approved'] as VerificationStatus[]),
    orderBy('submittedAt', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Verification;
}
