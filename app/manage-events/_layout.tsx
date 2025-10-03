import { Stack, router } from 'expo-router';
import { Platform, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ManageEventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0a0a0a',
        },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        headerLargeTitle: Platform.OS === 'ios',
        headerTransparent: Platform.OS === 'ios',
        headerBlurEffect: Platform.OS === 'ios' ? 'dark' : undefined,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Administrar',
          headerLargeTitle: true,
          headerSearchBarOptions: Platform.OS === 'ios' ? {
            placeholder: 'Buscar eventos',
            hideWhenScrolling: false,
            autoCapitalize: 'none',
          } : undefined,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert('Crear Evento', 'Funcionalidad de crear evento próximamente');
              }}
            >
              <Ionicons name="add-circle" size={28} color="#ffffff" />
            </TouchableOpacity>
          ),
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