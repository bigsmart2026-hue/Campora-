import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

const PAYSTACK_SECRET_KEY = functions.config().paystack?.secret_key;

const verificationAttempts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

function isRateLimited(uid: string): boolean {
  const now = Date.now();
  const attempts = verificationAttempts.get(uid) || [];
  const recentAttempts = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW);
  verificationAttempts.set(uid, recentAttempts);
  return recentAttempts.length >= MAX_ATTEMPTS_PER_WINDOW;
}

function recordAttempt(uid: string): void {
  const attempts = verificationAttempts.get(uid) || [];
  attempts.push(Date.now());
  verificationAttempts.set(uid, attempts);
}

export const verifyPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const uid = context.auth.uid;

  if (isRateLimited(uid)) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Too many verification attempts. Please try again later.'
    );
  }

  recordAttempt(uid);

  const { reference, expectedAmount } = data as {
    reference?: string;
    expectedAmount?: number;
  };

  if (!reference || typeof reference !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Payment reference is required'
    );
  }

  if (!PAYSTACK_SECRET_KEY) {
    console.error('PAYSTACK_SECRET_KEY not configured');
    throw new functions.https.HttpsError(
      'internal',
      'Payment verification not configured'
    );
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result?.data) {
      throw new Error('Invalid Paystack response structure');
    }

    const paystackAmount = result.data.amount;
    const paymentStatus = result.data.status;

    if (expectedAmount && paymentStatus === 'success' && paystackAmount !== expectedAmount) {
      console.error(
        `Amount mismatch for ref ${reference}: expected ${expectedAmount}, got ${paystackAmount}`
      );
      return {
        status: false,
        message: 'Payment amount does not match expected amount',
        data: {
          amount: paystackAmount,
          reference: result.data.reference,
          status: paymentStatus,
        },
      };
    }

    return {
      status: paymentStatus === 'success',
      message: result.data.gateway_response,
      data: {
        amount: paystackAmount,
        reference: result.data.reference,
        status: paymentStatus,
      },
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to verify payment'
    );
  }
});
