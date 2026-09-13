import * as admin from 'firebase-admin';

admin.initializeApp();

import { handlePaystackWebhook } from './handlers/paystack';
import { verifyPayment } from './handlers/verifyPayment';

export { handlePaystackWebhook, verifyPayment };
