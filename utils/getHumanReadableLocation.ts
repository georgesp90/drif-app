import * as Location from 'expo-location';

type Coords = {
  latitude: number;
  longitude: number;
};

type HumanReadableLocation = {
  city?: string;
  region?: string;
  country?: string;
};

const locationCache = new Map<string, HumanReadableLocation>();

const coordsToKey = (coords: Coords): string =>
  `${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`;

export const getHumanReadableLocation = async (
  coords: Coords
): Promise<HumanReadableLocation> => {
  const cacheKey = coordsToKey(coords);

  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey)!;
  }

  try {
    const [place] = await Location.reverseGeocodeAsync(coords);
    const result = {
      city: place.district ?? place.city ?? undefined,
      region: place.region ?? undefined,
      country: place.country ?? undefined,
    };

    locationCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('❌ Reverse geocoding failed:', error);
    return {};
  }
};