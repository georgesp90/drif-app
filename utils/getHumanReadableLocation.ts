import * as Location from 'expo-location';

export const getHumanReadableLocation = async (coords: {
    latitude: number;
    longitude: number;
  }): Promise<{
    city?: string;
    region?: string;
    country?: string;
  }> => {
    try {
      const [place] = await Location.reverseGeocodeAsync(coords);
      console.log('📍 Raw reverse geocode result:', place);

  
      return {
        
        city: place.district ?? place.city ?? undefined,
        region: place.region ?? undefined,
        country: place.country ?? undefined,
  
          
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {};
    }
  };
