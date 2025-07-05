import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { db } from '@/firebaseConfig';
import { useDeviceId } from '@/context/DeviceIdContext';
import { useLocation } from '@/context/LocationContext';
import { router } from 'expo-router';


export default function MyDrifsScreen() {
  const { deviceId, loading: deviceLoading } = useDeviceId();
  const [drifs, setDrifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { locationName, loading: locationLoading } = useLocation();

  const fetchDrifsWithReplyCount = useCallback(async () => {
    if (!deviceId) return;

    try {
      const q = query(collection(db, 'drifs'), orderBy('sentAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const myDrifs = await Promise.all(
        querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(d => d.deviceId === deviceId)
          .map(async drif => {
            const repliesRef = collection(db, 'drifs', drif.id, 'replies');
            const replySnap = await getDocs(repliesRef);
            return { ...drif, replyCount: replySnap.size };
          })
      );

      setDrifs(myDrifs);
    } catch (err) {
      console.error('❌ Failed to load Drifs:', err);
    }
  }, [deviceId]);

  useEffect(() => {
    if (!deviceLoading && deviceId) {
      fetchDrifsWithReplyCount().finally(() => setLoading(false));
    }
  }, [deviceId, deviceLoading, fetchDrifsWithReplyCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDrifsWithReplyCount();
    setRefreshing(false);
  };

  if (deviceLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading your Drifs...</Text>
      </View>
    );
  }

  if (drifs.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No Drifs found yet 🌫️</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={drifs}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/drif-detail',
              params: {
                drifId: item.id,
                message: item.message ?? item.text,
                timestamp:
                  item.sentAt?.toDate?.().toISOString?.() ??
                  item.timestamp?.toDate?.().toISOString?.() ??
                  item.repliedAt?.toDate?.().toISOString?.() ??
                  '',
              },
            })
          }
          style={styles.drifItem}
        >

            <Text style={styles.message}>
              {item.message.length > 100 ? `${item.message.slice(0, 100)}…` : item.message}
            </Text>

            <Text style={styles.date}>
              Sent at: {item.sentAt?.toDate?.().toLocaleString?.() ?? 'unknown'}
            </Text>
            <Text>
              {locationLoading
                ? 'Locating...'
                : [locationName?.city, locationName?.region].filter(Boolean).join(', ') || 'Unknown'}
            </Text>
            {item.replyCount > 0 && (
              <Text style={styles.replyCount}>💬 {item.replyCount} repl{item.replyCount === 1 ? 'y' : 'ies'}</Text>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drifItem: {
    marginBottom: 24,
    padding: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  replyCount: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
});
