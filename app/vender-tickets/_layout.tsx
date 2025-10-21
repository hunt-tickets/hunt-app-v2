import React from 'react';
import { Stack } from 'expo-router';

export default function VenderTicketsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="detalle-venta"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}