import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Clock, Loader2 } from 'lucide-react';
import { Delivery } from '@/types';
import {
  subscribeToDeliveryLocation,
  calculateDistance,
  calculateETA,
  Location,
} from '@/services/gpsService';

interface DeliveryTrackingMapProps {
  delivery: Delivery;
  showRunnerLocation?: boolean;
  height?: string;
}

export default function DeliveryTrackingMap({
  delivery,
  showRunnerLocation = true,
  height = '400px',
}: DeliveryTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [runnerLocation, setRunnerLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (!showRunnerLocation) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToDeliveryLocation(
      delivery.id,
      (location) => {
        setRunnerLocation(location);
        setLoading(false);

        if (location) {
          // Calculate distance to delivery location
          const dist = calculateDistance(
            location.lat,
            location.lng,
            delivery.deliveryLocation.lat,
            delivery.deliveryLocation.lng
          );
          setDistance(dist);

          // Calculate ETA
          const estimatedTime = calculateETA(dist);
          setEta(estimatedTime);
        }
      }
    );

    return () => unsubscribe();
  }, [delivery.id, delivery.deliveryLocation, showRunnerLocation]);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700" style={{ height }}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Google Maps iframe as placeholder */}
      <iframe
        title="Delivery Map"
        width="100%"
        height="100%"
        frameBorder="0"
        src={`https://www.google.com/maps/embed/v1/directions?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&origin=${delivery.pickupLocation.lat},${delivery.pickupLocation.lng}&destination=${delivery.deliveryLocation.lat},${delivery.deliveryLocation.lng}&mode=walking`}
        allowFullScreen
        className="absolute inset-0"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin h-5 w-5 text-primary-600" />
            <span className="text-gray-600 dark:text-gray-400">Loading map...</span>
          </div>
        </div>
      )}

      {/* Runner location marker */}
      {runnerLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: '50%',
            top: '50%',
          }}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary-600" />
          </div>
        </div>
      )}

      {/* Pickup marker */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Pickup</span>
        </div>
      </div>

      {/* Delivery marker */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Drop-off</span>
        </div>
      </div>

      {/* Info panel */}
      {runnerLocation && distance !== null && eta !== null && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-[140px]">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {eta} min
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistance(distance)} away
            </div>
          </div>
        </div>
      )}

      {/* No location available */}
      {!runnerLocation && !loading && showRunnerLocation && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-center">
            <MapPin className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Runner location not available
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
