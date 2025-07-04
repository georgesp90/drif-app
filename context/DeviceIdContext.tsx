import React, { createContext, useContext, useEffect, useState } from "react";
import { getOrCreateDeviceId } from "../utils/deviceId";
import { View, Text, ActivityIndicator } from "react-native";

type DeviceIdContextType = {
  deviceId: string | null;
  loading: boolean;
};

const DeviceIdContext = createContext<DeviceIdContextType>({
  deviceId: null,
  loading: true,
});

export const DeviceIdProvider = ({ children }: { children: React.ReactNode }) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const id = await getOrCreateDeviceId();
        setDeviceId(id);
      } catch (err) {
        console.error("Error getting device ID", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  console.log("✅ DeviceIdProvider rendered");

  if (loading) {
    // ✅ THIS is what prevents the error — clean loading UI
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Preparing your Drif...</Text>
      </View>
    );
  }

  return (
    <DeviceIdContext.Provider value={{ deviceId, loading: false }}>
      {children}
    </DeviceIdContext.Provider>
  );
};

export const useDeviceId = () => useContext(DeviceIdContext);
