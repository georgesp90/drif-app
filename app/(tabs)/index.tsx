import {
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  Keyboard,
  ImageBackground,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useState } from 'react';

import { useDeviceId } from '@/context/DeviceIdContext';
import { sendDrif } from '@/utils/sendDrif';

import { View } from '@/components/Themed';
import { useLocation } from '@/context/LocationContext';

export default function TabOneScreen() {
  const { deviceId, loading } = useDeviceId();
  const [message, setMessage] = useState('');
  const { locationName, loading: locationLoading } = useLocation();

  const handleSend = async () => {
    if (!deviceId || !message.trim()) return;

    try {
      await sendDrif(deviceId, message.trim());
      Alert.alert('✅ Drif Sent!', 'Your message is floating out there...');
      setMessage('');
      Keyboard.dismiss();
    } catch (err) {
      Alert.alert('❌ Error', 'Something went wrong sending your Drif.');
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('@/assets/images/wave-bg.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Loading your drift ID...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/images/wave-bg.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Send a Drif 🌊</Text>
        <Text>Your device ID: {deviceId?.slice(0, 8)}</Text>
        <Text>
          {locationLoading
            ? 'Locating...'
            : [locationName?.city, locationName?.region].filter(Boolean).join(', ') || 'Unknown'}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Write something anonymous..."
          value={message}
          onChangeText={setMessage}
          multiline
        />

        {/* 🔵 Custom Pill Button */}
        <TouchableOpacity style={styles.button} onPress={handleSend} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Send Drif</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'skyblue',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    color: '#333',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginVertical: 20,
    minHeight: 80,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#007AFF', // blue pill
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
