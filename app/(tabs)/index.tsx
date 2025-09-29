import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Share,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const { width } = Dimensions.get('window');

// Calculate card dimensions for 4:3 ratio (4 height, 3 width)
const CARD_HORIZONTAL_PADDING = 40; // 20px on each side
const CARD_WIDTH = width - CARD_HORIZONTAL_PADDING;
const CARD_HEIGHT = (CARD_WIDTH * 4) / 3; // 4:3 ratio where 4 is height

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Medellín'); // Default fallback
  const [isDetectingInitialLocation, setIsDetectingInitialLocation] = useState(false);
  const { scrollY, onScroll } = useScrollContext();
  const insets = useSafeAreaInsets();

  // Detect location when app starts
  useEffect(() => {
    detectInitialLocation();
  }, []);

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
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      console.log('Events refreshed');
    }, 2000);
  }, []);

  const handleShare = async (event: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `¡Mira este evento: ${event.title} en ${event.location}! 🎉`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOptions = (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Opciones',
      `¿Qué quieres hacer con ${event.title}?`,
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

  const handleEventPress = (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/event/${event.id}`);
  };

  const toggleSearch = () => {
    Haptics.selectionAsync();
    setIsSearching((prev) => !prev);
    if (isSearching) setQuery('');
  };

  const clearQuery = () => setQuery('');

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

  const events = [
    {
      id: 1,
      title: 'MARÍA HELENA AMADOR',
      date: '29',
      month: 'sep',
      location: 'Gimnasio Moderno',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=1000&fit=crop',
      subtitle: 'ZONAS VERDES Y COLISEO CUBIERTO',
      dates: '29 SEPT - 3 OCT',
    },
    {
      id: 2,
      title: 'INSIDE PRESENTA',
      date: '20',
      month: 'sep',
      location: 'Teatro Nacional',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      subtitle: 'CREATIVE ENTERTAINMENT',
    },
    {
      id: 3,
      title: 'FESTIVAL DE MÚSICA',
      date: '15',
      month: 'oct',
      location: 'Parque Central',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop',
      subtitle: 'ARTISTAS INTERNACIONALES',
    },
    {
      id: 4,
      title: 'STAND UP COMEDY',
      date: '22',
      month: 'oct',
      location: 'Teatro Libre',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
      subtitle: 'NOCHE DE RISAS',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header with Gradient Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 20 }]}>
        <LinearGradient
          colors={['#0a0a0a', 'rgba(10, 10, 10, 0.8)', 'transparent']}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          {isSearching ? (
            <View style={styles.searchHeaderContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color="#888888" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar eventos, lugares o artistas"
                  placeholderTextColor="#888888"
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={clearQuery} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={18} color="#888888" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.headerActionButton} onPress={toggleSearch}>
                <Ionicons name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>Hola, Luis Fernando</Text>
                <Text style={styles.locationText}>{selectedLocation}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={() => router.push('/(tabs)/categories')}
                >
                  <Ionicons name="grid-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={toggleLocationModal}
                >
                  <Ionicons name="location-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={toggleSearch}
                >
                  <Ionicons name="search-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Content */}
      {isSearching ? (
        <ScrollView style={styles.searchContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.searchHint}>Explora por categorías</Text>
          <View style={styles.chipsRow}>
            {['Hoy', 'Música', 'Teatro', 'Gratis', 'Cerca de ti'].map((c) => (
              <TouchableOpacity key={c} style={styles.chip} onPress={() => setQuery(c)}>
                <Text style={styles.chipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {query.length > 0 ? (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.resultsTitle}>Resultados para "{query}"</Text>
              {/* Placeholder simple results cards */}
              {[1,2,3].map((i) => (
                <View key={i} style={styles.resultItem}>
                  <View style={styles.resultThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>Evento {i} — {query}</Text>
                    <Text style={styles.resultSubtitle}>Lugar • Fecha</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#888888" />
                </View>
              ))}
            </View>
          ) : (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.searchHint}>Búsquedas recientes</Text>
              {['Concierto', 'Medellín', 'Stand Up'].map((r) => (
                <TouchableOpacity key={r} style={styles.recentItem} onPress={() => setQuery(r)}>
                  <Ionicons name="time-outline" size={16} color="#888888" />
                  <Text style={styles.recentText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        /* Events Feed */
        <Animated.ScrollView 
          style={styles.scrollView} 
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
          {events.map((event) => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              activeOpacity={0.95}
              onPress={() => handleEventPress(event)}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              {/* Gradient Overlay */}
              <LinearGradient 
                colors={['transparent', '#0a0a0a']} 
                style={styles.overlay}
                locations={[0.3, 1]}
              />
              {/* Card Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.overlayActionButton}
                  onPress={() => handleShare(event)}
                >
                  <Ionicons name="share-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateNumber}>{event.date}</Text>
                  <Text style={styles.dateMonth}>{event.month}</Text>
                </View>
              </View>

              {/* Event Info */}
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={16} color="#cccccc" />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      )}

      {/* Location Selector Modal */}
      <LocationSelectorModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={handleLocationSelect}
        currentLocation={selectedLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  searchHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#333333',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: '#ffffff',
  },
  clearButton: {
    padding: 4,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    ...Typography.title2,
    color: '#ffffff',
  },
  locationText: {
    ...Typography.caption,
    color: '#888888',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1a1a1a',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 120, // Header height + safe area
  },
  searchHint: {
    ...Typography.subheadline,
    color: '#cccccc',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  chipText: {
    ...Typography.caption,
    color: '#ffffff',
  },
  resultsTitle: {
    ...Typography.bodyMedium,
    color: '#ffffff',
    marginBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  resultThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#222222',
  },
  resultTitle: {
    ...Typography.body,
    color: '#ffffff',
  },
  resultSubtitle: {
    ...Typography.caption,
    color: '#aaaaaa',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  recentText: {
    ...Typography.body,
    color: '#cccccc',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 120, // Header height + safe area
  },
  eventCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    alignSelf: 'center', // Center the card horizontally
    borderWidth: 1,
    borderColor: '#303030',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardActions: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  overlayActionButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#303030',
  },
  dateNumber: {
    ...Typography.title3,
    fontSize: 24,
    color: '#ffffff',
    lineHeight: 28,
    fontWeight: 'bold',
  },
  dateMonth: {
    ...Typography.caption,
    color: '#ffffff',
    textTransform: 'lowercase',
  },
  eventInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  eventDates: {
    ...Typography.subheadline,
    color: '#ffffff',
    marginBottom: 4,
  },
  eventSubtitle: {
    ...Typography.body,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  eventTitle: {
    ...Typography.title1,
    fontSize: 28, // Slightly smaller for better fit in 4:3 ratio
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 32,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    ...Typography.body,
    color: '#cccccc',
    marginLeft: 4,
  },
});