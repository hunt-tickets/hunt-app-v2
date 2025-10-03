import React from 'react';
import { Tabs, Stack } from 'expo-router';
import { NativeTabs, Icon } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS } from 'react-native';
import { View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function EventTabLayout() {
  const useNativeTabs = Platform.OS === 'ios';

  if (useNativeTabs) {
    return (
      <NativeTabs
        backgroundColor={DynamicColorIOS({
          dark: 'rgba(0, 0, 0, 0.8)',
          light: 'rgba(255, 255, 255, 0.8)'
        })}
        tintColor={DynamicColorIOS({
          dark: '#FFFFFF',
          light: '#000000'
        })}
        screenOptions={{
          headerShown: false,
        }}
      >
        <NativeTabs.Trigger
          name="index"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="chart.bar" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="vendedores"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="person.2" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="cierre"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="lock" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="ajustes"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="gearshape" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="transacciones"
          role="search"
          style={{ marginLeft: 'auto' }}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="magnifyingglass" />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Fallback for Android
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#71767b',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Icon sf="chart.bar" />,
        }}
      />
      <Tabs.Screen
        name="vendedores"
        options={{
          title: 'Vendedores',
          tabBarIcon: ({ color }) => <Icon sf="person.2" />,
        }}
      />
      <Tabs.Screen
        name="cierre"
        options={{
          title: 'Cierre',
          tabBarIcon: ({ color }) => <Icon sf="lock" />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Icon sf="gearshape" />,
        }}
      />
      <Tabs.Screen
        name="transacciones"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <Icon sf="magnifyingglass" />,
        }}
      />
    </Tabs>
  );
}