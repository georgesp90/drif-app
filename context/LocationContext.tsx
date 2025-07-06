import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { getHumanReadableLocation } from '@/utils/getHumanReadableLocation';

type HumanReadableLocation = {
  city?: string;
  region?: string;
  country?: string;
};

type LocationContextType = {
  locationName: HumanReadableLocation | null;
  loading: boolean;
};

const LocationContext = createContext<LocationContextType>({
  locationName: null,
  loading: true,
});

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [locationName, setLocationName] = useState<HumanReadableLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('📍 Location permission denied');
          setLocationName({ city: 'Permission Denied' });
          return;
        }
  
        const loc = await Location.getCurrentPositionAsync({});
        console.log('📍 Coords:', loc.coords);
        const humanReadable = await getHumanReadableLocation(loc.coords);
        setLocationName(humanReadable);
      } catch (error) {
        console.error('❌ Failed to fetch location:', error);
        setLocationName({ city: 'Unknown' });
      } finally {
        setLoading(false);
      }
    };
  
    fetchLocation();
  }, []);
  

  return (
    <LocationContext.Provider value={{ locationName, loading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
