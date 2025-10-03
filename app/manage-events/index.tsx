import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface Event {
  id: number;
  title: string;
  subtitle: string;
  location: string;
  date: string;
  month: string;
  status: 'active' | 'draft' | 'past';
  image: string;
  attendees: number;
}

export default function ManageEventsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [searchText, setSearchText] = useState((params.q as string) || '');

  // Mock events data
  const [events] = useState<Event[]>([
    {
      id: 1,
      title: 'MARÍA HELENA AMADOR',
      subtitle: 'ZONAS VERDES Y COLISEO CUBIERTO',
      location: 'Gimnasio Moderno',
      date: '29',
      month: 'sep',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=1000&fit=crop',
      attendees: 245,
    },
    {
      id: 2,
      title: 'INSIDE PRESENTA',
      subtitle: 'CREATIVE ENTERTAINMENT',
      location: 'Teatro Nacional',
      date: '20',
      month: 'sep',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      attendees: 156,
    },
    {
      id: 3,
      title: 'FESTIVAL DE MÚSICA',
      subtitle: 'ARTISTAS INTERNACIONALES',
      location: 'Parque Central',
      date: '15',
      month: 'oct',
      status: 'draft',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop',
      attendees: 0,
    },
    {
      id: 4,
      title: 'STAND UP COMEDY',
      subtitle: 'NOCHE DE RISAS',
      location: 'Teatro Libre',
      date: '22',
      month: 'ago',
      status: 'past',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
      attendees: 89,
    },
  ]);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || event.status === selectedFilter;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'draft': return '#FF9500';
      case 'past': return '#8E8E93';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      case 'past': return 'Finalizado';
      default: return '';
    }
  };

  const handleEventPress = (event: Event) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/manage-events/${event.id}`);
  };

  const handleCreateEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Crear Evento', 'Funcionalidad de crear evento próximamente');
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: 20 }]}
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
        {filteredEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => handleEventPress(event)}
          >
            <Image source={{ uri: event.image }} style={styles.eventImage} />

            {/* Overlay with gradient */}
            <LinearGradient
              colors={['transparent', '#0a0a0a']}
              style={styles.eventOverlay}
            >
              <View style={styles.eventStatus}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(event.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
                  {getStatusLabel(event.status)}
                </Text>
              </View>

              <View style={styles.eventBottomContent}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date} {event.month}</Text>
                </View>

                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    console.log('Share event', event.id);
                  }}
                >
                  <Ionicons name="share-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
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
  // Event card styles
  eventCard: {
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  eventOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventBottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 22,
  },
  eventDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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