import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getCurrentLocation } from './location'; // or wherever you place it

export const sendDrif = async (deviceId: string, message: string) => {
  const location = await getCurrentLocation();
  try {
    await addDoc(collection(db, "drifs"), {
      deviceId,
      message,
      sentAt: Timestamp.now(),
      location,
    });
    console.log("✅ Drif sent!");
  } catch (error) {
    console.error("❌ Error sending Drif:", error);
  }
};
