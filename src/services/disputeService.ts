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
import { Dispute, DisputeStatus } from '@/types';
import { uploadVerificationDocsToFirestore } from '@/utils/imageStorage';

export interface DisputeFormData {
  orderId: string;
  reason: string;
  description: string;
  evidence?: File[];
}

export async function fileDispute(
  filedBy: string,
  data: DisputeFormData
): Promise<string> {
  const existingQuery = query(
    collection(db, 'disputes'),
    where('orderId', '==', data.orderId),
    where('status', 'in', ['open', 'under_review'] as DisputeStatus[])
  );

  const existingDocs = await getDocs(existingQuery);
  if (!existingDocs.empty) {
    throw new Error('A dispute already exists for this order');
  }

  let evidenceUrls: string[] = [];
  if (data.evidence && data.evidence.length > 0) {
    evidenceUrls = await uploadVerificationDocsToFirestore(
      data.evidence,
      filedBy,
      'dispute'
    );
  }

  const docRef = await addDoc(collection(db, 'disputes'), {
    orderId: data.orderId,
    filedBy,
    reason: data.reason,
    description: data.description,
    evidenceUrls,
    status: 'open' as DisputeStatus,
    timeline: [
      {
        action: 'Dispute filed',
        timestamp: new Date(),
        actorId: filedBy,
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const orderRef = doc(db, 'orders', data.orderId);
  await updateDoc(orderRef, {
    status: 'disputed',
    disputeId: docRef.id,
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getDispute(disputeId: string): Promise<Dispute | null> {
  const docRef = await getDoc(doc(db, 'disputes', disputeId));
  if (!docRef.exists()) return null;
  return { id: docRef.id, ...docRef.data() } as Dispute;
}

export async function getDisputeByOrder(orderId: string): Promise<Dispute | null> {
  const q = query(
    collection(db, 'disputes'),
    where('orderId', '==', orderId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Dispute;
}

export async function getPendingDisputes(): Promise<Dispute[]> {
  const q = query(
    collection(db, 'disputes'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Dispute)
  );
}

export async function getDisputesByUser(userId: string): Promise<Dispute[]> {
  const q = query(
    collection(db, 'disputes'),
    where('filedBy', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Dispute)
  );
}

export async function assignDisputeToAdmin(
  disputeId: string,
  adminId: string
): Promise<void> {
  const docRef = doc(db, 'disputes', disputeId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Dispute not found');
  }

  const dispute = docSnap.data() as Dispute;

  await updateDoc(docRef, {
    status: 'under_review' as DisputeStatus,
    adminId,
    timeline: [
      ...dispute.timeline,
      {
        action: 'Assigned to admin',
        timestamp: new Date(),
        actorId: adminId,
      },
    ],
    updatedAt: serverTimestamp(),
  });
}

export async function resolveDispute(
  disputeId: string,
  adminId: string,
  resolution: string,
  outcome: 'resolved' | 'closed'
): Promise<void> {
  const docRef = doc(db, 'disputes', disputeId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Dispute not found');
  }

  const dispute = docSnap.data() as Dispute;

  await updateDoc(docRef, {
    status: outcome as DisputeStatus,
    resolution,
    timeline: [
      ...dispute.timeline,
      {
        action: `Dispute ${outcome}: ${resolution}`,
        timestamp: new Date(),
        actorId: adminId,
      },
    ],
    updatedAt: serverTimestamp(),
  });

  const orderRef = doc(db, 'orders', dispute.orderId);
  const orderDoc = await getDoc(orderRef);

  if (orderDoc.exists()) {
    if (outcome === 'resolved') {
      await updateDoc(orderRef, {
        status: 'completed',
        updatedAt: serverTimestamp(),
      });
    }
  }
}

export async function addDisputeNote(
  disputeId: string,
  actorId: string,
  note: string
): Promise<void> {
  const docRef = doc(db, 'disputes', disputeId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Dispute not found');
  }

  const dispute = docSnap.data() as Dispute;

  await updateDoc(docRef, {
    timeline: [
      ...dispute.timeline,
      {
        action: note,
        timestamp: new Date(),
        actorId,
      },
    ],
    updatedAt: serverTimestamp(),
  });
}
