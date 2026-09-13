import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Inspection, InspectionStatus } from '@/types';
import { uploadVerificationDocsToFirestore } from '@/utils/imageStorage';

export async function requestInspection(
  requestId: string,
  inspectorId: string
): Promise<void> {
  const requestRef = doc(db, 'inspections', requestId);
  await updateDoc(requestRef, {
    status: 'scheduled' as InspectionStatus,
    inspectorId,
    scheduledDate: serverTimestamp(),
  });
}

export async function getInspectionByRequest(
  requestId: string
): Promise<Inspection | null> {
  const q = query(
    collection(db, 'inspections'),
    where('requestId', '==', requestId),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Inspection;
}

export async function getInspectionsByInspector(
  inspectorId: string,
  statusFilter?: InspectionStatus[]
): Promise<Inspection[]> {
  const statuses = statusFilter || ['scheduled', 'in_progress'];

  const q = query(
    collection(db, 'inspections'),
    where('inspectorId', '==', inspectorId),
    where('status', 'in', statuses as string[]),
    orderBy('scheduledDate', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Inspection)
  );
}

export async function completeInspection(
  inspectionId: string,
  result: Inspection['result'],
  images?: File[]
): Promise<void> {
  let imageUrls: string[] = [];

  if (images && images.length > 0) {
    imageUrls = await uploadVerificationDocsToFirestore(
      images,
      inspectionId,
      'inspection'
    );
  }

  const docRef = doc(db, 'inspections', inspectionId);
  await updateDoc(docRef, {
    status: 'completed' as InspectionStatus,
    result,
    images: imageUrls,
    completedAt: serverTimestamp(),
  });
}

export async function createInspection(
  inspection: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'inspections'), {
    ...inspection,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getPendingInspections(): Promise<Inspection[]> {
  const q = query(
    collection(db, 'inspections'),
    where('status', '==', 'requested'),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Inspection)
  );
}

export async function assignInspector(
  inspectionId: string,
  inspectorId: string
): Promise<void> {
  const docRef = doc(db, 'inspections', inspectionId);
  await updateDoc(docRef, {
    status: 'scheduled' as InspectionStatus,
    inspectorId,
    updatedAt: serverTimestamp(),
  });
}
