import { Tabs, useRouter, useSegments } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS } from 'react-native';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { AnimatedTabBar } from '../../components/animated-tab-bar';
import { useScrollAnimation } from '../../hooks/use-scroll-animation';
import { FontFamily } from '../../constants/fonts';
import React, { createContext, useContext, useState } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { HomeIcon, TicketIcon, ChatIcon, SettingsIcon } from '../../components/minimal-icons';

const ScrollContext = createContext<ReturnType<typeof useScrollAnimation> | null>(null);

export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within ScrollProvider');
  }
  return context;
}

export default function TabLayout() {
  const scrollAnimation = useScrollAnimation();
  const [useNativeTabs, setUseNativeTabs] = useState(Platform.OS === 'ios'); // Enable on iOS
  const segments = useSegments();
  const router = useRouter();

  // Native Tabs Implementation (iOS 26 Liquid Glass)
  if (useNativeTabs && Platform.OS === 'ios') {
    return (
      <ScrollContext.Provider value={scrollAnimation}>
        <View style={{ flex: 1 }}>
          <NativeTabs
            backgroundColor={DynamicColorIOS({
              dark: 'rgba(0, 0, 0, 0.8)',
              light: 'rgba(255, 255, 255, 0.8)'
            })}
            tintColor={DynamicColorIOS({
              dark: '#FFFFFF',
              light: '#000000'
            })}
          >
            <NativeTabs.Trigger
              name="index"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Icon sf="square.stack" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger
              name="billetera"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Icon sf="creditcard" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger
              name="ajustes"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Icon sf="slider.horizontal.3" />
            </NativeTabs.Trigger>

            {/* Native Search Tab - Uses Stack with headerSearchBarOptions */}
            <NativeTabs.Trigger
              name="search"
              role="search"
              style={{ marginLeft: 'auto' }}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Icon sf="magnifyingglass" />
            </NativeTabs.Trigger>
          </NativeTabs>

        </View>
      </ScrollContext.Provider>
    );
  }

  // Fallback to Custom Tabs
  return (
    <ScrollContext.Provider value={scrollAnimation}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: '#71767b',
            tabBarStyle: {
              display: 'none', // Hide default tab bar
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontFamily: FontFamily.SemiBold,
              marginTop: 4,
              letterSpacing: 0.1,
            },
          }}
        >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="billetera"
        options={{
          title: 'Billetera',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="soporte"
        options={{
          title: 'Soporte',
          href: null, // Hide from navigation since it's now a modal
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          headerShown: false,
        }}
      />
      {/* Categories accessible via home screen */}
      <Tabs.Screen
        name="categories"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      {/* Administrar eventos accessible via settings */}
      <Tabs.Screen
        name="administrar-eventos"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      {/* Hidden tabs - accessible via navigation */}
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="event"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
    </Tabs>
        {/* Custom Animated Tab Bar - Hide on administrar-eventos */}
        {segments[1] !== 'administrar-eventos' && (
          <AnimatedTabBar scrollY={scrollAnimation.scrollY}>
            <View style={styles.customTabBar}>
              <TabBarButton
                name="index"
                iconFocused={<HomeIcon />}
                iconUnfocused={<HomeIcon />}
                label="Inicio"
              />
              <TabBarButton
                name="billetera"
                iconFocused={<TicketIcon />}
                iconUnfocused={<TicketIcon />}
                label="Billetera"
              />
              <TabBarButton
                name="ajustes"
                iconFocused={<SettingsIcon />}
                iconUnfocused={<SettingsIcon />}
                label="Ajustes"
              />
            </View>
          </AnimatedTabBar>
        )}
      </View>
    </ScrollContext.Provider>
  );
}

interface TabBarButtonProps {
  name: string;
  iconFocused: React.ReactNode;
  iconUnfocused: React.ReactNode;
  label: string;
  onPress?: () => void;
}

function TabBarButton({ name, iconFocused, iconUnfocused, label, onPress }: TabBarButtonProps) {
  const router = useRouter();
  const segments = useSegments();
  const TABS_PREFIX = '/(tabs)';

  const activeTab = segments[0] === '(tabs)' ? (segments[1] ?? 'index') : null;
  const focused = activeTab === (name === 'index' ? 'index' : name);
  const route = name === 'index' ? TABS_PREFIX : `${TABS_PREFIX}/${name}`;

  // Animaciones para los indicadores
  const iconScale = useSharedValue(focused ? 1.1 : 1);
  const dotOpacity = useSharedValue(focused ? 1 : 0);
  const dotScale = useSharedValue(focused ? 1 : 0.3);
  const underlineWidth = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    iconScale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
    });
    dotOpacity.value = withSpring(focused ? 1 : 0, {
      damping: 12,
      stiffness: 150,
    });
    dotScale.value = withSpring(focused ? 1 : 0.3, {
      damping: 15,
      stiffness: 200,
    });
    underlineWidth.value = withSpring(focused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [focused]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: focused ? 1 : 0.6,
  }));

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  const underlineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: underlineWidth.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) {
      onPress();
    } else {
      router.push(route);
    }
  };

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.tabButtonContent}>
        {/* Icon Container */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          {React.cloneElement(
            (focused ? iconFocused : iconUnfocused) as React.ReactElement,
            {
              size: 28,
              color: focused ? '#FFFFFF' : '#71767b'
            }
          )}
        </Animated.View>

        {/* Label */}
        <Text style={[styles.tabLabel, { color: focused ? '#FFFFFF' : '#71767b' }]}>
          {label}
        </Text>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 16,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dotIndicator: {
    position: 'absolute',
    top: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  underlineIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'center',
    lineHeight: 12,
    marginBottom: 4,
  },
});