import { db } from '@/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const sendReply = async (drifId: string, text: string) => {
  const repliesRef = collection(db, 'drifs', drifId, 'replies');

  await addDoc(repliesRef, {
    text, // ✅ must be 'text'
    repliedAt: serverTimestamp(),
  });
};

