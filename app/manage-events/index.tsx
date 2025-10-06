import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService, AdminEvent } from '../../lib/api';
import ManageEventsSkeleton from '../../components/manage-events-skeleton';

const { width } = Dimensions.get('window');
// Horizontal card dimensions - full width
const CARD_HEIGHT = 160; // Fixed height for horizontal cards

interface MappedEvent {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  date: string;
  month: string;
  status: 'active' | 'draft' | 'past' | null;
  image: string | null;
  attendees: number;
}

export default function ManageEventsScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [searchText, setSearchText] = useState((params.q as string) || '');
  const [events, setEvents] = useState<MappedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events from API
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const userToken = session?.accessToken;
      const apiEvents = await ApiService.getAllEventsOrdered(userToken);

      // Map API events to component interface
      const mappedEvents: MappedEvent[] = apiEvents.map(event => {
        // Parse date string (e.g., "19 OCT" or " ")
        const dateParts = event.date.trim().split(' ');
        const day = dateParts[0] || '';
        const month = dateParts[1]?.toLowerCase() || '';

        // Map status to component status type
        let componentStatus: 'active' | 'draft' | 'past' | null = null;
        if (event.status) {
          const statusLower = event.status.toLowerCase();
          if (statusLower === 'activo' || statusLower === 'active') {
            componentStatus = 'active';
          } else if (statusLower === 'borrador' || statusLower === 'draft') {
            componentStatus = 'draft';
          } else if (statusLower === 'pasado' || statusLower === 'past' || statusLower === 'finalizado') {
            componentStatus = 'past';
          }
        } else {
          // If no status, default to draft
          componentStatus = 'draft';
        }

        console.log(`Event: ${event.name}, Status from API: ${event.status}, Mapped to: ${componentStatus}`);

        return {
          id: event.id,
          title: event.name,
          subtitle: '', // API doesn't provide subtitle
          location: 'Evento', // API doesn't provide location in this endpoint
          date: day,
          month: month,
          status: componentStatus,
          image: event.flyer || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
          attendees: 0 // API doesn't provide attendees in this endpoint
        };
      });

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };


  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = selectedFilter === 'all' ||
                         event.status === selectedFilter ||
                         (selectedFilter === 'draft' && !event.status); // Show null status as draft
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'active', label: 'Activos' },
    { key: 'draft', label: 'Borradores' },
    { key: 'past', label: 'Pasados' },
  ];

  const handleFilterChange = (event: any) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setSelectedFilterIndex(index);
    setSelectedFilter(filters[index].key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'draft': return '#FF9500';
      case 'past': return '#8E8E93';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      case 'past': return 'Finalizado';
      default: return '';
    }
  };

  const handleEventPress = (event: MappedEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/manage-events/${event.id}`);
  };


  // Handle search from native search bar
  useEffect(() => {
    if (params.q) {
      setSearchText(params.q as string);
    }
  }, [params.q]);

  const styles = createStyles(theme, insets);

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Filter Tabs - iOS Native Style */}
        <View style={styles.filtersContainer}>
          <SegmentedControl
            values={filters.map(f => f.label)}
            selectedIndex={selectedFilterIndex}
            onChange={handleFilterChange}
            style={styles.segmentedControl}
          />
        </View>

        {/* Events List */}
        {loading ? (
          <ManageEventsSkeleton />
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
              activeOpacity={0.95}
            >
              {/* Background Image */}
              <Image source={{ uri: event.image }} style={styles.eventImage} />

              {/* Enhanced Gradient Overlay - same as LiquidGlassCard */}
              <LinearGradient
                colors={['transparent', 'rgba(8, 8, 8, 0.7)', 'rgba(10, 10, 10, 0.95)']}
                style={styles.overlay}
                locations={[0, 0.4, 0.8]}
              />

              {/* Card Actions with Liquid Glass */}
              <View style={styles.cardActions}>
                {/* Share Button with Liquid Glass */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    console.log('Share event', event.id);
                  }}
                >
                  <BlurView
                    intensity={40}
                    tint="dark"
                    style={styles.actionButtonBlur}
                  >
                    <View style={styles.actionButtonOverlay}>
                      <Ionicons name="share-outline" size={16} color="#ffffff" />
                    </View>
                  </BlurView>
                </TouchableOpacity>

                {/* Date Container with Liquid Glass */}
                <View style={styles.dateContainer}>
                  <BlurView
                    intensity={40}
                    tint="dark"
                    style={styles.dateBlur}
                  >
                    <View style={styles.dateOverlay}>
                      <Text style={styles.eventMonth}>{event.month.toUpperCase()}</Text>
                      <Text style={styles.eventDay}>{event.date}</Text>
                    </View>
                  </BlurView>
                </View>
              </View>

              {/* Status Badge - only show if status exists */}
              {event.status && (
                <View style={styles.statusBadge}>
                  <BlurView
                    intensity={50}
                    tint="dark"
                    style={styles.statusBlur}
                  >
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(event.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
                      {getStatusLabel(event.status)}
                    </Text>
                  </BlurView>
                </View>
              )}

              {/* Event Content */}
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No hay eventos</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchText ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primer evento'}
            </Text>
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const createStyles = (theme: Theme, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Content styles
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 140, // Start content below the taller header
    paddingBottom: 120, // Bottom spacing for tab bar
  },
  // Filter styles
  filtersContainer: {
    marginBottom: 20,
  },
  segmentedControl: {
    width: '100%',
    height: 36,
  },
  // Event Card styles - horizontal full width
  eventCard: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  eventImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  // Card Actions
  cardActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Date Container
  dateContainer: {
    width: 52,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
  },
  dateBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  eventMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
  eventDay: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: -2,
  },
  // Status Badge
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Event Content
  eventContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});