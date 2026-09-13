import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { loadPaystackScript } from '@/utils/paystack';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export interface PaystackPayment {
  reference: string;
  amount: number;
  email: string;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializePayment(
  email: string,
  amountInKobo: number,
  reference: string,
  metadata?: Record<string, unknown>
): Promise<PaystackResponse> {
  await loadPaystackScript();

  return new Promise((resolve, reject) => {
    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amountInKobo,
      currency: 'NGN',
      ref: reference,
      metadata,
      callback: (response: PaystackResponse) => {
        resolve(response);
      },
      onClose: () => {
        reject(new Error('Payment cancelled'));
      },
    });

    handler.openIframe();
  });
}

export async function verifyPayment(
  reference: string,
  expectedAmount?: number
): Promise<{ status: boolean; message: string }> {
  const verifyPaymentCallable = httpsCallable(functions, 'verifyPayment');
  const result = await verifyPaymentCallable({ reference, expectedAmount });
  return result.data as { status: boolean; message: string };
}

export function formatPaystackAmount(amountInKobo: number): string {
  return `₦${(amountInKobo / 100).toLocaleString()}`;
}
