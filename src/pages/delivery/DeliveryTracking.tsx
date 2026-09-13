import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  MessageCircle,
  Loader2,
  CheckCircle,
  Package,
  Navigation,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { getDelivery } from '@/services/deliveryService';
import { Delivery } from '@/types';
import DeliveryTrackingMap from '@/components/delivery/DeliveryTrackingMap';
import { formatPrice } from '@/utils/format';

export default function DeliveryTracking() {
  const { id } = useParams<{ id: string }>();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDelivery() {
      if (!id) return;

      try {
        const deliveryData = await getDelivery(id);
        setDelivery(deliveryData);
      } catch (error) {
        console.error('Error loading delivery:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDelivery();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">Delivery not found</p>
        <Link to="/orders" className="mt-4 text-primary-600 dark:text-primary-400 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const statusSteps = [
    { status: 'accepted', label: 'Runner Assigned', icon: CheckCircle },
    { status: 'en_route_to_pickup', label: 'Heading to Pickup', icon: Navigation },
    { status: 'pickup_confirmed', label: 'Item Picked Up', icon: Package },
    { status: 'en_route_to_delivery', label: 'On the Way', icon: Navigation },
    { status: 'delivery_confirmed', label: 'Delivered', icon: MapPin },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === delivery.status
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/orders/${delivery.orderId}`}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">
                Delivery Tracking
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                #{delivery.id.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <DeliveryTrackingMap
          delivery={delivery}
          height="300px"
          showRunnerLocation={
            delivery.status !== 'completed' &&
            delivery.status !== 'cancelled'
          }
        />
      </div>

      {/* Status Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = currentStepIndex >= index;
              const isCurrent = currentStepIndex === index;

              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-primary-500 text-white animate-pulse'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${
                      isCurrent ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`h-1 w-full mt-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pickup Location</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {delivery.pickupLocation.address}
              </p>
            </div>
          </div>

          {/* Delivery */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drop-off Location</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {delivery.deliveryLocation.address}
              </p>
            </div>
          </div>

          {/* Fee */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatPrice(delivery.fee)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery PIN */}
      {(delivery.status === 'en_route_to_delivery' || delivery.status === 'arrived_at_delivery') && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Your Delivery PIN
                </p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 tracking-wider mt-1">
                  {delivery.deliveryPin}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Share this PIN with the runner to confirm delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Runner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-8">
        <div className="flex gap-3">
          <button className="flex-1 btn-secondary py-3">
            <Phone className="w-4 h-4 mr-2" />
            Call Runner
          </button>
          <button className="flex-1 btn-secondary py-3">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
