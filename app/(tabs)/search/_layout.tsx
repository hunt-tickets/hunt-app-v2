import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { DynamicColorIOS } from 'react-native';
import React, { useState } from 'react';

export default function SearchLayout() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: '', // Remove title
          headerBlurEffect: 'systemMaterial',
          headerStyle: {
            backgroundColor: DynamicColorIOS({
              dark: 'rgba(0, 0, 0, 0.8)',
              light: 'rgba(255, 255, 255, 0.8)'
            }),
          },
          headerSearchBarOptions: {
            placement: 'automatic',
            placeholder: 'Buscar eventos...',
            hideWhenScrolling: false,
            onChangeText: (event) => {
              const text = event.nativeEvent.text;
              setSearchQuery(text);
              // You can implement real-time search here
            },
            onSearchButtonPress: (event) => {
              const query = event.nativeEvent.text;
              if (query.trim()) {
                // Navigate with search query
                router.setParams({ q: query });
              }
            },
            onCancelButtonPress: () => {
              setSearchQuery('');
              router.setParams({ q: '' });
            },
          },
        }}
      />
    </Stack>
  );
}