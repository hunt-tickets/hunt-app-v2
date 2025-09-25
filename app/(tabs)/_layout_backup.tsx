import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { AnimatedTabBar } from '../../components/animated-tab-bar';
import { useScrollAnimation } from '../../hooks/use-scroll-animation';
import { FontFamily } from '../../constants/fonts';
import React, { createContext, useContext } from 'react';
import * as Haptics from 'expo-haptics';
import { 
  Zap, 
  Calendar, 
  MessageCircle, 
  User,
  CalendarDays,
  MessageCircleMore,
  UserCheck
} from 'lucide-react-native';

const ScrollContext = createContext<ReturnType<typeof useScrollAnimation> | null>(null);

export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within ScrollProvider');
  }
  return context;
}

// Extract active tab name from a pathname like '/(tabs)/ajustes' or '/(tabs)/ajustes/sub'
// function getActiveTab(path: string) {
//   const p = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
//   const match = p.match(/^\/\((tabs)\)(?:\/([^\/\?#]+))?/);
//   if (!match) return null;
//   return match[2] ?? 'index';
// }

export default function TabLayout() {
  const scrollAnimation = useScrollAnimation();

  return (
    <ScrollContext.Provider value={scrollAnimation}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#1d9bf0',
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
            headerShown: false,
          }}
        >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="entradas"
        options={{
          title: 'Entradas',
        }}
      />
      <Tabs.Screen
        name="soporte"
        options={{
          title: 'Soporte',
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
        }}
      />
      {/* Categories accessible via home screen */}
      <Tabs.Screen
        name="categories"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Hidden tabs - accessible via navigation */}
      <Tabs.Screen
        name="search"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="event"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
        {/* Custom Animated Tab Bar */}
        <AnimatedTabBar scrollY={scrollAnimation.scrollY}>
          <View style={styles.customTabBar}>
            <TabBarButton 
              name="index" 
              iconFocused={<Zap />} 
              iconUnfocused={<Zap />} 
              label="Inicio"
            />
            <TabBarButton 
              name="entradas" 
              iconFocused={<CalendarDays />} 
              iconUnfocused={<Calendar />} 
              label="Entradas"
            />
            <TabBarButton 
              name="soporte" 
              iconFocused={<MessageCircleMore />} 
              iconUnfocused={<MessageCircle />} 
              label="Soporte"
            />
            <TabBarButton 
              name="ajustes" 
              iconFocused={<UserCheck />} 
              iconUnfocused={<User />} 
              label="Ajustes"
            />
          </View>
        </AnimatedTabBar>
      </View>
    </ScrollContext.Provider>
  );
}

interface TabBarButtonProps {
  name: string;
  iconFocused: React.ReactNode;
  iconUnfocused: React.ReactNode;
  label: string;
}

function TabBarButton({ name, iconFocused, iconUnfocused, label }: TabBarButtonProps) {
  const router = useRouter();
  const segments = useSegments();
  const TABS_PREFIX = '/(tabs)';

  const activeTab = segments[0] === '(tabs)' ? (segments[1] ?? 'index') : null;
  const focused = activeTab === (name === 'index' ? 'index' : name);
  const route = name === 'index' ? TABS_PREFIX : `${TABS_PREFIX}/${name}`;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route);
  };
  return (
    <TouchableOpacity 
      style={styles.tabButton} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={{ 
        transform: [{ scale: focused ? 1.1 : 1 }],
        marginTop: -16, // Move icons up more
        alignItems: 'center',
      }}>
        <View style={{ opacity: focused ? 1 : 0.6 }}>
          {React.cloneElement(
            (focused ? iconFocused : iconUnfocused) as React.ReactElement,
            { size: 24, color: focused ? '#FFFFFF' : '#71767b', strokeWidth: focused ? 2.2 : 1.8 }
          )}
        </View>
        {/* removed active indicator dot */}
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
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.1,
  },
});