import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  Image,
  Dimensions,
  RefreshControl,
  Share,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useScrollContext } from './_layout';
import { Typography, FontFamily } from '../../constants/fonts';
import LocationSelectorModal from '../../components/location-selector-modal';
import { NativeButton } from '../../components/native-button';
import LiquidGlassCard from '../../components/liquid-glass-card';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService, Event, formatEventDate, getEventImageUrl, getEventVenue } from '../../lib/api';
import EventSkeleton from '../../components/event-skeleton';
import SupportModal from '../../components/support-modal';
// Native Tabs work perfectly, keeping header custom for now

const { width } = Dimensions.get('window');

// Calculate card dimensions for 4:3 ratio (4 height, 3 width)
const CARD_HORIZONTAL_PADDING = 40; // 20px on each side
const CARD_WIDTH = width - CARD_HORIZONTAL_PADDING;
const CARD_HEIGHT = (CARD_WIDTH * 4) / 3; // 4:3 ratio where 4 is height

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user, session } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Medellín'); // Default fallback
  const [isDetectingInitialLocation, setIsDetectingInitialLocation] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [greeting, setGreeting] = useState('Hola');
  const [loading, setLoading] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const { scrollY, onScroll } = useScrollContext();
  const insets = useSafeAreaInsets();

  // Load events and detect location when app starts
  useEffect(() => {
    detectInitialLocation();
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // Get user's access token from auth context
      const userToken = session?.accessToken;
      const response = await ApiService.getMainEvents(userToken);
      setEvents(response.events);
      setGreeting(response.greeting);
      console.log('Events loaded:', response.events.length);
    } catch (error) {
      console.error('Error loading events:', error);
      // Keep empty events array as fallback
    } finally {
      setLoading(false);
    }
  };

  const detectInitialLocation = async () => {
    try {
      setIsDetectingInitialLocation(true);
      console.log('Detecting initial location...');

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        // We already have permissions, detect location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address.city || address.region) {
          const cityName = address.city || address.region || 'Ubicación detectada';
          setSelectedLocation(cityName);
          console.log('Initial location detected:', cityName);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        // Request permissions for next time, but don't detect now
        console.log('No location permissions, using default location');
      }
    } catch (error) {
      console.error('Error detecting initial location:', error);
      // Keep default location (Medellín)
    } finally {
      setIsDetectingInitialLocation(false);
    }
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadEvents();
      console.log('Events refreshed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleShare = async (event: Event) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `¡Mira este evento: ${event.name} en ${getEventVenue(event)}! 🎉 ${event.url}`,
        title: event.name,
        url: event.url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOptions = (event: Event) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Opciones',
      `¿Qué quieres hacer con ${event.name}?`,
      [
        { text: 'Compartir', onPress: () => handleShare(event) },
        { text: 'Favorito', onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          console.log('Add to favorites');
        }},
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleEventPress = (event: Event) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Event pressed:', event.id);
    console.log('Attempting navigation...');

    // Try multiple navigation approaches
    setTimeout(() => {
      try {
        console.log('Using router.push');
        router.push(`/event/${event.id}`);
      } catch (error) {
        console.error('router.push failed:', error);
        try {
          console.log('Using router.navigate');
          router.navigate(`/event/${event.id}`);
        } catch (error2) {
          console.error('router.navigate failed:', error2);
          Alert.alert('Error', 'No se pudo navegar al evento');
        }
      }
    }, 100);
  };


  const toggleLocationModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowLocationModal(!showLocationModal);
  };

  const handleLocationSelect = (city: string) => {
    setSelectedLocation(city);
    console.log('Location selected:', city);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Removed auto-close behavior from modal interaction as per update instructions
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Header with Gradient Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 20 }]}>
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <View style={styles.greetingText}>
              <Text style={styles.greeting}>{greeting}</Text>
              <TouchableOpacity
                style={styles.locationContainer}
                onPress={toggleLocationModal}
              >
                <Text style={styles.locationText}>{selectedLocation}</Text>
                <Ionicons name="chevron-down" size={16} color="#cccccc" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Header Right Buttons */}
          <View style={styles.headerRightButtons}>
            {/* Glass Support Button */}
            <TouchableOpacity
              style={styles.glassHeaderButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowSupportModal(true);
              }}
              activeOpacity={0.8}
            >
              <BlurView
                intensity={60}
                tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.glassButtonOverlay}>
                <Ionicons
                  name="headset"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
            </TouchableOpacity>

            {/* Glass Notification Button */}
            <TouchableOpacity
              style={styles.glassHeaderButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/notifications');
              }}
              activeOpacity={0.8}
            >
              <BlurView
                intensity={60}
                tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.glassButtonOverlay}>
                <Ionicons
                  name="notifications"
                  size={20}
                  color={theme.colors.text}
                />
                <View style={styles.glassNotificationBadge}>
                  <Text style={styles.glassNotificationBadgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* Events Feed */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={["#ffffff"]}
          />
        }
      >
        {loading ? (
          <>
            <EventSkeleton />
            <EventSkeleton />
            <EventSkeleton />
          </>
        ) : events.length > 0 ? (
          events.map((event) => (
            <LiquidGlassCard
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event)}
              onShare={() => handleShare(event)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyTitle}>No hay eventos disponibles</Text>
            <Text style={styles.emptySubtitle}>Desliza hacia abajo para actualizar</Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={handleLocationSelect}
        currentLocation={selectedLocation}
      />

      {/* Support Modal */}
      <SupportModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20, // Only bottom padding, top is handled manually
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  greetingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  liquidGlassButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  liquidGlassBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  liquidGlassOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    ...Typography.title2,
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...Typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  nativeButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  iosSystemButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    // iOS system button styling
    borderWidth: 0,
  },
  androidSystemButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glassHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  glassButtonOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glassNotificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  glassNotificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 140, // Header height + extra spacing
    paddingBottom: 120, // Bottom spacing for tab bar + extra
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    textAlign: 'center',
  },
});