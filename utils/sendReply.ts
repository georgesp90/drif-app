import { db } from '@/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getCurrentLocation } from './location'; // This should return human-readable { city, region, country }

export const sendReply = async (drifId: string, text: string, deviceId?: string) => {
  try {
    const repliesRef = collection(db, 'drifs', drifId, 'replies');

    const location = await getCurrentLocation(); // Safely handles geolocation
    await addDoc(repliesRef, {
      text,                     // 🟢 Reply text
      repliedAt: serverTimestamp(), // 🕒 Server-side timestamp
      location: location ?? null,   // 🗺️ Optional { city, region, country }
      deviceId: deviceId ?? null,   // 🆔 Optional deviceId
    });
  } catch (error) {
    console.error('❌ Failed to send reply:', error);
    throw error;
  }
};
