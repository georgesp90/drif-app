import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export const getOrCreateDeviceId = async (): Promise<string> => {
  const key = 'drif_device_id';

  try {
    console.log("🔐 getOrCreateDeviceId called");

    const existingId = await SecureStore.getItemAsync(key);
    if (existingId) {
      console.log("📦 Found existing ID:", existingId);
      return existingId;
    }

    const newId = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString() + Math.random()
    );

    console.log("🆕 Created new ID:", newId);
    await SecureStore.setItemAsync(key, newId);
    return newId;
  } catch (err) {
    console.error("❌ Error in getOrCreateDeviceId", err);
    // Return a dummy string to prevent crashing the app
    return "fallback-device-id";
  }
};
