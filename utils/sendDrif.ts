import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const sendDrif = async (deviceId: string, message: string) => {
  try {
    await addDoc(collection(db, "drifs"), {
      deviceId,
      message,
      sentAt: Timestamp.now(),
    });
    console.log("✅ Drif sent!");
  } catch (error) {
    console.error("❌ Error sending Drif:", error);
  }
};
