import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/Themed';
import { db } from '@/firebaseConfig';

import { useLocation } from '@/context/LocationContext';


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
  const [showDrifSeeMore, setShowDrifSeeMore] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});




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
      <View style={styles.drifText}>
        <Text numberOfLines={drifExpanded ? undefined : 4} ellipsizeMode="tail">
            {message}
        </Text>

        <Text style={styles.seeMore} onPress={() => setDrifExpanded(!drifExpanded)}>
            {drifExpanded ? 'See Less' : 'See More'}
        </Text>

        {timestamp && (
            <Text style={styles.meta}>
            {new Date(timestamp).toLocaleString()}
            </Text>
        )}
        <Text style={styles.meta}>
            {locationLoading
            ? 'Locating...'
            : [locationName?.city, locationName?.region].filter(Boolean).join(', ') || 'Unknown'}
        </Text>
      </View>



      <Text style={styles.sectionTitle}>💬 Replies</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : replies.length === 0 ? (
        <Text style={styles.empty}>No replies yet</Text>
      ) : (
<FlatList
  data={replies}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => {
    const isExpanded = expandedReplies[item.id] || false;

    return (
      <View style={styles.replyItem}>
        <Text numberOfLines={isExpanded ? undefined : 3} ellipsizeMode="tail">
          {item.text ?? item.message ?? 'No content'}
        </Text>

        <Text
          style={styles.seeMore}
          onPress={() =>
            setExpandedReplies((prev) => ({
              ...prev,
              [item.id]: !prev[item.id],
            }))
          }
        >
          {isExpanded ? 'See Less' : 'See More'}
        </Text>

        <Text style={styles.date}>
          {item.timestamp?.toDate?.().toLocaleString?.() ??
            item.sentAt?.toDate?.().toLocaleString?.() ??
            item.repliedAt?.toDate?.().toLocaleString?.() ??
            'unknown'}
        </Text>
        <Text style={styles.meta}>
          {' '}
          {locationLoading
            ? 'Locating...'
            : [locationName?.city, locationName?.region].filter(Boolean).join(', ') || 'Unknown'}
        </Text>
      </View>
    );
  }}
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
  locationContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  drifText: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  
  meta: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  seeMore: {
    color: '#007AFF',
    marginTop: 6,
    fontSize: 13,
  },  
});
