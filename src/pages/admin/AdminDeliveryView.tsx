import { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  Loader2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  getPendingDeliveries,
} from '@/services/deliveryService';
import { Delivery } from '@/types';
import DeliveryTrackingMap from '@/components/delivery/DeliveryTrackingMap';

export default function AdminDeliveryView() {
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, []);

  async function loadDeliveries() {
    try {
      const pending = await getPendingDeliveries();
      setActiveDeliveries(pending);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDeliveries();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Live Delivery View
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor active deliveries across campus
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Deliveries List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Active Deliveries ({activeDeliveries.length})
            </h2>

            {activeDeliveries.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <Truck className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No active deliveries</p>
              </div>
            ) : (
              activeDeliveries.map((delivery) => (
                <button
                  key={delivery.id}
                  onClick={() => setSelectedDelivery(delivery)}
                  className={`w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-all ${
                    selectedDelivery?.id === delivery.id
                      ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      #{delivery.id.slice(-6)}
                    </span>
                    <span
                      className={`badge ${
                        delivery.status.includes('transit')
                          ? 'badge-info'
                          : 'badge-warning'
                      }`}
                    >
                      {delivery.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {delivery.deliveryLocation.address.slice(0, 30)}...
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(
                        delivery.createdAt as unknown as string
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Map View */}
          <div className="lg:col-span-2">
            {selectedDelivery ? (
              <div className="space-y-4">
                <DeliveryTrackingMap
                  delivery={selectedDelivery}
                  height="500px"
                  showRunnerLocation={true}
                />

                {/* Delivery Details */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Delivery Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Order ID</p>
                      <p className="font-medium">#{selectedDelivery.orderId.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Runner ID</p>
                      <p className="font-medium">
                        {selectedDelivery.runnerId.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Pickup</p>
                      <p className="font-medium">
                        {selectedDelivery.pickupLocation.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Drop-off</p>
                      <p className="font-medium">
                        {selectedDelivery.deliveryLocation.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a delivery to view on map
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
