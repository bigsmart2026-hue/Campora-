import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getOrdersByBuyer } from '@/services/orderService';
import { Order } from '@/types';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
  isOrderActive,
} from '@/utils/orderStateMachine';
import { formatPrice } from '@/utils/format';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;

      try {
        const userOrders = await getOrdersByBuyer(user.id);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user]);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return isOrderActive(order.status);
    }
    if (filter === 'completed') {
      return order.status === 'completed';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Order #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.items.length} item(s) •{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(order.total)}
                  </p>
                  <span
                    className={`text-sm font-medium ${getOrderStatusColor(
                      order.status
                    )}`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-4" />
              </div>
            </Link>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No orders found</p>
              <Link to="/products" className="btn-primary mt-4 inline-flex">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
