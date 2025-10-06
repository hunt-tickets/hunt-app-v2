import { Stack, router } from 'expo-router';
import { Platform, TouchableOpacity, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function ManageEventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
          height: 120, // Make header taller
        },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        headerTransparent: true,
        headerBlurEffect: 'dark',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Eventos',
          headerLargeTitle: false,
          headerBackVisible: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={{ marginLeft: Platform.OS === 'ios' ? 0 : 8 }}
            >
              <View style={{ paddingLeft: 2 }}>
                <Ionicons
                  name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                  size={Platform.OS === 'ios' ? 28 : 24}
                  color="#ffffff"
                />
              </View>
            </TouchableOpacity>
          ),
          headerSearchBarOptions: Platform.OS === 'ios' ? {
            placeholder: 'Buscar eventos',
            hideWhenScrolling: false,
            autoCapitalize: 'none',
          } : undefined,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}