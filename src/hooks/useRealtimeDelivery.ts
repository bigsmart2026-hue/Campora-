import { useState, useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Delivery } from '@/types';

export function useRealtimeDelivery(deliveryId: string | undefined) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!deliveryId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const deliveryRef = doc(db, 'deliveries', deliveryId);

    const unsubscribe = onSnapshot(
      deliveryRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setDelivery({ id: docSnap.id, ...docSnap.data() } as Delivery);
        } else {
          setDelivery(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deliveryId]);

  return { delivery, loading, error };
}
