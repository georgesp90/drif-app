import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Easing,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


export default function AnimatedBackgroundWrapper({ children }: { children: React.ReactNode }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  console.log("✅ AnimatedBackgroundWrapper is mounted from the wrapper ");

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = scrollX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -screenWidth],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('@/assets/images/wave-bg.png')}
        resizeMode="repeat"
        style={[styles.animatedBackground, { transform: [{ translateX }] }]}
      />
      <View style={styles.overlay}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
  animatedBackground: {
    position: 'absolute',
    width: screenWidth * 2,
    height: screenHeight,
    top: 0,
    left: 0,
    zIndex: -1, // ✅ add this!

  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,255,0,0.3)',
  },
});
