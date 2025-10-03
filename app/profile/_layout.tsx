import { Stack, router } from 'expo-router';
import { Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTransparent: true,
        headerBlurEffect: 'systemUltraThinMaterialDark',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '',
          headerStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(0, 0, 0, 0.95)',
          },
          headerTransparent: true,
          headerBlurEffect: Platform.OS === 'ios' ? 'systemUltraThinMaterialDark' : undefined,
          headerTintColor: '#FFFFFF',
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <BlurView
                intensity={60}
                tint={theme.isDark ? "dark" : "light"}
                style={styles.blurView}
              >
                <View style={styles.buttonOverlay}>
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </View>
              </BlurView>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: Platform.OS === 'ios' ? 8 : 16,
  },
  blurView: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  buttonOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});