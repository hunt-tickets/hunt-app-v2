import React from 'react';
import { Tabs } from 'expo-router';
import { NativeTabs, Icon } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS } from 'react-native';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function VenderTicketsTabLayout() {
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
          name="dashboard"
          title="Dashboard"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="chart.line.uptrend.xyaxis" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="eventos"
          title="Eventos"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="calendar" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="historial"
          title="Historial"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="clock.arrow.circlepath" />
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
        headerTransparent: true,
        headerTitle: 'Vender Tickets',
        headerTitleStyle: {
          color: '#ffffff',
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Icon sf="chart.line.uptrend.xyaxis" />,
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color }) => <Icon sf="calendar" />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <Icon sf="clock.arrow.circlepath" />,
        }}
      />
    </Tabs>
  );
}