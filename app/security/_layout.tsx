import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '../../contexts/ThemeContext';

export default function SecurityLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTransparent: true,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <GlassView glassEffectStyle="regular" style={styles.blurContainer}>
              <View style={[styles.buttonContent, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </View>
            </GlassView>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Seguridad',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 10,
  },
  blurContainer: {
    borderRadius: 17,
    overflow: 'hidden',
  },
  buttonContent: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
});