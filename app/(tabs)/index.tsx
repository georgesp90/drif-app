import { StyleSheet, ActivityIndicator, TextInput, Button, Alert, Keyboard } from 'react-native';
import { useState } from 'react';

import { useDeviceId } from '@/context/DeviceIdContext';
import { sendDrif } from '@/utils/sendDrif';

import { Text, View } from '@/components/Themed';

export default function TabOneScreen() {
  const { deviceId, loading } = useDeviceId();
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!deviceId || !message.trim()) return;

    try {
      await sendDrif(deviceId, message.trim());
      Alert.alert('✅ Drif Sent!', 'Your message is floating out there...');
      setMessage('');
      Keyboard.dismiss(); // ✅ Dismiss the keyboard after sending
    } catch (err) {
      Alert.alert('❌ Error', 'Something went wrong sending your Drif.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading your drift ID...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send a Drif 🌊</Text>
      <Text>Your device ID: {deviceId?.slice(0, 8)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Write something anonymous..."
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Button title="Send Drif" onPress={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
