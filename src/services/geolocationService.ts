/*
 File: src/services/geolocationService.ts
 Purpose: Client-side API service helpers.
 Main exports: calculateDistance
 */

/**
 * Geolocation service for address-to-coordinates conversion
 * Currently uses mock data for Sri Lankan locations
 * Can be extended to use real geocoding APIs (Google Maps, OpenStreetMap, etc.)
 */

interface Coordinates {
  latitude: number
  longitude: number
}

// Mock Sri Lankan location coordinates
const SRI_LANKAN_LOCATIONS: Record<string, Coordinates> = {
  'colombo': { latitude: 6.9271, longitude: 80.7789 },
  'mount lavinia': { latitude: 6.8397, longitude: 80.7667 },
  'dehiwala': { latitude: 6.8653, longitude: 80.7714 },
  'ratmalana': { latitude: 6.8256, longitude: 80.7947 },
  'moratuwa': { latitude: 6.8097, longitude: 80.7899 },
  'kalutara': { latitude: 6.5854, longitude: 80.3506 },
  'negombo': { latitude: 7.2064, longitude: 79.8601 },
  'kandy': { latitude: 7.2906, longitude: 80.6337 },
  'galle': { latitude: 6.0535, longitude: 80.2147 },
  'matara': { latitude: 5.7489, longitude: 80.5380 },
}

/**
 * Get coordinates from an address string
 * Uses mock data for common Sri Lankan locations
 * For production, integrate with Google Maps, OpenStreetMap, or similar
 */
export async function getCoordinatesFromAddress(address: string): Promise<Coordinates | null> {
  if (!address) return null

  // Convert to lowercase for matching
  const normalizedAddress = address.toLowerCase().trim()

  // Try exact match first
  if (SRI_LANKAN_LOCATIONS[normalizedAddress]) {
    return SRI_LANKAN_LOCATIONS[normalizedAddress]
  }

  // Try partial match
  for (const [location, coords] of Object.entries(SRI_LANKAN_LOCATIONS)) {
    if (normalizedAddress.includes(location)) {
      return coords
    }
  }

  // Default to Colombo if no match found
  // In production, use a real geocoding API instead
  console.warn(`Address "${address}" not found in location database. Using Colombo as default.`)
  return SRI_LANKAN_LOCATIONS['colombo']
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}