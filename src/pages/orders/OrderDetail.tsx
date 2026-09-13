import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  XCircle,
  ChevronLeft,
  MapPin,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getOrder, updateOrderStatus } from '@/services/orderService';
import { Order } from '@/types';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
  isOrderCancellable,
} from '@/utils/orderStateMachine';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;

      try {
        const orderData = await getOrder(id);
        setOrder(orderData);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!order || !user) return;

    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await updateOrderStatus(order.id, 'cancelled', user.id, 'Cancelled by user');
      setOrder({ ...order, status: 'cancelled' });
      toast.success('Order cancelled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">Order not found</p>
        <Link to="/orders" className="mt-4 text-primary-600 dark:text-primary-400 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to orders
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{order.id.slice(-8)}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`badge ${getOrderStatusColor(order.status)
                .replace('text-', 'bg-')
                .replace('500', '100')}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            {order.status === 'payment_pending' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Payment Pending
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Please complete your payment to proceed
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.status === 'completed' && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Order Completed
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      This order has been successfully completed
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
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
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Timeline
              </h2>
              <div className="space-y-4">
                {order.timeline
                  .slice()
                  .reverse()
                  .map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? 'bg-primary-600 dark:bg-primary-400'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                        {index < order.timeline.length - 1 && (
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-200 dark:bg-gray-600" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getOrderStatusLabel(event.status)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(event.timestamp as unknown as string).toLocaleString()}
                        </p>
                        {event.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium dark:text-white">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                  <span className="font-medium dark:text-white">
                    {formatPrice(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                  <span className="font-medium dark:text-white">
                    {formatPrice(order.platformFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {order.paymentRef && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Payment Reference: {order.paymentRef}
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {order.deliveryAddress.address}
              </p>
              {order.deliveryAddress.landmark && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Landmark: {order.deliveryAddress.landmark}
                </p>
              )}
            </div>

            {/* Contact Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                {isBuyer && (
                  <>
                    <Link
                      to={`/seller/${order.sellerId}`}
                      className="btn-secondary w-full justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Seller
                    </Link>
                    {isOrderCancellable(order.status) && (
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="btn-danger w-full"
                      >
                        {cancelling ? (
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Cancel Order
                      </button>
                    )}
                  </>
                )}

                {isSeller && (
                  <Link
                    to={`/orders/${order.id}/manage`}
                    className="btn-primary w-full justify-center"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Manage Order
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
