import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CreditCard, MapPin, Shield, CheckCircle, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cartStore';
import { createOrder, calculateOrderTotal } from '@/services/orderService';
import {
  initializePayment,
} from '@/services/paymentService';
import { formatPrice, generateReference } from '@/utils/format';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  address: z.string().min(5, 'Please enter a valid address'),
  landmark: z.string().optional(),
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(11, 'Phone number is too long'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, getTotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>(
    'details'
  );

  const total = getTotal();
  const orderTotal = calculateOrderTotal(total, true);

  // Check if cart has items from multiple sellers
  const sellerIds = [...new Set(items.map((item) => item.sellerId))];
  const hasMultipleSellers = sellerIds.length > 1;

  // Group items by seller for display
  const itemsBySeller = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach(item => {
      if (!groups[item.sellerId]) groups[item.sellerId] = [];
      groups[item.sellerId].push(item);
    });
    return groups;
  }, [items]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const addressValue = watch('address');

  useEffect(() => {
    if (items.length === 0 && step !== 'success') {
      navigate('/cart');
    }
  }, [items.length, navigate, step]);

  const onSubmit = async (_data: CheckoutFormData) => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setStep('payment');
  };

  const handlePayment = async () => {
    if (!user || items.length === 0) return;

    if (hasMultipleSellers) {
      toast.error('Please checkout items from one seller at a time');
      return;
    }

    setIsProcessing(true);

    try {
      const reference = generateReference();

      // Initialize Paystack payment
      await initializePayment(
        user.email,
        orderTotal.total,
        reference,
        {
          orderId: reference,
          userId: user.id,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }
      );

      // Create order after payment initialization
      // In production, the order should be created via Cloud Function webhook
      const address = addressValue || '';

      const orderId = await createOrder(
        {
          buyerId: user.id,
          sellerId: items[0].sellerId,
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
          subtotal: total,
          deliveryFee: orderTotal.deliveryFee,
          status: 'payment_confirmed',
          deliveryAddress: {
            address,
            lat: 0, // Would be from geocoding
            lng: 0,
            landmark: '',
          },
          campus: user.campus || '',
        },
        reference
      );

      clearCart();
      setStep('success');
      toast.success('Payment successful!');

      // Redirect to order detail after a delay
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 2000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (err.message === 'Payment cancelled') {
        toast.error('Payment was cancelled');
        setStep('details');
      } else {
        toast.error('Payment failed. Please try again.');
        console.error('Payment error:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your order has been confirmed and the seller has been notified.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-6">
          <a href="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Back to cart
          </a>
        </div>
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            {[
              { key: 'details', label: 'Details', num: 1 },
              { key: 'payment', label: 'Payment', num: 2 },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-3">
                {i > 0 && (
                  <div className={`w-10 h-0.5 transition-colors duration-300 ${
                    (step === 'payment' && i === 1) ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === s.key
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : (step === 'payment' && s.key === 'details')
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {(step === 'payment' && s.key === 'details') ? <CheckCircle className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${
                    step === s.key ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasMultipleSellers && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  Items from {sellerIds.length} different sellers
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                  You can only checkout items from one seller at a time. Please remove items or checkout separately.
                </p>
                <div className="space-y-2">
                  {Object.entries(itemsBySeller).map(([sellerId, sellerItems]) => (
                    <div key={sellerId} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-100 dark:border-amber-800">
                      <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Seller #{sellerId.slice(0, 6)}</div>
                      <div className="space-y-1">
                        {sellerItems.map(item => (
                          <div key={item.productId} className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300 truncate">{item.title} × {item.quantity}</span>
                            <span className="text-gray-900 dark:text-white font-medium ml-2">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'details' && (
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Delivery Address */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="label">
                        Address
                      </label>
                      <input
                        {...register('address')}
                        type="text"
                        className="input-field"
                        placeholder="Enter your delivery address"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="landmark" className="label">
                        Landmark (Optional)
                      </label>
                      <input
                        {...register('landmark')}
                        type="text"
                        className="input-field"
                        placeholder="Nearby landmark"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="label">
                        Phone Number
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="input-field"
                        placeholder="08012345678"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary py-3 mt-6">
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 'payment' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>

                <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary-800 dark:text-primary-300">
                        Secure Payment via Paystack
                      </p>
                      <p className="text-sm text-primary-600 dark:text-primary-400">
                        Your payment is encrypted and secure. We never store your
                        card details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      defaultChecked
                      className="w-4 h-4 text-primary-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Pay with Card / Bank / USSD
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Powered by Paystack
                      </p>
                    </div>
                    <img
                      src="https://paystack.com/images/paystack-logo"
                      alt="Paystack"
                      className="h-6"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="flex-1 btn-secondary py-3"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="flex-1 btn-primary py-3"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                    ) : (
                      `Pay ${formatPrice(orderTotal.total)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(orderTotal.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                  <span className="font-medium">
                    {formatPrice(orderTotal.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                  <span className="font-medium">
                    {formatPrice(orderTotal.platformFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {formatPrice(orderTotal.total)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                By placing this order, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
