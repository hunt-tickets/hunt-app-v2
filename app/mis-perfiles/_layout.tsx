import { Stack, router } from 'expo-router';
import { Platform, TouchableOpacity, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function MisPerfilesLayout() {

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
          height: 100, // More compact header
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
          title: 'Mis Perfiles',
          headerLargeTitle: false,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={{ marginLeft: Platform.OS === 'ios' ? 0 : 8 }}
            >
              <View style={{ paddingLeft: 4 }}>
                <Ionicons
                  name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                  size={Platform.OS === 'ios' ? 22 : 20}
                  color="#ffffff"
                />
              </View>
            </TouchableOpacity>
          ),
          headerSearchBarOptions: Platform.OS === 'ios' ? {
            placeholder: 'Buscar perfiles',
            hideWhenScrolling: false,
            hideNavigationBarOnFocus: true,
            autoCapitalize: 'none',
            animationDuration: 350, // Match our animation duration
            onChangeText: (event: any) => {
              // This will be handled in the index page
              router.setParams({ search: event.nativeEvent.text });
            },
            onFocus: () => {
              // Small delay to sync with header animation start
              setTimeout(() => {
                router.setParams({ searchFocused: 'true' });
              }, 16); // One frame delay for better sync
            },
            onBlur: () => {
              router.setParams({ searchFocused: 'false' });
            },
          } : undefined,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Perfil del Productor',
          headerLargeTitle: false,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={{ marginLeft: Platform.OS === 'ios' ? 0 : 8 }}
            >
              <View style={{ paddingLeft: 4 }}>
                <Ionicons
                  name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                  size={Platform.OS === 'ios' ? 22 : 20}
                  color="#ffffff"
                />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}