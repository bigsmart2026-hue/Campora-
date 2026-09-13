import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Loader2, CheckCircle, AlertCircle, Footprints, Bike, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { registerAsRunner } from '@/services/deliveryService';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = [
  {
    value: 'walking',
    label: 'Walking',
    description: 'Deliver on foot',
    icon: Footprints,
  },
  {
    value: 'bicycle',
    label: 'Bicycle',
    description: 'Deliver by bicycle',
    icon: Bike,
  },
  {
    value: 'motorcycle',
    label: 'Motorcycle',
    description: 'Deliver by motorcycle',
    icon: Truck,
  },
  {
    value: 'car',
    label: 'Car',
    description: 'Deliver by car',
    icon: Car,
  },
];

export default function RunnerRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicleType, setVehicleType] = useState<string>('walking');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    if (!user.isCampusVerified) {
      toast.error('Please verify your campus first');
      return;
    }

    setIsRegistering(true);
    try {
      await registerAsRunner(user.id, vehicleType as any);
      toast.success('Registered as runner!');
      navigate('/runner/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Become a Runner
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Earn money by delivering orders on campus
          </p>
        </div>

        {/* Requirements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-400">
                Must be a verified campus student
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-400">
                Valid phone number for contact
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-400">
                Reliable means of transportation
              </span>
            </li>
          </ul>
        </div>

        {/* Vehicle Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Select Vehicle Type
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {VEHICLE_TYPES.map((vehicle) => (
              <button
                key={vehicle.value}
                onClick={() => setVehicleType(vehicle.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  vehicleType === vehicle.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <vehicle.icon className="w-6 h-6" />
                <p className="font-medium text-gray-900 dark:text-white mt-2">{vehicle.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
            <div>
              <p className="font-medium text-primary-800 dark:text-primary-200">How it works</p>
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                When a buyer selects delivery, you'll receive a notification.
                Accept the delivery, pick up the item, and deliver it to the
                buyer. You'll receive the delivery fee after successful
                delivery.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={isRegistering || !user?.isCampusVerified}
          className="w-full btn-primary py-3"
        >
          {isRegistering ? (
            <Loader2 className="animate-spin h-5 w-5 mx-auto" />
          ) : (
            'Register as Runner'
          )}
        </button>

        {!user?.isCampusVerified && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            You need to verify your campus first.{' '}
            <a href="/verification" className="text-primary-600 dark:text-primary-400 hover:underline">
              Verify now
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
