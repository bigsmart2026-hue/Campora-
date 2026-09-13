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
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus, OrderTimeline } from '@/types';
import { canTransitionOrder } from '@/utils/orderStateMachine';
import { hashDeliveryPin as hashPin } from '@/utils/delivery';

const PLATFORM_FEE_PERCENT = 5; // 5%
const DELIVERY_FEE_BASE = 500; // ₦500

export function calculateOrderTotal(
  subtotal: number,
  hasDelivery: boolean
): {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
} {
  const deliveryFee = hasDelivery ? DELIVERY_FEE_BASE : 0;
  const platformFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100));
  const total = subtotal + deliveryFee + platformFee;

  return { subtotal, deliveryFee, platformFee, total };
}

export async function createOrder(
  orderData: Omit<
    Order,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'timeline'
    | 'platformFee'
    | 'total'
    | 'paymentRef'
  >,
  paymentRef: string
): Promise<string> {
  const { deliveryFee, platformFee, total } = calculateOrderTotal(
    orderData.subtotal,
    !!orderData.deliveryFee
  );

  const timeline: OrderTimeline[] = [
    {
      status: 'payment_confirmed',
      timestamp: new Date(),
      note: 'Payment confirmed via Paystack',
    },
  ];

  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    paymentRef,
    deliveryFee,
    platformFee,
    total,
    timeline,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update product status to reserved
  const batch = writeBatch(db);
  for (const item of orderData.items) {
    const productRef = doc(db, 'products', item.productId);
    batch.update(productRef, {
      status: 'reserved',
      updatedAt: serverTimestamp(),
    });
  }

  // Update seller's successful transactions
  const sellerRef = doc(db, 'users', orderData.sellerId);
  batch.update(sellerRef, {
    'reputation.successfulTransactions': increment(1),
    updatedAt: serverTimestamp(),
  });

  // Update campus stats
  const campusRef = doc(db, 'campuses', orderData.campus);
  batch.update(campusRef, {
    'stats.totalOrders': increment(1),
  });

  await batch.commit();

  return docRef.id;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const orderDoc = await getDoc(doc(db, 'orders', orderId));
  if (!orderDoc.exists()) return null;
  return { id: orderDoc.id, ...orderDoc.data() } as Order;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actorId?: string,
  note?: string
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  const orderDoc = await getDoc(orderRef);

  if (!orderDoc.exists()) {
    throw new Error('Order not found');
  }

  const order = orderDoc.data() as Order;

  // Validate state transition
  if (!canTransitionOrder(order.status, newStatus)) {
    throw new Error(
      `Invalid status transition from ${order.status} to ${newStatus}`
    );
  }

  const newTimeline = [
    ...order.timeline,
    {
      status: newStatus,
      timestamp: new Date(),
      actorId,
      note,
    },
  ];

  await updateDoc(orderRef, {
    status: newStatus,
    timeline: newTimeline,
    updatedAt: serverTimestamp(),
  });

  // Handle special status changes
  if (newStatus === 'cancelled') {
    // Restore product status
    const batch = writeBatch(db);
    for (const item of order.items) {
      const productRef = doc(db, 'products', item.productId);
      batch.update(productRef, {
        status: 'active',
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }

  if (newStatus === 'completed') {
    // Update product status to sold
    const batch = writeBatch(db);
    for (const item of order.items) {
      const productRef = doc(db, 'products', item.productId);
      batch.update(productRef, {
        status: 'sold',
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }
}

export async function getOrdersByBuyer(
  buyerId: string
): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('buyerId', '==', buyerId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Order)
  );
}

export async function getOrdersBySeller(
  sellerId: string
): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('sellerId', '==', sellerId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Order)
  );
}

export async function getOrdersByRunner(
  runnerId: string
): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('runnerId', '==', runnerId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Order)
  );
}

export async function assignRunner(
  orderId: string,
  runnerId: string
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  const orderDoc = await getDoc(orderRef);

  if (!orderDoc.exists()) {
    throw new Error('Order not found');
  }

  const order = orderDoc.data() as Order;

  if (!canTransitionOrder(order.status, 'assigned_to_runner')) {
    throw new Error('Order cannot be assigned to runner at this time');
  }

  const timeline = [
    ...order.timeline,
    {
      status: 'assigned_to_runner' as OrderStatus,
      timestamp: new Date(),
      actorId: runnerId,
      note: 'Runner assigned',
    },
  ];

  await updateDoc(orderRef, {
    runnerId,
    status: 'assigned_to_runner',
    timeline,
    updatedAt: serverTimestamp(),
  });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  return getOrder(orderId);
}

export async function verifyDeliveryPin(
  orderId: string,
  pin: string
): Promise<boolean> {
  const order = await getOrder(orderId);
  if (!order) return false;

  const hashedPin = await hashPin(pin);
  return order.deliveryPin === hashedPin;
}
