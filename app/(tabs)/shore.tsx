import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { useNavigation } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { db } from '@/firebaseConfig';
import { useDeviceId } from '@/context/DeviceIdContext';
import { sendReply } from '@/utils/sendReply';

export default function ShoreScreen() {
  const { deviceId, loading: deviceLoading } = useDeviceId();
  const [drifs, setDrifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const navigation = useNavigation();

  const fetchDrifs = async () => {
    if (!deviceId) return;
    try {
      const q = query(collection(db, 'drifs'), where('deviceId', '!=', deviceId));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const shuffled = items.sort(() => 0.5 - Math.random());
      setDrifs(shuffled.slice(0, 2));
    } catch (err) {
      console.error('❌ Failed to load Drifs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!deviceLoading && deviceId) {
      fetchDrifs();
    }
  }, [deviceId, deviceLoading]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDrifs();
  }, [deviceId]);

  const handleReply = async (drifId: string) => {
    if (!replyText.trim()) return;

    try {
      await sendReply(drifId, replyText.trim());
      Alert.alert('✅ Reply Sent');
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error('❌ Error sending reply:', err);
      Alert.alert('❌ Error', 'Failed to send reply.');
    }
  };

  if (deviceLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading Drifs...</Text>
      </View>
    );
  }

  if (drifs.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No Drifs found floating in yet 🌊</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={drifs}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.drifItem}>
            <Text>  
                {item.message.length > 100 ? `${item.message.slice(0, 100)}…` : item.message}
            </Text>
            <Text style={styles.date}>
              {item.sentAt?.toDate?.().toLocaleString?.() ?? 'unknown'}
            </Text>

            <Button
              title="View + Reply"
              onPress={() =>
                navigation.navigate('drif-detail', {
                  drifId: item.id,
                  message: item.message,
                })
              }
            />

            {replyingTo === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Type your reply..."
                  value={replyText}
                  onChangeText={setReplyText}
                />
                <Button
                  title="Send Reply"
                  onPress={() => handleReply(item.id)}
                />
              </>
            ) : (
              <Button
                title="Quick Reply"
                onPress={() => setReplyingTo(item.id)}
              />
            )}
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
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    marginBottom: 4,
  },
});
