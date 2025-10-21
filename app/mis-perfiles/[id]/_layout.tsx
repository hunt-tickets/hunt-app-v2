import React, { createContext, useContext } from 'react';
import { Tabs, Stack, router, useLocalSearchParams } from 'expo-router';
import { NativeTabs, Icon } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS } from 'react-native';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Create Producer ID Context
const ProducerIdContext = createContext<string | undefined>(undefined);

export const useProducerId = () => {
  const id = useContext(ProducerIdContext);
  return id;
};

export default function ProducerTabLayout() {
  const { id } = useLocalSearchParams();
  const useNativeTabs = Platform.OS === 'ios';

  if (useNativeTabs) {
    return (
      <ProducerIdContext.Provider value={id as string}>
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
          headerShown: false, // Hide individual headers since we have the parent header
        }}
      >
        <NativeTabs.Trigger
          name="analytics"
          title="Analíticas"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="chart.bar" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="team"
          title="Equipo"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="person.2" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger
          name="profile"
          title="Perfil"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Icon sf="person.circle" />
        </NativeTabs.Trigger>
        </NativeTabs>
      </ProducerIdContext.Provider>
    );
  }

  // Fallback for Android
  return (
    <ProducerIdContext.Provider value={id as string}>
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
        headerTitle: 'Gestión de Perfil',
        headerTitleStyle: {
          color: '#ffffff',
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analíticas',
          tabBarIcon: ({ color }) => <Icon sf="chart.bar" />,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: 'Equipo',
          tabBarIcon: ({ color }) => <Icon sf="person.2" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Icon sf="person.circle" />,
        }}
      />
      </Tabs>
    </ProducerIdContext.Provider>
  );
}