import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useProducerId } from './_layout';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Typography } from '../../../constants/fonts';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    growth: number;
  };
  events: {
    totalEvents: number;
    upcomingEvents: number;
    totalTickets: number;
    revenue: number;
  };
  demographics: {
    ageGroups: { range: string; percentage: number; count: number }[];
    genders: { type: string; percentage: number; count: number }[];
    topCities: { city: string; percentage: number; count: number }[];
  };
  engagement: {
    averageSessionTime: string;
    bounceRate: number;
    conversionRate: number;
    repeatVisitors: number;
  };
}

export default function ProducerAnalyticsScreen() {
  const id = useProducerId();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { session } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [id, selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 24680,
          activeUsers: 18420,
          newUsers: 3240,
          growth: 15.6,
        },
        events: {
          totalEvents: 42,
          upcomingEvents: 12,
          totalTickets: 8650,
          revenue: 284500,
        },
        demographics: {
          ageGroups: [
            { range: '18-24', percentage: 38, count: 9378 },
            { range: '25-34', percentage: 41, count: 10119 },
            { range: '35-44', percentage: 16, count: 3949 },
            { range: '45+', percentage: 5, count: 1234 },
          ],
          genders: [
            { type: 'Femenino', percentage: 62, count: 15302 },
            { type: 'Masculino', percentage: 36, count: 8885 },
            { type: 'Otro', percentage: 2, count: 493 },
          ],
          topCities: [
            { city: 'Bogotá', percentage: 48, count: 11846 },
            { city: 'Medellín', percentage: 26, count: 6417 },
            { city: 'Cali', percentage: 16, count: 3949 },
            { city: 'Barranquilla', percentage: 10, count: 2468 },
          ],
        },
        engagement: {
          averageSessionTime: '8:42',
          bounceRate: 28.5,
          conversionRate: 16.8,
          repeatVisitors: 72.3,
        },
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  const PeriodSelector = () => {
    const periods = ['7 días', '30 días', '3 meses'];
    const periodKeys: ('week' | 'month' | 'quarter')[] = ['week', 'month', 'quarter'];
    const selectedIndex = periodKeys.indexOf(selectedPeriod);

    return (
      <View style={styles.periodSelector}>
        <SegmentedControl
          values={periods}
          selectedIndex={selectedIndex}
          onChange={(event) => {
            const index = event.nativeEvent.selectedSegmentIndex;
            setSelectedPeriod(periodKeys[index]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={styles.segmentedControl}
        />
      </View>
    );
  };

  const OverviewSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="analytics" size={20} color="rgba(255, 255, 255, 0.8)" />
        <Text style={styles.sectionTitle}>Resumen General</Text>
      </View>

      <View style={styles.overviewGrid}>
        <View style={styles.primaryMetricCard}>
          <View style={styles.primaryMetricContent}>
            <View style={styles.primaryMetricHeader}>
              <View style={styles.primaryMetricIconContainer}>
                <Ionicons name="people" size={28} color="#ffffff" />
              </View>
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={14} color="#34C759" />
                <Text style={styles.growthText}>+{analyticsData?.overview.growth}%</Text>
              </View>
            </View>
            <Text style={styles.primaryMetricValue}>
              {formatNumber(analyticsData?.overview.totalUsers || 0)}
            </Text>
            <Text style={styles.primaryMetricLabel}>Total de usuarios</Text>
            <Text style={styles.primaryMetricSubtext}>
              {formatNumber(analyticsData?.overview.newUsers || 0)} nuevos este período
            </Text>
          </View>
        </View>

        <View style={styles.secondaryMetricsContainer}>
          <View style={styles.secondaryMetricCard}>
            <View style={styles.secondaryMetricContent}>
              <Ionicons name="pulse" size={20} color="rgba(52, 199, 89, 0.8)" />
              <Text style={styles.secondaryMetricValue}>
                {formatNumber(analyticsData?.overview.activeUsers || 0)}
              </Text>
              <Text style={styles.secondaryMetricLabel}>Usuarios activos</Text>
            </View>
          </View>

          <View style={styles.secondaryMetricCard}>
            <View style={styles.secondaryMetricContent}>
              <Ionicons name="person-add" size={20} color="rgba(255, 149, 0, 0.8)" />
              <Text style={styles.secondaryMetricValue}>
                {formatNumber(analyticsData?.overview.newUsers || 0)}
              </Text>
              <Text style={styles.secondaryMetricLabel}>Nuevos usuarios</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const EventsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="calendar" size={20} color="rgba(255, 255, 255, 0.8)" />
        <Text style={styles.sectionTitle}>Eventos y Ventas</Text>
      </View>

      <View style={styles.eventsCard}>
        <View style={styles.eventsCardContent}>
          <View style={styles.eventsRow}>
            <View style={styles.eventMetric}>
              <View style={styles.eventMetricIconContainer}>
                <Ionicons name="calendar-outline" size={18} color="rgba(88, 86, 214, 0.8)" />
              </View>
              <View style={styles.eventMetricInfo}>
                <Text style={styles.eventMetricValue}>{analyticsData?.events.totalEvents}</Text>
                <Text style={styles.eventMetricLabel}>Total eventos</Text>
              </View>
            </View>

            <View style={styles.eventMetric}>
              <View style={styles.eventMetricIconContainer}>
                <Ionicons name="time-outline" size={18} color="rgba(255, 149, 0, 0.8)" />
              </View>
              <View style={styles.eventMetricInfo}>
                <Text style={styles.eventMetricValue}>{analyticsData?.events.upcomingEvents}</Text>
                <Text style={styles.eventMetricLabel}>Próximos</Text>
              </View>
            </View>
          </View>

          <View style={styles.eventsRow}>
            <View style={styles.eventMetric}>
              <View style={styles.eventMetricIconContainer}>
                <Ionicons name="ticket-outline" size={18} color="rgba(0, 122, 255, 0.8)" />
              </View>
              <View style={styles.eventMetricInfo}>
                <Text style={styles.eventMetricValue}>
                  {formatNumber(analyticsData?.events.totalTickets || 0)}
                </Text>
                <Text style={styles.eventMetricLabel}>Tickets vendidos</Text>
              </View>
            </View>

            <View style={styles.eventMetric}>
              <View style={styles.eventMetricIconContainer}>
                <Ionicons name="cash-outline" size={18} color="rgba(52, 199, 89, 0.8)" />
              </View>
              <View style={styles.eventMetricInfo}>
                <Text style={styles.eventMetricValue}>
                  {formatCurrency(analyticsData?.events.revenue || 0)}
                </Text>
                <Text style={styles.eventMetricLabel}>Ingresos totales</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const DemographicsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="people-circle" size={20} color="rgba(255, 255, 255, 0.8)" />
        <Text style={styles.sectionTitle}>Demografía del Público</Text>
      </View>

      {/* Demographics Grid */}
      <View style={styles.demographicsGrid}>
        {/* Age Groups Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="person" size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.chartTitle}>Grupos de edad</Text>
          </View>
          <View style={styles.chartContainer}>
            <View style={styles.donutChart}>
              {analyticsData?.demographics.ageGroups.map((group, index) => {
                const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30'];
                const color = colors[index % colors.length];
                return (
                  <View key={index} style={styles.chartSegment}>
                    <View style={[styles.chartDot, { backgroundColor: color }]} />
                    <View style={styles.chartLegend}>
                      <Text style={styles.chartLegendLabel}>{group.range}</Text>
                      <Text style={styles.chartLegendValue}>{group.percentage}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Gender Distribution Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="people" size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.chartTitle}>Distribución por género</Text>
          </View>
          <View style={styles.chartContainer}>
            <View style={styles.donutChart}>
              {analyticsData?.demographics.genders.map((gender, index) => {
                const colors = ['#AF52DE', '#007AFF', '#FF9500'];
                const color = colors[index % colors.length];
                return (
                  <View key={index} style={styles.chartSegment}>
                    <View style={[styles.chartDot, { backgroundColor: color }]} />
                    <View style={styles.chartLegend}>
                      <Text style={styles.chartLegendLabel}>{gender.type}</Text>
                      <Text style={styles.chartLegendValue}>{gender.percentage}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>

    </View>
  );


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
          <Text style={styles.loadingText}>Cargando analíticas...</Text>
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
        <PeriodSelector />
        <OverviewSection />
        <EventsSection />
        <DemographicsSection />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function createStyles(theme: Theme, insets: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...Typography.body,
      color: '#ffffff',
      marginTop: 16,
    },

    // ScrollView
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: insets.top + 80,
      paddingBottom: insets.bottom + 100,
    },

    // Period Selector
    periodSelector: {
      marginBottom: 24,
    },
    segmentedControl: {
      height: 36,
      width: '100%',
    },

    // Sections
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#ffffff',
    },

    // Overview Section
    overviewGrid: {
      gap: 12,
    },
    primaryMetricCard: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    primaryMetricContent: {
      padding: 24,
    },
    primaryMetricHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    primaryMetricIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 122, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    growthBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(52, 199, 89, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    growthText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#34C759',
    },
    primaryMetricValue: {
      fontSize: 36,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 4,
    },
    primaryMetricLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 8,
    },
    primaryMetricSubtext: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.6)',
    },

    secondaryMetricsContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    secondaryMetricCard: {
      flex: 1,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    secondaryMetricContent: {
      padding: 16,
      alignItems: 'center',
    },
    secondaryMetricValue: {
      fontSize: 20,
      fontWeight: '700',
      color: '#ffffff',
      marginTop: 8,
      marginBottom: 4,
    },
    secondaryMetricLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
    },

    // Events Section
    eventsCard: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    eventsCardContent: {
      padding: 20,
    },
    eventsRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    eventMetric: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    eventMetricIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    eventMetricInfo: {
      flex: 1,
    },
    eventMetricValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 2,
    },
    eventMetricLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.7)',
    },

    // Demographics Section
    demographicsGrid: {
      gap: 16,
    },
    chartCard: {
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    chartHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingBottom: 12,
      gap: 8,
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    chartContainer: {
      padding: 16,
      paddingTop: 4,
    },
    donutChart: {
      gap: 12,
    },
    chartSegment: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    chartDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    chartLegend: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chartLegendLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: '#ffffff',
    },
    chartLegendValue: {
      fontSize: 14,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.8)',
    },

  });
}