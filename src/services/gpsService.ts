import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Location {
  lat: number;
  lng: number;
  timestamp: Date;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface TrackingUpdate {
  deliveryId: string;
  runnerId: string;
  location: Location;
  status: string;
}

export interface GeofenceZone {
  id: string;
  center: { lat: number; lng: number };
  radius: number; // meters
  type: 'pickup' | 'delivery' | 'campus';
  name: string;
}

export interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  polyline?: string;
}

// Get user's current location
export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date(),
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  });
}

// Watch user's location continuously
export function watchLocation(
  callback: (location: Location) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): () => void {
  if (!navigator.geolocation) {
    errorCallback?.({
      code: 0,
      message: 'Geolocation not supported',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    });
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: new Date(),
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined,
      });
    },
    (error) => {
      errorCallback?.(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}

// Update runner location in Firestore
export async function updateRunnerLocation(
  runnerId: string,
  location: Location
): Promise<void> {
  const runnersQuery = query(
    collection(db, 'runners'),
    where('userId', '==', runnerId),
    limit(1)
  );

  const snapshot = await getDocs(runnersQuery);
  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, {
      currentLocation: {
        lat: location.lat,
        lng: location.lng,
        timestamp: location.timestamp,
      },
      updatedAt: serverTimestamp(),
    });
  }
}

// Update delivery location in Firestore
export async function updateDeliveryLocation(
  deliveryId: string,
  location: Location
): Promise<void> {
  const deliveryRef = doc(db, 'deliveries', deliveryId);
  const deliveryDoc = await getDoc(deliveryRef);

  if (deliveryDoc.exists()) {
    const currentTimeline = deliveryDoc.data().timeline || [];
    
    await updateDoc(deliveryRef, {
      currentLocation: {
        lat: location.lat,
        lng: location.lng,
        timestamp: location.timestamp,
      },
      timeline: [
        ...currentTimeline,
        {
          status: 'location_update',
          timestamp: new Date(),
          location: { lat: location.lat, lng: location.lng },
        },
      ],
      updatedAt: serverTimestamp(),
    });
  }
}

// Subscribe to delivery location updates
export function subscribeToDeliveryLocation(
  deliveryId: string,
  callback: (location: Location | null) => void
): () => void {
  const deliveryRef = doc(db, 'deliveries', deliveryId);

  const unsubscribe = onSnapshot(deliveryRef, (doc) => {
    if (doc.exists() && doc.data().currentLocation) {
      const data = doc.data();
      callback({
        lat: data.currentLocation.lat,
        lng: data.currentLocation.lng,
        timestamp: data.currentLocation.timestamp?.toDate() || new Date(),
      });
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Calculate bearing between two points
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let θ = Math.atan2(y, x);
  θ = ((θ * 180) / Math.PI + 360) % 360; // Convert to degrees

  return θ;
}

// Calculate ETA based on distance and average speed
export function calculateETA(
  distance: number, // meters
  averageSpeed: number = 1.4 // m/s (walking speed ~5 km/h)
): number {
  return Math.ceil(distance / averageSpeed / 60); // Return minutes
}

// Check if location is within geofence
export function isInsideGeofence(
  location: Location,
  zone: GeofenceZone
): boolean {
  const distance = calculateDistance(
    location.lat,
    location.lng,
    zone.center.lat,
    zone.center.lng
  );

  return distance <= zone.radius;
}

// Get nearest geofence zone
export function getNearestGeofence(
  location: Location,
  zones: GeofenceZone[]
): { zone: GeofenceZone; distance: number } | null {
  if (zones.length === 0) return null;

  let nearest = zones[0];
  let minDistance = calculateDistance(
    location.lat,
    location.lng,
    zones[0].center.lat,
    zones[0].center.lng
  );

  for (let i = 1; i < zones.length; i++) {
    const distance = calculateDistance(
      location.lat,
      location.lng,
      zones[i].center.lat,
      zones[i].center.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = zones[i];
    }
  }

  return { zone: nearest, distance: minDistance };
}
