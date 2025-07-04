import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/Themed';
import { db } from '@/firebaseConfig';

export default function DrifDetailScreen() {
  const { drifId, message } = useLocalSearchParams<{ drifId: string; message: string }>();
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const repliesRef = collection(db, 'drifs', drifId, 'replies');
        const snapshot = await getDocs(repliesRef);
        const replyData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReplies(replyData);
      } catch (err) {
        console.error('❌ Error loading replies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();
  }, [drifId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📩 Your Drif</Text>
      <Text style={styles.drifText}>{message}</Text>

      <Text style={styles.sectionTitle}>💬 Replies</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : replies.length === 0 ? (
        <Text style={styles.empty}>No replies yet</Text>
      ) : (
        <FlatList
          data={replies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.replyItem}>
              <Text>{item.text ?? item.message ?? 'No content'}</Text>
              <Text style={styles.date}>
              {item.timestamp?.toDate?.().toLocaleString?.()??item.sentAt?.toDate?.().toLocaleString?.() ?? item.repliedAt?.toDate?.().toLocaleString?.()??'unknown'}              
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  drifText: {
    fontSize: 16,
    backgroundColor: '#e0f7fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  replyItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  empty: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
