import { useState, useEffect } from 'react';
import { onSnapshot, query, where, orderBy, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';

export function useRealtimeOrders(userId: string | undefined, role: 'buyer' | 'seller' | 'runner' = 'buyer') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const field = role === 'buyer' ? 'buyerId' : role === 'seller' ? 'sellerId' : 'runnerId';
    const q = query(
      collection(db, 'orders'),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Order)
        );
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, role]);

  return { orders, loading, error };
}
