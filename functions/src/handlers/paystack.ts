import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const db = admin.firestore();

const PAYSTACK_SECRET_KEY = functions.config().paystack?.secret_key;

interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    metadata: {
      orderId?: string;
      userId?: string;
      items?: Array<{ productId: string; quantity: number }>;
    };
    channel: string;
    fees: number;
  };
}

function verifyPaystackSignature(
  rawBody: string,
  signature: string
): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    console.error('PAYSTACK_SECRET_KEY not configured');
    return false;
  }

  const expectedHash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  const a = Buffer.from(expectedHash, 'hex');
  const b = Buffer.from(signature, 'hex');

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

export const handlePaystackWebhook = functions.https.onRequest(
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const signature = req.headers['x-paystack-signature'] as string;

    if (!signature) {
      res.status(400).send('Missing signature');
      return;
    }

    const rawBody = (req as Record<string, unknown>)._rawBody as string | undefined;
    if (!rawBody) {
      console.error('Raw body not available for signature verification');
      res.status(400).send('Missing raw body');
      return;
    }

    if (!verifyPaystackSignature(rawBody, signature)) {
      console.error('Invalid Paystack signature');
      res.status(401).send('Invalid signature');
      return;
    }

    const event = req.body as PaystackWebhookEvent;

    if (!event?.event || !event?.data) {
      res.status(400).send('Invalid webhook payload');
      return;
    }

    try {
      switch (event.event) {
        case 'charge.success':
          await handleChargeSuccess(event.data);
          break;

        case 'charge.failed':
          await handleChargeFailed(event.data);
          break;

        case 'refund.created':
          await handleRefundCreated(event.data);
          break;

        default:
          console.log(`Unhandled event: ${event.event}`);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Internal server error');
    }
  }
);

async function handleChargeSuccess(data: PaystackWebhookEvent['data']) {
  const { reference, amount, metadata } = data;

  const ordersQuery = await db
    .collection('orders')
    .where('paymentRef', '==', reference)
    .limit(1)
    .get();

  if (ordersQuery.empty) {
    console.log(`No order found for reference: ${reference}`);
    return;
  }

  const orderDoc = ordersQuery.docs[0];
  const order = orderDoc.data();

  if (order.status === 'payment_confirmed') {
    console.log(`Order ${orderDoc.id} already processed`);
    return;
  }

  if (order.total && amount !== order.total) {
    console.error(
      `Amount mismatch for order ${orderDoc.id}: expected ${order.total}, got ${amount}`
    );
    await orderDoc.ref.update({
      status: 'payment_failed',
      timeline: admin.firestore.FieldValue.arrayUnion({
        status: 'payment_failed',
        timestamp: new Date(),
        note: `Amount mismatch: expected ${order.total}, received ${amount}`,
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return;
  }

  await orderDoc.ref.update({
    status: 'payment_confirmed',
    timeline: admin.firestore.FieldValue.arrayUnion({
      status: 'payment_confirmed',
      timestamp: new Date(),
      note: `Payment confirmed via Paystack (Ref: ${reference})`,
    }),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (order.items && Array.isArray(order.items)) {
    const batch = db.batch();

    for (const item of order.items) {
      const productRef = db.collection('products').doc(item.productId);
      batch.update(productRef, {
        status: 'reserved',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  }

  await db.collection('notifications').add({
    userId: order.sellerId,
    type: 'order_received',
    title: 'New Order Received',
    body: `You have a new order for ${order.items?.length || 0} item(s)`,
    data: { orderId: orderDoc.id },
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Order ${orderDoc.id} payment confirmed`);
}

async function handleChargeFailed(data: PaystackWebhookEvent['data']) {
  const { reference } = data;

  const ordersQuery = await db
    .collection('orders')
    .where('paymentRef', '==', reference)
    .limit(1)
    .get();

  if (ordersQuery.empty) {
    return;
  }

  const orderDoc = ordersQuery.docs[0];

  await orderDoc.ref.update({
    status: 'payment_failed',
    timeline: admin.firestore.FieldValue.arrayUnion({
      status: 'payment_failed',
      timestamp: new Date(),
      note: 'Payment failed via Paystack',
    }),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Order ${orderDoc.id} payment failed`);
}

async function handleRefundCreated(data: PaystackWebhookEvent['data']) {
  const { reference } = data;

  const ordersQuery = await db
    .collection('orders')
    .where('paymentRef', '==', reference)
    .limit(1)
    .get();

  if (ordersQuery.empty) {
    return;
  }

  const orderDoc = ordersQuery.docs[0];

  await orderDoc.ref.update({
    status: 'refunded',
    timeline: admin.firestore.FieldValue.arrayUnion({
      status: 'refunded',
      timestamp: new Date(),
      note: 'Refund processed',
    }),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const order = orderDoc.data();
  if (order.items && Array.isArray(order.items)) {
    const batch = db.batch();

    for (const item of order.items) {
      const productRef = db.collection('products').doc(item.productId);
      batch.update(productRef, {
        status: 'active',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  }

  console.log(`Order ${orderDoc.id} refunded`);
}
