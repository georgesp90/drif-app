import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

import { Text, View } from '@/components/Themed';
import { db } from '@/firebaseConfig';
import { useDeviceId } from '@/context/DeviceIdContext';

export default function MyDrifsScreen() {
  const { deviceId, loading: deviceLoading } = useDeviceId();
  const [drifs, setDrifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDrifs = async () => {
    try {
      const q = query(
        collection(db, 'drifs'),
        orderBy('sentAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const allDrifs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      const myDrifs = allDrifs.filter(d => d.deviceId === deviceId);
      setDrifs(myDrifs);
    } catch (err) {
      console.error('❌ Failed to load Drifs:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDrifs();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!deviceLoading && deviceId) {
      fetchDrifs().finally(() => setLoading(false));
    }
  }, [deviceId, deviceLoading]);

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
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.drifItem}>
            <Text>{item.message}</Text>
            <Text style={styles.date}>
              {item.sentAt?.toDate?.().toLocaleString?.() ?? 'unknown'}
            </Text>
          </View>
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
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
  },
});
