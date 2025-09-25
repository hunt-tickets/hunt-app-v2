import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';

interface AnimatedTabBarProps {
  scrollY: Animated.SharedValue<number>;
  children: React.ReactNode;
}

export function AnimatedTabBar({ scrollY, children }: AnimatedTabBarProps) {

  const containerAnimatedStyle = useAnimatedStyle(() => {
    // Cambia la opacidad completa del tab bar basado en scroll
    const containerOpacity = interpolate(
      scrollY.value,
      [0, 80, 160],
      [1, 0.9, 0.75], // Menos transparente y recuperación más rápida
      'clamp'
    );

    return {
      opacity: containerOpacity,
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const overlayOpacity = interpolate(
      scrollY.value,
      [0, 80, 160],
      [0.7, 0.5, 0.3], // Ajustado para coincidir con los nuevos rangos
      'clamp'
    );

    return {
      backgroundColor: `rgba(10, 10, 10, ${overlayOpacity})`,
    };
  });

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <BlurView
        intensity={80}
        tint="dark"
        style={StyleSheet.absoluteFillObject}
      >
        <Animated.View 
          style={[StyleSheet.absoluteFillObject, overlayAnimatedStyle]} 
        />
      </BlurView>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 12,
  },
});