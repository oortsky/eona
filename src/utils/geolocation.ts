import type { Footprint } from "@/types/capsule";

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Validate if current location is within acceptable range of footprint
 * @param currentFootprint - Current user location
 * @param savedFootprint - Saved capsule location
 * @param maxDistanceMeters - Maximum allowed distance in meters (default: 100)
 * @returns true if location is valid, false otherwise
 */
export function isLocationValid(
  currentFootprint: Footprint,
  savedFootprint: Footprint,
  maxDistanceMeters: number = 100
): boolean {
  const distance = calculateDistance(
    currentFootprint.latitude,
    currentFootprint.longitude,
    savedFootprint.latitude,
    savedFootprint.longitude
  );
  
  const tolerance =
    maxDistanceMeters + currentFootprint.accuracy + savedFootprint.accuracy;

  return distance <= tolerance;
}

/**
 * Get current user location
 * @param options - Geolocation options
 * @returns Promise with Footprint data
 */
export function getCurrentLocation(
  options?: PositionOptions
): Promise<Footprint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
    );
  });
}