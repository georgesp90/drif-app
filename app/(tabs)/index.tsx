import { StyleSheet, ActivityIndicator, TextInput, Button, Alert, Keyboard, ImageBackground, Animated, Easing  } from 'react-native';
import { useState, useRef, useEffect } from 'react';

import { useDeviceId } from '@/context/DeviceIdContext';
import { sendDrif } from '@/utils/sendDrif';

import { Text, View } from '@/components/Themed';
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

        <Button title="Send Drif" onPress={handleSend} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'skyblue', // fallback if image fails
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    backgroundColor: 'transparent', // translucent overlay for readability
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
    borderRadius: 12, // ✅ more rounded corners
    padding: 12,
    marginVertical: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  
    // ✅ shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  
    // ✅ elevation for Android
    elevation: 3,
  },
});
