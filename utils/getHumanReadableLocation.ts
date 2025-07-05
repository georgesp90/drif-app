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
  
      return {
        
            city: 'Brooklyn',
            region: 'New York',
            country: 'United States'
          
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {};
    }
  };
