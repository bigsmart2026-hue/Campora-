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
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, Delivery } from '@/types';
import { hashDeliveryPin as hashPin } from '@/utils/delivery';

export interface RunnerProfile {
  userId: string;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  completedDeliveries: number;
  rating: number;
  totalEarnings: number;
  vehicleType?: 'walking' | 'bicycle' | 'motorcycle' | 'car';
  maxDeliveryDistance: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function registerAsRunner(
  userId: string,
  vehicleType: RunnerProfile['vehicleType'] = 'walking'
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();

  // Update user role
  await updateDoc(userRef, {
    role: 'runner',
    updatedAt: serverTimestamp(),
  });

  // Create runner profile
  await addDoc(collection(db, 'runners'), {
    userId,
    isAvailable: false,
    completedDeliveries: 0,
    rating: 0,
    totalEarnings: 0,
    vehicleType,
    maxDeliveryDistance: 5, // 5km default
    isVerified: userData.isCampusVerified,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getRunnerProfile(
  userId: string
): Promise<RunnerProfile | null> {
  const q = query(
    collection(db, 'runners'),
    where('userId', '==', userId),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { userId: doc.id, ...doc.data() } as RunnerProfile;
}

export async function updateRunnerAvailability(
  userId: string,
  isAvailable: boolean
): Promise<void> {
  const q = query(
    collection(db, 'runners'),
    where('userId', '==', userId),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('Runner profile not found');
  }

  await updateDoc(snapshot.docs[0].ref, {
    isAvailable,
    updatedAt: serverTimestamp(),
  });
}

export async function updateRunnerLocation(
  userId: string,
  lat: number,
  lng: number
): Promise<void> {
  const q = query(
    collection(db, 'runners'),
    where('userId', '==', userId),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('Runner profile not found');
  }

  await updateDoc(snapshot.docs[0].ref, {
    currentLocation: {
      lat,
      lng,
      timestamp: new Date(),
    },
    updatedAt: serverTimestamp(),
  });
}

export async function getAvailableRunners(
  _campusId: string,
  maxDistance: number = 5
): Promise<RunnerProfile[]> {
  const q = query(
    collection(db, 'runners'),
    where('isAvailable', '==', true),
    where('isVerified', '==', true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({ userId: doc.id, ...doc.data() } as RunnerProfile))
    .filter((runner) => runner.maxDeliveryDistance >= maxDistance);
}

export async function createDelivery(
  orderId: string,
  order: Order,
  runnerId: string,
  deliveryPin: string
): Promise<string> {
  const deliveryFee = order.deliveryFee;
  const hashedPin = await hashPin(deliveryPin);

  const docRef = await addDoc(collection(db, 'deliveries'), {
    orderId,
    runnerId,
    status: 'pending',
    pickupLocation: order.pickupLocation || {
      lat: 0,
      lng: 0,
      address: 'Pickup location',
    },
    deliveryLocation: order.deliveryAddress,
    deliveryPin: hashedPin,
    fee: deliveryFee,
    timeline: [
      {
        status: 'pending',
        timestamp: new Date(),
        note: 'Delivery created',
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getDelivery(
  deliveryId: string
): Promise<Delivery | null> {
  const docRef = await getDoc(doc(db, 'deliveries', deliveryId));
  if (!docRef.exists()) return null;
  return { id: docRef.id, ...docRef.data() } as Delivery;
}

export async function getDeliveryByOrder(
  orderId: string
): Promise<Delivery | null> {
  const q = query(
    collection(db, 'deliveries'),
    where('orderId', '==', orderId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Delivery;
}

export async function getRunnerDeliveries(
  runnerId: string,
  status?: string
): Promise<Delivery[]> {
  let q = query(
    collection(db, 'deliveries'),
    where('runnerId', '==', runnerId),
    orderBy('createdAt', 'desc')
  );

  if (status) {
    q = query(
      collection(db, 'deliveries'),
      where('runnerId', '==', runnerId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Delivery)
  );
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: Delivery['status'],
  location?: { lat: number; lng: number },
  note?: string
): Promise<void> {
  const docRef = doc(db, 'deliveries', deliveryId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Delivery not found');
  }

  const delivery = docSnap.data() as Delivery;

  const timeline = [
    ...delivery.timeline,
    {
      status,
      timestamp: new Date(),
      location,
      note,
    },
  ];

  const updateData: Record<string, unknown> = {
    status,
    timeline,
    updatedAt: serverTimestamp(),
  };

  if (location) {
    updateData.currentLocation = {
      ...location,
      timestamp: new Date(),
    };
  }

  await updateDoc(docRef, updateData);
}

export async function verifyDeliveryPin(
  deliveryId: string,
  pin: string
): Promise<boolean> {
  const delivery = await getDelivery(deliveryId);
  if (!delivery) return false;

  const hashedPin = await hashPin(pin);
  return delivery.deliveryPin === hashedPin;
}

export async function completeDelivery(
  deliveryId: string,
  pin: string
): Promise<void> {
  const isValid = await verifyDeliveryPin(deliveryId, pin);
  if (!isValid) {
    throw new Error('Invalid delivery PIN');
  }

  await updateDeliveryStatus(deliveryId, 'delivery_confirmed', undefined, 'PIN verified');

  // Update runner stats
  const delivery = await getDelivery(deliveryId);
  if (delivery) {
    const runnerQuery = query(
      collection(db, 'runners'),
      where('userId', '==', delivery.runnerId),
      limit(1)
    );

    const runnerSnapshot = await getDocs(runnerQuery);
    if (!runnerSnapshot.empty) {
      const runnerDoc = runnerSnapshot.docs[0];
      await updateDoc(runnerDoc.ref, {
        completedDeliveries: (runnerDoc.data().completedDeliveries || 0) + 1,
        totalEarnings: (runnerDoc.data().totalEarnings || 0) + delivery.fee,
        isAvailable: true,
        updatedAt: serverTimestamp(),
      });
    }
  }
}

export async function getPendingDeliveries(): Promise<Delivery[]> {
  const q = query(
    collection(db, 'deliveries'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Delivery)
  );
}
