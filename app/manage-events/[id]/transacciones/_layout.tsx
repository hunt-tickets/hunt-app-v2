import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function TransaccionesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: Platform.OS === 'ios',
        headerSearchBarOptions: Platform.OS === 'ios' ? {
          placeholder: 'Buscar transacciones...',
          hideWhenScrolling: false,
          obscureBackground: true,
          textColor: '#FFFFFF',
          tintColor: '#FFFFFF',
          headerIconColor: '#FFFFFF',
        } : undefined,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Transacciones',
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerBlurEffect: 'systemUltraThinMaterialDark',
        }}
      />
    </Stack>
  );
}