import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  ChevronLeft,
  Loader2,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getOrder, updateOrderStatus } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
} from '@/utils/orderStateMachine';
import { formatPrice } from '@/utils/format';
import toast from 'react-hot-toast';

export default function SellerOrderManagement() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || !user) return;

    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus, user.id);
      setOrder({ ...order, status: newStatus });
      toast.success(`Order status updated to ${getOrderStatusLabel(newStatus)}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order');
    } finally {
      setUpdating(false);
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
        <Link to="/sell/dashboard" className="mt-4 text-primary-600 dark:text-primary-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const getNextActions = (): { status: OrderStatus; label: string; color: string }[] => {
    switch (order.status) {
      case 'payment_confirmed':
        return [
          { status: 'processing', label: 'Start Processing', color: 'btn-primary' },
          { status: 'cancelled', label: 'Cancel Order', color: 'btn-danger' },
        ];
      case 'processing':
        return [
          { status: 'assigned_to_runner', label: 'Assign Runner', color: 'btn-primary' },
          { status: 'cancelled', label: 'Cancel Order', color: 'btn-danger' },
        ];
      default:
        return [];
    }
  };

  const nextActions = getNextActions();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/sell/dashboard"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Order #{order.id.slice(-8)}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`badge ${getOrderStatusColor(order.status)
              .replace('text-', 'bg-')
              .replace('500', '100')}`}
          >
            {getOrderStatusLabel(order.status)}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                            index === 0 ? 'bg-primary-600 dark:bg-primary-400' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getOrderStatusLabel(event.status)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(
                            event.timestamp as unknown as string
                          ).toLocaleString()}
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
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                  <span className="font-medium dark:text-white">
                    {formatPrice(order.platformFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Your Earning
                  </span>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {formatPrice(order.subtotal - order.platformFee)}
                  </span>
                </div>
              </div>
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

            {/* Actions */}
            {nextActions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Actions
                </h2>
                <div className="space-y-3">
                  {nextActions.map((action) => (
                    <button
                      key={action.status}
                      onClick={() => handleStatusUpdate(action.status)}
                      disabled={updating}
                      className={`w-full ${action.color}`}
                    >
                      {updating ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      ) : null}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
