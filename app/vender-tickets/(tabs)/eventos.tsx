import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Typography } from '../../../constants/fonts';
import { ApiService, PromoterEvent, PromoterEventsResponse, PaginationInfo } from '../../../lib/api';

const { width } = Dimensions.get('window');

interface EventDisplay {
  id: string;
  name: string;
  venue: string;
  date: string;
  time: string;
  image: string;
  status: 'active' | 'upcoming' | 'ended';
  salesEnabled: boolean;
  tickets_sold: number;
  total_revenue: number;
  cash_revenue: number;
  web_revenue: number;
}

export default function EventosScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeEventsPage, setActiveEventsPage] = useState(1);
  const [pastEventsPage, setPastEventsPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [filteredActiveEvents, setFilteredActiveEvents] = useState<EventDisplay[]>([]);
  const [filteredPastEvents, setFilteredPastEvents] = useState<EventDisplay[]>([]);

  const [activeEvents, setActiveEvents] = useState<EventDisplay[]>([]);
  const [pastEvents, setPastEvents] = useState<EventDisplay[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    loadData();
    updateNavigationOptions();
  }, []);

  useEffect(() => {
    if (params.q) {
      setSearchQuery(params.q as string);
    }
  }, [params.q]);

  // Filter events when search query or events change
  useEffect(() => {
    const filterEvents = (events: EventDisplay[]) => {
      if (!searchQuery.trim()) {
        return events;
      }

      const query = searchQuery.toLowerCase().trim();
      return events.filter(event =>
        event.name.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        new Date(event.date).toLocaleDateString('es-ES').includes(query)
      );
    };

    setFilteredActiveEvents(filterEvents(activeEvents));
    setFilteredPastEvents(filterEvents(pastEvents));
  }, [searchQuery, activeEvents, pastEvents]);

  const updateNavigationOptions = () => {
    const optionsWithSearch = {
      title: 'Eventos',
      headerShown: true,
      headerStyle: {
        backgroundColor: 'transparent',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 18,
      },
      headerTransparent: true,
      headerBlurEffect: 'systemUltraThinMaterialDark',
      headerBackTitle: '',
      headerBackTitleVisible: false,
      headerSearchBarOptions: Platform.OS === 'ios' ? {
        placeholder: 'Buscar eventos...',
        hideWhenScrolling: false,
        autoCapitalize: 'none',
      } : undefined,
    };

    navigation.setOptions(optionsWithSearch);
  };

  const loadData = async (resetData: boolean = true, loadMoreActive: boolean = false, loadMorePast: boolean = false) => {
    try {
      console.log('🎬 Starting loadData in eventos...', { resetData, loadMoreActive, loadMorePast });

      if (resetData) {
        setLoading(true);
        setEventsLoading(true);
        setActiveEventsPage(1);
        setPastEventsPage(1);
      } else {
        setLoadingMore(true);
      }

      console.log('🔐 Session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.accessToken,
        tokenPreview: session?.accessToken ? `${session.accessToken.substring(0, 20)}...` : 'No token'
      });

      if (!session?.accessToken) {
        console.error('❌ No access token available');
        throw new Error('Token de autenticación no disponible');
      }

      // Determine which page to load
      let currentPage = 1;
      if (loadMoreActive) {
        currentPage = activeEventsPage + 1;
      } else if (loadMorePast) {
        currentPage = pastEventsPage + 1;
      } else {
        currentPage = 1; // First load
      }

      console.log('📞 Calling ApiService.getPromoterEventsHistory...');

      // Load promoter events from API with pagination
      const eventsResponse = await ApiService.getPromoterEventsHistory(
        session.accessToken,
        true, // Enable pagination
        currentPage,
        10 // Limit per page
      );

      console.log('📦 Events response received:', {
        hasResponse: !!eventsResponse,
        success: eventsResponse?.success,
        activeEventsCount: eventsResponse?.active_events?.length || 0,
        pastEventsCount: eventsResponse?.past_events?.length || 0,
        paginationInfo: eventsResponse?.pagination
      });

      if (eventsResponse.success) {
        console.log('✅ Response marked as successful, transforming data...');

        // Store pagination info
        if (eventsResponse.pagination) {
          setPaginationInfo(eventsResponse.pagination);
        }

        // Transform API data to display format
        const transformedActiveEvents: EventDisplay[] = eventsResponse.active_events.map((event) => ({
          id: event.event_id,
          name: event.event_name,
          venue: 'Venue', // Default venue since API doesn't provide it
          date: event.event_date,
          time: new Date(event.event_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }),
          image: event.event_flyer || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop',
          status: 'active' as const,
          salesEnabled: true,
          tickets_sold: event.tickets_sold,
          total_revenue: event.total_revenue,
          cash_revenue: event.cash_revenue || 0,
          web_revenue: event.web_revenue || 0,
        }));

        const transformedPastEvents: EventDisplay[] = eventsResponse.past_events.map((event) => ({
          id: event.event_id,
          name: event.event_name,
          venue: 'Venue', // Default venue since API doesn't provide it
          date: event.event_date,
          time: new Date(event.event_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }),
          image: event.event_flyer || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop',
          status: 'ended' as const,
          salesEnabled: false,
          tickets_sold: event.tickets_sold,
          total_revenue: event.total_revenue,
          cash_revenue: event.cash_revenue || 0,
          web_revenue: event.web_revenue || 0,
        }));

        // Handle event state based on load type
        if (resetData) {
          // Fresh load - replace all events
          setActiveEvents(transformedActiveEvents);
          setPastEvents(transformedPastEvents);
          setActiveEventsPage(1);
          setPastEventsPage(1);
        } else if (loadMoreActive) {
          // Load more active events - append to existing
          setActiveEvents(prev => [...prev, ...transformedActiveEvents]);
          setActiveEventsPage(currentPage);
        } else if (loadMorePast) {
          // Load more past events - append to existing
          setPastEvents(prev => [...prev, ...transformedPastEvents]);
          setPastEventsPage(currentPage);
        }

        console.log('✅ Data loading completed successfully');
      } else {
        console.warn('⚠️ API response success is false');
        Alert.alert('Advertencia', 'La respuesta del servidor indica un problema');
      }

    } catch (error) {
      console.error('💥 Error in loadData:', error);
      Alert.alert('Error', `No se pudieron cargar los eventos: ${error.message}`);
    } finally {
      console.log('🏁 Finishing loadData, updating loading states...');
      if (resetData) {
        setLoading(false);
        setEventsLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(true); // Reset data on refresh
    setRefreshing(false);
  };

  // Load more functions
  const loadMoreActiveEvents = async () => {
    if (paginationInfo && activeEventsPage < paginationInfo.active_pages && !loadingMore) {
      await loadData(false, true, false);
    }
  };

  const loadMorePastEvents = async () => {
    if (paginationInfo && pastEventsPage < paginationInfo.past_pages && !loadingMore) {
      await loadData(false, false, true);
    }
  };

  const handleEventPress = (event: EventDisplay) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!event.salesEnabled) {
      Alert.alert('Ventas no disponibles', 'Las ventas para este evento no están habilitadas');
      return;
    }

    // Navigate to event sales screen
    router.push(`/vender-tickets/${event.id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Render event card component
  const renderEventCard = ({ item: event, index }: { item: EventDisplay; index: number }) => {
    const isActiveEvent = event.status === 'active';
    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => {
          if (isActiveEvent) {
            handleEventPress(event);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Evento Finalizado', `Este evento ya finalizó.\n\n🎫 Tickets vendidos: ${event.tickets_sold}\n💵 Ventas en efectivo: ${formatCurrency(event.cash_revenue)}\n🔗 Ventas web: ${formatCurrency(event.web_revenue)}\n💰 Total: ${formatCurrency(event.total_revenue)}`);
          }
        }}
        activeOpacity={0.8}
      >
        {/* Background Hero Image */}
        <Image
          source={{ uri: event.image }}
          style={styles.heroBackgroundImage}
          resizeMode="cover"
        />

        {/* Dark Overlay */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Glassmorphism Content Card */}
        <View style={styles.heroContentContainer}>
          <GlassView
            glassEffectStyle="regular"
            tintColor="rgba(0,0,0,0.3)"
            style={styles.heroGlassCard}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <Text style={styles.heroEventName}>{event.name}</Text>
              <Text style={styles.heroEventDateTime}>
                {new Date(event.date).toLocaleDateString('es-ES')} • {event.time}
              </Text>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>{event.tickets_sold}</Text>
                <Text style={styles.heroStatLabel}>Tickets</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>{formatCurrency(event.cash_revenue)}</Text>
                <Text style={styles.heroStatLabel}>💵 Efectivo</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatNumber}>{formatCurrency(event.web_revenue)}</Text>
                <Text style={styles.heroStatLabel}>🔗 Web</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Footer loading component
  const renderListFooter = (isLoading: boolean) => {
    if (!isLoading) return null;
    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color="#ffffff" />
        <Text style={styles.listFooterText}>Cargando más eventos...</Text>
      </View>
    );
  };

  const styles = createStyles(theme, insets);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.gradientOverlay}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            titleColor="#ffffff"
          />
        }
      >
        {eventsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Cargando eventos...</Text>
          </View>
        ) : (
          <>
            {/* Active Events Section with Infinite Scroll */}
            {(searchQuery ? filteredActiveEvents.length > 0 : activeEvents.length > 0) && (
              <>
                <Text style={styles.sectionTitle}>
                  Eventos Activos {searchQuery && `(${filteredActiveEvents.length})`}
                </Text>
                <FlatList
                  data={searchQuery ? filteredActiveEvents : activeEvents}
                  renderItem={renderEventCard}
                  keyExtractor={(item) => item.id}
                  onEndReached={() => {
                    if (!searchQuery && paginationInfo && activeEventsPage < paginationInfo.active_pages && !loadingMore) {
                      loadMoreActiveEvents();
                    }
                  }}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={() => renderListFooter(!searchQuery && loadingMore && paginationInfo && activeEventsPage < paginationInfo.active_pages)}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                />
              </>
            )}

            {/* Past Events Section with Infinite Scroll */}
            {(searchQuery ? filteredPastEvents.length > 0 : pastEvents.length > 0) && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
                  Eventos Pasados {searchQuery && `(${filteredPastEvents.length})`}
                </Text>
                <FlatList
                  data={searchQuery ? filteredPastEvents : pastEvents}
                  renderItem={renderEventCard}
                  keyExtractor={(item) => item.id}
                  onEndReached={() => {
                    if (!searchQuery && paginationInfo && pastEventsPage < paginationInfo.past_pages && !loadingMore) {
                      loadMorePastEvents();
                    }
                  }}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={() => renderListFooter(!searchQuery && loadingMore && paginationInfo && pastEventsPage < paginationInfo.past_pages)}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                />
              </>
            )}

            {/* Empty State */}
            {searchQuery ? (
              // Search empty state
              filteredActiveEvents.length === 0 && filteredPastEvents.length === 0 && (
                <View style={styles.emptyState}>
                  <GlassView
                    tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons name="search-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
                  <Text style={styles.emptyTitle}>No se encontraron eventos</Text>
                  <Text style={styles.emptySubtitle}>Intenta con una búsqueda diferente o revisa la ortografía</Text>
                </View>
              )
            ) : (
              // Default empty state
              activeEvents.length === 0 && pastEvents.length === 0 && (
                <View style={styles.emptyState}>
                  <GlassView
                    tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons name="calendar-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
                  <Text style={styles.emptyTitle}>No hay eventos disponibles</Text>
                  <Text style={styles.emptySubtitle}>Los eventos aparecerán aquí cuando estén disponibles para la venta</Text>
                </View>
              )
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
    ...Typography.body,
  },
  scrollView: {
    flex: 1,
    paddingTop: insets.top + 60,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: insets.bottom + 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    ...Typography.title2,
  },
  eventCard: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  heroContentContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroGlassCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  heroContent: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
  },
  heroHeader: {
    marginBottom: 12,
  },
  heroEventName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...Typography.headline,
  },
  heroEventDateTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...Typography.body,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...Typography.subheadline,
  },
  heroStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...Typography.caption,
  },
  heroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
    marginBottom: 8,
    ...Typography.title3,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
    ...Typography.body,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  listFooterText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    ...Typography.body,
  },
});