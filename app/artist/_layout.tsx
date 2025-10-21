import { Stack, router } from 'expo-router';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ArtistLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        headerTransparent: true,
        headerBlurEffect: 'dark',
        presentation: 'card',
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Artista',
          headerBackTitleVisible: false,
          headerLargeTitle: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={{
                marginLeft: Platform.OS === 'ios' ? 0 : 8,
                padding: 8,
              }}
            >
              <Ionicons
                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                size={Platform.OS === 'ios' ? 22 : 24}
                color="#ffffff"
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}