import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Loader2,
  CheckCircle,
  Package,
  Shield,
} from 'lucide-react';
import {
  getDelivery,
  updateDeliveryStatus,
  completeDelivery,
} from '@/services/deliveryService';
import { Delivery } from '@/types';
import toast from 'react-hot-toast';

export default function ActiveDelivery() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');

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

  const handleStatusUpdate = async (newStatus: Delivery['status']) => {
    if (!delivery) return;

    setUpdating(true);
    try {
      await updateDeliveryStatus(delivery.id, newStatus);
      setDelivery({ ...delivery, status: newStatus });
      toast.success('Status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!delivery || !pin) return;

    setUpdating(true);
    try {
      await completeDelivery(delivery.id, pin);
      setDelivery({ ...delivery, status: 'delivery_confirmed' });
      setShowPinModal(false);
      toast.success('Delivery completed!');
      navigate('/runner/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid PIN');
    } finally {
      setUpdating(false);
    }
  };

  const getNextActions = (): { status: Delivery['status']; label: string; icon: typeof MapPin }[] => {
    if (!delivery) return [];

    switch (delivery.status) {
      case 'accepted':
        return [{ status: 'en_route_to_pickup', label: 'Heading to Pickup', icon: Navigation }];
      case 'en_route_to_pickup':
        return [{ status: 'arrived_at_pickup', label: 'Arrived at Pickup', icon: MapPin }];
      case 'arrived_at_pickup':
        return [{ status: 'pickup_confirmed', label: 'Confirm Pickup', icon: CheckCircle }];
      case 'pickup_confirmed':
        return [{ status: 'en_route_to_delivery', label: 'Heading to Delivery', icon: Navigation }];
      case 'en_route_to_delivery':
        return [{ status: 'arrived_at_delivery', label: 'Arrived at Delivery', icon: MapPin }];
      case 'arrived_at_delivery':
        return [{ status: 'delivery_confirmed', label: 'Verify PIN & Complete', icon: Shield }];
      default:
        return [];
    }
  };

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
      </div>
    );
  }

  const nextActions = getNextActions();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Delivery #{delivery.id.slice(-6)}
            </h1>
            <span className="badge badge-info capitalize">
              {delivery.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
            {['accepted', 'en_route_to_pickup', 'pickup_confirmed', 'en_route_to_delivery', 'delivery_confirmed'].map(
              (step, index) => {
                const isCompleted =
                  ['accepted', 'en_route_to_pickup', 'pickup_confirmed', 'en_route_to_delivery', 'delivery_confirmed'].indexOf(
                    delivery.status
                  ) >= index;
                const isCurrent = delivery.status === step;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mb-1 ${
                        isCompleted
                          ? 'bg-green-500'
                          : isCurrent
                          ? 'bg-primary-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                    <span
                      className={
                        isCurrent ? 'text-primary-600 dark:text-primary-400 font-medium' : ''
                      }
                    >
                      {step.replace(/_/g, ' ').replace('en route', 'en route')}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Route Details
          </h2>

          <div className="space-y-4">
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
          </div>
        </div>

        {/* Delivery PIN (only show when at pickup confirmed stage) */}
        {delivery.status === 'pickup_confirmed' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Delivery PIN: {delivery.deliveryPin}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Share this PIN with the buyer to verify delivery
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ₦{(delivery.fee / 100).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        {nextActions.length > 0 && (
          <div className="space-y-3">
            {nextActions.map((action) => (
              <button
                key={action.status}
                onClick={() => {
                  if (action.status === 'delivery_confirmed') {
                    setShowPinModal(true);
                  } else {
                    handleStatusUpdate(action.status);
                  }
                }}
                disabled={updating}
                className="w-full btn-primary py-3"
              >
                {updating ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <>
                    <action.icon className="w-5 h-5 mr-2" />
                    {action.label}
                  </>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Contact Buttons */}
        <div className="flex gap-3 mt-6">
          <button className="flex-1 btn-secondary">
            <Phone className="w-4 h-4 mr-2" />
            Call Buyer
          </button>
          <button className="flex-1 btn-secondary">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </button>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Verify Delivery
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              Ask the buyer for their 6-digit PIN
            </p>

            <div className="mb-6">
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPin('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPin}
                disabled={pin.length !== 6 || updating}
                className="flex-1 btn-primary"
              >
                {updating ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  'Verify & Complete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
