import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  View as RNView,
  ImageBackground,
} from 'react-native';
import { View, Text } from '@/components/Themed';
import { db } from '@/firebaseConfig';
import { useLocation } from '@/context/LocationContext';
//import WaveBG from '@/assets/images/drif-detail-wave-bg.png';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DrifDetailScreen() {
  const { drifId, message, timestamp } = useLocalSearchParams<{
    drifId: string;
    message: string;
    timestamp?: string;
  }>();

  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { locationName, loading: locationLoading } = useLocation();
  const [drifExpanded, setDrifExpanded] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  const insets = useSafeAreaInsets();

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
    <ImageBackground source={require('@/assets/images/drif-detail-wave-bg.png')} style={styles.bg} resizeMode="cover">
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>An Unexpected Connection</Text>

          <Text style={styles.messageText} numberOfLines={drifExpanded ? undefined : 6}>
            {message}
          </Text>

          <Text style={styles.seeMore} onPress={() => setDrifExpanded(!drifExpanded)}>
            {drifExpanded ? 'See Less' : 'See More'}
          </Text>

          <View style={styles.metaBlock}>
            <Text style={styles.meta}>
              💬 122   ❤️ 517   🔁
            </Text>
            <Text style={styles.meta}>
              {locationLoading
                ? 'Locating...'
                : [locationName?.city, locationName?.region].filter(Boolean).join(', ') || 'Unknown'}
            </Text>
            {timestamp && (
              <Text style={styles.meta}>{new Date(timestamp).toLocaleString()}</Text>
            )}
          </View>

          <Text style={styles.repliesHeader}>💬 Replies</Text>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : replies.length === 0 ? (
            <Text style={styles.empty}>No replies yet</Text>
          ) : (
            replies.map(reply => {
              const isExpanded = expandedReplies[reply.id] || false;
              return (
                <View key={reply.id} style={styles.replyCard}>
                  <Text numberOfLines={isExpanded ? undefined : 3}>
                    {reply.text ?? reply.message ?? 'No content'}
                  </Text>
                  <Text
                    style={styles.seeMore}
                    onPress={() =>
                      setExpandedReplies(prev => ({
                        ...prev,
                        [reply.id]: !prev[reply.id],
                      }))
                    }
                  >
                    {isExpanded ? 'See Less' : 'See More'}
                  </Text>
                  <Text style={styles.meta}>
                    {reply.timestamp?.toDate?.().toLocaleString?.() ??
                      reply.sentAt?.toDate?.().toLocaleString?.() ??
                      reply.repliedAt?.toDate?.().toLocaleString?.() ??
                      'unknown'}
                  </Text>
                  <Text style={styles.meta}>
                    {locationLoading
                      ? 'Locating...'
                      : [locationName?.city, locationName?.region].filter(Boolean).join(', ') ||
                        'Unknown'}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    flexGrow: 1,
    backgroundColor: 'transparent'
  },
  container: {
    flex: 1,
    backgroundColor:'transparent'
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    color: '#fff',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
    color: '#fff',
  },
  seeMore: {
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 8,
  },
  metaBlock: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor:'transparent'
  },
  meta: {
    fontSize: 12,
    color: '#eee',
    marginTop: 2,
  },
  repliesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  replyCard: {
    backgroundColor: '#0a2940',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  empty: {
    fontStyle: 'italic',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
});
