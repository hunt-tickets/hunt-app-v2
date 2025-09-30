import React from 'react';
import { TouchableOpacity, Platform, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface NativeButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'transparent';
}

export function NativeButton({
  onPress,
  children,
  style,
  size = 'medium',
  variant = 'transparent'
}: NativeButtonProps) {

  const handlePress = () => {
    // Native haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const buttonStyle = [
    styles.base,
    styles[size],
    Platform.select({
      ios: styles[`ios_${variant}`],
      android: styles[`android_${variant}`]
    }),
    style
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.8}
      // Android ripple effect
      {...(Platform.OS === 'android' && {
        android_ripple: {
          color: 'rgba(0, 122, 255, 0.3)',
          borderless: true
        }
      })}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },

  // Sizes
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  medium: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  large: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  // iOS Variants
  ios_primary: {
    backgroundColor: '#007AFF',
  },
  ios_secondary: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  ios_transparent: {
    backgroundColor: 'transparent',
  },

  // Android Variants
  android_primary: {
    backgroundColor: '#2196F3',
    elevation: 2,
  },
  android_secondary: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    elevation: 1,
  },
  android_transparent: {
    backgroundColor: 'transparent',
  },
});