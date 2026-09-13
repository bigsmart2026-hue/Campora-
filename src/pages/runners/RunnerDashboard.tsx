import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Loader2,
  Power,
  PowerOff,
  Navigation,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getRunnerProfile,
  updateRunnerAvailability,
  getRunnerDeliveries,
} from '@/services/deliveryService';
import { Delivery } from '@/types';
import { formatPrice } from '@/utils/format';

export default function RunnerDashboard() {
  const { user } = useAuth();
  const [runnerProfile, setRunnerProfile] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const [profile, runnerDeliveries] = await Promise.all([
          getRunnerProfile(user.id),
          getRunnerDeliveries(user.id),
        ]);

        setRunnerProfile(profile);
        setDeliveries(runnerDeliveries);
      } catch (error) {
        console.error('Error loading runner data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleToggleAvailability = async () => {
    if (!runnerProfile) return;

    setToggling(true);
    try {
      const newStatus = !runnerProfile.isAvailable;
      await updateRunnerAvailability(user!.id, newStatus);
      setRunnerProfile({ ...runnerProfile, isAvailable: newStatus });
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (!runnerProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <Truck className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You're not registered as a runner</p>
        <Link to="/runner/register" className="btn-primary">
          Register as Runner
        </Link>
      </div>
    );
  }

  const activeDelivery = deliveries.find(
    (d) =>
      !['completed', 'cancelled', 'failed'].includes(d.status)
  );

  const stats = {
    completed: deliveries.filter((d) => d.status === 'completed').length,
    earnings: runnerProfile.totalEarnings || 0,
    rating: runnerProfile.rating || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Runner Dashboard</h1>
          <button
            onClick={handleToggleAvailability}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              runnerProfile.isAvailable
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {toggling ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : runnerProfile.isAvailable ? (
              <Power className="h-5 w-5" />
            ) : (
              <PowerOff className="h-5 w-5" />
            )}
            {runnerProfile.isAvailable ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Earnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(stats.earnings)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Delivery */}
        {activeDelivery && (
          <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-200 mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Active Delivery
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Delivery #{activeDelivery.id.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {activeDelivery.status.replace(/_/g, ' ')}
                  </p>
                </div>
                <span className="badge badge-info">
                  {activeDelivery.deliveryPin ? 'PIN Ready' : 'Pending'}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Pickup</p>
                    <p className="text-gray-900 dark:text-white">
                      {activeDelivery.pickupLocation.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Drop-off</p>
                    <p className="text-gray-900 dark:text-white">
                      {activeDelivery.deliveryLocation.address}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to={`/runner/delivery/${activeDelivery.id}`}
                className="btn-primary w-full mt-4 justify-center"
              >
                View Delivery Details
              </Link>
            </div>
          </div>
        )}

        {/* Recent Deliveries */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Deliveries
            </h2>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {deliveries.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No deliveries yet</p>
              </div>
            ) : (
              deliveries.slice(0, 10).map((delivery) => (
                <div key={delivery.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          delivery.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : delivery.status === 'cancelled'
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-primary-100 dark:bg-primary-900/30'
                        }`}
                      >
                        {delivery.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : delivery.status === 'cancelled' ? (
                          <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Delivery #{delivery.id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(
                            delivery.createdAt as unknown as string
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(delivery.fee)}
                      </p>
                      <p
                        className={`text-sm capitalize ${
                          delivery.status === 'completed'
                            ? 'text-green-600 dark:text-green-400'
                            : delivery.status === 'cancelled'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-primary-600 dark:text-primary-400'
                        }`}
                      >
                        {delivery.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
