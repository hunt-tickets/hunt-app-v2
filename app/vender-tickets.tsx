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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Typography } from '../constants/fonts';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, G, Text as SvgText } from 'react-native-svg';
import { ApiService, PromoterEvent, PromoterEventsResponse, PaginationInfo } from '../lib/api';

const { width, height } = Dimensions.get('window');

interface SalesStats {
  totalSales: number;
  cashSales: number;
  linkSales: number;
  ticketsSold: number;
  commission: number;
}

interface SalesTrendData {
  date: string;
  sales: number;
  tickets: number;
}

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

export default function VenderTicketsScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  // Pagination state
  const [activeEventsPage, setActiveEventsPage] = useState(1);
  const [pastEventsPage, setPastEventsPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState((params.q as string) || '');
  const [filteredActiveEvents, setFilteredActiveEvents] = useState<EventDisplay[]>([]);
  const [filteredPastEvents, setFilteredPastEvents] = useState<EventDisplay[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalSales: 1250000,
    cashSales: 896000,
    linkSales: 354000,
    ticketsSold: 127,
    commission: 125000,
  });

  const [salesTrend, setSalesTrend] = useState<SalesTrendData[]>([
    { date: '10/05', sales: 45000, tickets: 8 },
    { date: '10/06', sales: 78000, tickets: 12 },
    { date: '10/07', sales: 125000, tickets: 18 },
    { date: '10/08', sales: 89000, tickets: 14 },
    { date: '10/09', sales: 156000, tickets: 22 },
    { date: '10/10', sales: 203000, tickets: 28 },
    { date: '10/11', sales: 189000, tickets: 25 },
  ]);

  const [activeEvents, setActiveEvents] = useState<EventDisplay[]>([]);
  const [pastEvents, setPastEvents] = useState<EventDisplay[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    loadData();
    // Set initial navigation options
    updateNavigationOptions(selectedTab);
  }, []);

  // Update navigation options when tab changes
  useEffect(() => {
    updateNavigationOptions(selectedTab);
    // Clear search when leaving Events tab
    if (selectedTab !== 1) {
      setSearchQuery('');
    }
  }, [selectedTab]);

  const updateNavigationOptions = (tabIndex: number) => {
    const baseOptions = {
      title: 'Vender Tickets',
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
    };

    // Only show search bar in Events tab (index 1)
    const optionsWithSearch = {
      ...baseOptions,
      headerSearchBarOptions: Platform.OS === 'ios' ? {
        placeholder: 'Buscar eventos...',
        hideWhenScrolling: false,
        autoCapitalize: 'none',
      } : undefined,
    };

    navigation.setOptions(tabIndex === 1 ? optionsWithSearch : baseOptions);
  };

  // Handle search from native search bar
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

  const loadData = async (resetData: boolean = true, loadMoreActive: boolean = false, loadMorePast: boolean = false) => {
    try {
      console.log('🎬 Starting loadData in vender-tickets...', { resetData, loadMoreActive, loadMorePast });

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

      console.log('📞 Calling ApiService.getPromoterEventsHistory...', {
        paginate: true,
        page: currentPage,
        loadMoreActive,
        loadMorePast,
        resetData
      });

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
        console.log('🔄 Transforming active events...');
        const transformedActiveEvents: EventDisplay[] = eventsResponse.active_events.map((event, index) => {
          console.log(`📝 Transforming active event ${index + 1}:`, event);
          return {
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
          };
        });

        console.log('🔄 Transforming past events...');
        const transformedPastEvents: EventDisplay[] = eventsResponse.past_events.map((event, index) => {
          console.log(`📝 Transforming past event ${index + 1}:`, event);
          return {
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
          };
        });

        console.log('💾 Setting events in state:', {
          activeEvents: transformedActiveEvents.length,
          pastEvents: transformedPastEvents.length,
          resetData,
          loadMoreActive,
          loadMorePast
        });

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

        // Calculate total sales stats from all events
        // For fresh loads, calculate from new data. For load more, add to existing stats
        if (resetData) {
          const allEvents = [...transformedActiveEvents, ...transformedPastEvents];

          const totalTickets = allEvents.reduce((sum, event) => sum + event.tickets_sold, 0);
          const totalRevenue = allEvents.reduce((sum, event) => sum + event.total_revenue, 0);
          const totalCashRevenue = allEvents.reduce((sum, event) => sum + event.cash_revenue, 0);
          const totalWebRevenue = allEvents.reduce((sum, event) => sum + event.web_revenue, 0);
          const totalCommission = totalRevenue * 0.1;

          console.log('📊 Calculated fresh totals:', {
            totalTickets,
            totalRevenue,
            totalCashRevenue,
            totalWebRevenue,
            totalCommission
          });

          setSalesStats({
            totalSales: totalRevenue,
            cashSales: totalCashRevenue,
            linkSales: totalWebRevenue,
            ticketsSold: totalTickets,
            commission: totalCommission,
          });
        } else {
          // For load more, add new events to existing stats
          const newEvents = loadMoreActive ? transformedActiveEvents : transformedPastEvents;
          const additionalTickets = newEvents.reduce((sum, event) => sum + event.tickets_sold, 0);
          const additionalRevenue = newEvents.reduce((sum, event) => sum + event.total_revenue, 0);
          const additionalCashRevenue = newEvents.reduce((sum, event) => sum + event.cash_revenue, 0);
          const additionalWebRevenue = newEvents.reduce((sum, event) => sum + event.web_revenue, 0);

          setSalesStats(prev => {
            const newTotalRevenue = prev.totalSales + additionalRevenue;
            return {
              totalSales: newTotalRevenue,
              cashSales: prev.cashSales + additionalCashRevenue,
              linkSales: prev.linkSales + additionalWebRevenue,
              ticketsSold: prev.ticketsSold + additionalTickets,
              commission: newTotalRevenue * 0.1,
            };
          });

          console.log('📊 Added to existing stats:', {
            additionalTickets,
            additionalRevenue,
            additionalCashRevenue,
            additionalWebRevenue
          });
        }

        console.log('✅ Data loading completed successfully');
      } else {
        console.warn('⚠️ API response success is false');
        Alert.alert('Advertencia', 'La respuesta del servidor indica un problema');
      }

    } catch (error) {
      console.error('💥 Error in loadData:', error);
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Error', `No se pudieron cargar los datos de ventas: ${error.message}`);
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
          <BlurView
            intensity={80}
            tint="systemUltraThinMaterialDark"
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

  const handleSalesOption = (type: 'cash' | 'link' | 'list') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    switch (type) {
      case 'cash':
        Alert.alert('Venta en Efectivo', 'Funcionalidad próximamente disponible');
        break;
      case 'link':
        Alert.alert('Venta por Link', 'Funcionalidad próximamente disponible');
        break;
      case 'list':
        Alert.alert('Lista de Ventas', 'Funcionalidad próximamente disponible');
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderSalesTrendChart = () => {
    if (salesTrend.length === 0) return null;

    const chartWidth = width - 80;
    const chartHeight = 200;
    const padding = { top: 20, bottom: 40, left: 20, right: 20 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const maxSales = Math.max(...salesTrend.map(d => d.sales));
    const minSales = Math.min(...salesTrend.map(d => d.sales));
    const salesRange = maxSales - minSales;

    // Generate path for line chart
    const pathData = salesTrend.map((point, index) => {
      const x = padding.left + (index / (salesTrend.length - 1)) * plotWidth;
      const y = padding.top + ((maxSales - point.sales) / salesRange) * plotHeight;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    // Generate path for area fill
    const areaData = `${pathData} L ${padding.left + plotWidth} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`;

    return (
      <View style={styles.trendChartCard}>
        <BlurView
          intensity={40}
          tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Tendencia de Ventas</Text>
          <Text style={styles.chartSubtitle}>Últimos 7 días</Text>
        </View>
        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight} style={styles.lineChart}>
            <Defs>
              <SvgLinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="rgba(52, 199, 89, 0.3)" />
                <Stop offset="100%" stopColor="rgba(52, 199, 89, 0.05)" />
              </SvgLinearGradient>
              <SvgLinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="rgba(52, 199, 89, 1)" />
                <Stop offset="100%" stopColor="rgba(34, 197, 94, 1)" />
              </SvgLinearGradient>
            </Defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((ratio, index) => {
              const y = padding.top + ratio * plotHeight;
              return (
                <Path
                  key={`grid-${index}`}
                  d={`M ${padding.left} ${y} L ${chartWidth - padding.right} ${y}`}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
              );
            })}

            {/* Area fill */}
            <Path
              d={areaData}
              fill="url(#areaGradient)"
            />

            {/* Line */}
            <Path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {salesTrend.map((point, index) => {
              const x = padding.left + (index / (salesTrend.length - 1)) * plotWidth;
              const y = padding.top + ((maxSales - point.sales) / salesRange) * plotHeight;
              return (
                <G key={index}>
                  <Circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="rgba(52, 199, 89, 1)"
                    stroke="rgba(255, 255, 255, 0.8)"
                    strokeWidth="2"
                  />
                  {/* Date labels */}
                  <SvgText
                    x={x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="rgba(255, 255, 255, 0.8)"
                    fontWeight="600"
                  >
                    {point.date}
                  </SvgText>
                </G>
              );
            })}

            {/* Value labels for first and last points */}
            <SvgText
              x={padding.left}
              y={padding.top + ((maxSales - salesTrend[0].sales) / salesRange) * plotHeight - 10}
              textAnchor="start"
              fontSize="12"
              fill="rgba(255, 255, 255, 0.9)"
              fontWeight="700"
            >
              {formatCurrency(salesTrend[0].sales)}
            </SvgText>
            <SvgText
              x={chartWidth - padding.right}
              y={padding.top + ((maxSales - salesTrend[salesTrend.length - 1].sales) / salesRange) * plotHeight - 10}
              textAnchor="end"
              fontSize="12"
              fill="rgba(255, 255, 255, 0.9)"
              fontWeight="700"
            >
              {formatCurrency(salesTrend[salesTrend.length - 1].sales)}
            </SvgText>
          </Svg>
        </View>
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
          <Text style={styles.loadingText}>Cargando datos de ventas...</Text>
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
        {/* Filter Controls */}
        <View style={styles.filterContainer}>
          <SegmentedControl
            values={['Dashboard', 'Eventos', 'Historial']}
            selectedIndex={selectedTab}
            onChange={(event) => {
              const newTabIndex = event.nativeEvent.selectedSegmentIndex;
              setSelectedTab(newTabIndex);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.segmentedControl}
          />

        </View>

        {/* Tab 0: Dashboard */}
        {selectedTab === 0 && (
          <View style={styles.tabContent}>
            {/* Sales Trend Chart */}
            {renderSalesTrendChart()}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.statCardContent}>
                  <Ionicons name="cash" size={28} color="rgba(52, 199, 89, 0.8)" />
                  <Text style={styles.statValue}>{formatCurrency(salesStats.totalSales)}</Text>
                  <Text style={styles.statLabel}>Ventas Totales</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.statCardContent}>
                  <Ionicons name="ticket" size={28} color="rgba(0, 122, 255, 0.8)" />
                  <Text style={styles.statValue}>{salesStats.ticketsSold}</Text>
                  <Text style={styles.statLabel}>Tickets Vendidos</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.statCardContent}>
                  <Ionicons name="wallet" size={28} color="rgba(255, 149, 0, 0.8)" />
                  <Text style={styles.statValue}>{formatCurrency(salesStats.cashSales)}</Text>
                  <Text style={styles.statLabel}>Ventas Efectivo</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.statCardContent}>
                  <Ionicons name="link" size={28} color="rgba(255, 59, 48, 0.8)" />
                  <Text style={styles.statValue}>{formatCurrency(salesStats.linkSales)}</Text>
                  <Text style={styles.statLabel}>Ventas por Link</Text>
                </View>
              </View>
            </View>

            {/* Commission Card */}
            <View style={styles.commissionCard}>
              <BlurView
                intensity={40}
                tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.commissionContent}>
                <View style={styles.commissionHeader}>
                  <Ionicons name="trending-up" size={24} color="rgba(52, 199, 89, 0.8)" />
                  <Text style={styles.commissionTitle}>Comisión Ganada</Text>
                </View>
                <Text style={styles.commissionValue}>{formatCurrency(salesStats.commission)}</Text>
                <Text style={styles.commissionSubtext}>Últimos 30 días</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSalesOption('cash')}
              >
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="cash" size={24} color="#ffffff" />
                <Text style={styles.actionButtonText}>Venta Efectivo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSalesOption('link')}
              >
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="link" size={24} color="#ffffff" />
                <Text style={styles.actionButtonText}>Generar Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tab 1: Eventos */}
        {selectedTab === 1 && (
          <View style={styles.tabContent}>
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
                      <BlurView
                        intensity={40}
                        tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
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
                      <BlurView
                        intensity={40}
                        tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
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
          </View>
        )}

        {/* Tab 2: Historial */}
        {selectedTab === 2 && (
          <View style={styles.tabContent}>
            <View style={styles.historyOptions}>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => handleSalesOption('list')}
              >
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.historyButtonContent}>
                  <Ionicons name="list" size={28} color="#ffffff" />
                  <Text style={styles.historyButtonTitle}>Historial de Ventas</Text>
                  <Text style={styles.historyButtonSubtitle}>Ver todas las transacciones</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.4)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Exportar Datos', 'Funcionalidad próximamente disponible');
                }}
              >
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.historyButtonContent}>
                  <Ionicons name="download" size={28} color="#ffffff" />
                  <Text style={styles.historyButtonTitle}>Exportar Datos</Text>
                  <Text style={styles.historyButtonSubtitle}>Descargar reporte en Excel</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.4)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Comisiones', 'Funcionalidad próximamente disponible');
                }}
              >
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.historyButtonContent}>
                  <Ionicons name="pie-chart" size={28} color="#ffffff" />
                  <Text style={styles.historyButtonTitle}>Detalle de Comisiones</Text>
                  <Text style={styles.historyButtonSubtitle}>Ver ganancias por evento</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.4)" />
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
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
    paddingTop: insets.top + 100, // Space for native header
  },
  contentContainer: {
    paddingBottom: insets.bottom + 100,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  segmentedControl: {
    height: 36,
    width: '100%',
  },
  tabContent: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  trendChartCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  chartHeader: {
    padding: 20,
    paddingBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.headline,
  },
  chartSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    ...Typography.body,
  },
  chartContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  lineChart: {
    // Additional styling can be added here if needed
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statCardContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
    ...Typography.title3,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    ...Typography.caption,
  },
  commissionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  commissionContent: {
    padding: 24,
    alignItems: 'center',
  },
  commissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  commissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    ...Typography.headline,
  },
  commissionValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.largeTitle,
  },
  commissionSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    ...Typography.body,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
    ...Typography.subheadline,
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
  historyOptions: {
    gap: 16,
  },
  historyButton: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyButtonContent: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  historyButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
    ...Typography.subheadline,
  },
  historyButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
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