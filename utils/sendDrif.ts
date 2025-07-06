import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getCurrentLocation } from './location'; 

export const sendDrif = async (deviceId: string, message: string) => {
  const location = await getCurrentLocation();
  try {
    await addDoc(collection(db, "drifs"), {
      deviceId,
      message,
      sentAt: Timestamp.now(),
      location: location || null, // allow it to be null
    });
    console.log("✅ Drif sent!");
  } catch (error) {
    console.error("❌ Error sending Drif:", error);
  }
};
