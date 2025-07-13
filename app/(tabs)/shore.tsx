import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { db } from '@/firebaseConfig';
import { useDeviceId } from '@/context/DeviceIdContext';
import { sendReply } from '@/utils/sendReply';
import { getHumanReadableLocation } from '@/utils/getHumanReadableLocation';

export default function ShoreScreen() {
  const { deviceId, loading: deviceLoading } = useDeviceId();
  const [drifs, setDrifs] = useState<any[]>([]);
  const [drifLocations, setDrifLocations] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedMap, setExpandedMap] = useState<{ [key: string]: boolean }>({});
  const [showSeeMoreMap, setShowSeeMoreMap] = useState<{ [key: string]: boolean }>({});

  const fetchDrifs = async () => {
    if (!deviceId) return;
    try {
      const q = query(collection(db, 'drifs'), where('deviceId', '!=', deviceId));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const shuffled = items.sort(() => 0.5 - Math.random());
      setDrifs(shuffled.slice(0, 2));

      // fetch location names for each drif
      const locs: { [key: string]: string } = {};
      await Promise.all(
        shuffled.map(async (item) => {
          if (item.location?.latitude && item.location?.longitude) {
            try {
              const location = await getHumanReadableLocation({
                latitude: item.location.latitude,
                longitude: item.location.longitude,
              });
              locs[item.id] = [location.city, location.region].filter(Boolean).join(', ') || 'Unknown';
            } catch {
              locs[item.id] = 'Unknown';
            }
          } else {
            locs[item.id] = 'Unknown';
          }
        })
      );
      setDrifLocations(locs);
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
  
    if (!deviceId) {
      console.warn('⚠️ No deviceId available. Reply will not be associated.');
    }
  
    try {
      await sendReply(drifId, replyText.trim(), deviceId); // ✅ Now passing deviceId
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
        renderItem={({ item }) => {
          const isExpanded = expandedMap[item.id] || false;
          const showSeeMore = showSeeMoreMap[item.id] || false;

          return (
            <View style={styles.drifItem}>
              <TouchableOpacity
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
              >
                <Text
                  numberOfLines={isExpanded ? undefined : 3}
                  ellipsizeMode="tail"
                  onTextLayout={(e) => {
                    if (e.nativeEvent.lines.length > 3 && !showSeeMoreMap[item.id]) {
                      setShowSeeMoreMap((prev) => ({ ...prev, [item.id]: true }));
                    }
                  }}
                >
                  {item.message}
                </Text>
              </TouchableOpacity>

              {showSeeMore && (
                <Text
                  style={styles.seeMore}
                  onPress={() =>
                    setExpandedMap((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                >
                  {isExpanded ? 'See Less' : 'See More'}
                </Text>
              )}
              <Text style={styles.date}>
                {item.sentAt?.toDate?.().toLocaleString?.() ?? 'unknown'}
              </Text>
              <Text style={styles.meta}>
                {drifLocations[item.id] || 'Locating...'}
              </Text>

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
          );
        }}
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
  seeMore: {
    color: '#007AFF',
    marginTop: 4,
    fontSize: 13,
  },
  meta: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
