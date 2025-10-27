import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Typography } from '../../../constants/fonts';
import { ApiService } from '../../../lib/api';
import { LineChart } from 'react-native-chart-kit';
import { Animated } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const { width: screenWidth } = Dimensions.get('window');


interface SalesStats {
  totalSales: number;
  cashSales: number;
  linkSales: number;
  ticketsSold: number;
  commission: number;
}


export default function DashboardScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState(0);

 // 0: 7 días, 1: 30 días, 2: 3 meses, 3: 6 meses, 4: YTD
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalSales: 1250000,
    cashSales: 896000,
    linkSales: 354000,
    ticketsSold: 127,
    commission: 125000,
  });


  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (session?.accessToken) {
        // Here you would load real data from API
        // const salesData = await ApiService.getSalesStats(session.accessToken);
        // setSalesStats(salesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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

  const formatYAxisLabel = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value}`;
    }
  };


  const handleTimeFilterChange = (selectedIndex: number) => {
    Haptics.selectionAsync();
    setSelectedTimeFilter(selectedIndex);
  };

  const getChartData = () => {
    const baseData = {
      7: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          data: [45000, 78000, 125000, 89000, 156000, 203000, 189000],
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 3
        }]
      },
      30: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        datasets: [{
          data: [320000, 450000, 380000, 520000],
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 3
        }]
      },
      90: {
        labels: ['Ene', 'Feb', 'Mar'],
        datasets: [{
          data: [850000, 1200000, 980000],
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 3
        }]
      },
      180: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          data: [1200000, 1450000, 1680000, 1850000, 2100000, 1950000],
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 3
        }]
      },
      365: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          data: [850000, 1200000, 1450000, 1680000],
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          strokeWidth: 3
        }]
      }
    };

    const periods = [7, 30, 90, 180, 365];
    return baseData[periods[selectedTimeFilter] as keyof typeof baseData];
  };

  // Constants for consistent sizing
  const CHART_CONTAINER_WIDTH = screenWidth - 60; // Full width with minimal margins


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
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
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
        {/* Header Stats Cards */}
        <View style={styles.headerStatsContainer}>
          {/* Sales Chart Card - Completely rebuilt */}
          <View style={styles.salesChartCard}>
            {/* Header Section */}
            <View style={styles.salesHeader}>
              <View style={styles.salesIconContainer}>
                <Ionicons name="trending-up" size={24} color="#34C759" />
              </View>
              <View style={styles.salesInfoContainer}>
                <Text style={styles.salesValue}>{formatCurrency(salesStats.totalSales)}</Text>
                <Text style={styles.salesLabel}>Ingresos Totales</Text>
                <Text style={styles.salesSubtext}>{salesStats.ticketsSold} tickets vendidos</Text>
              </View>
              <View style={styles.salesGrowthIndicator}>
                <Text style={styles.salesGrowthText}>+15.6%</Text>
              </View>
            </View>

            {/* Chart Section */}
            <View style={styles.chartSection}>
              <View style={styles.chartWrapper}>
                <LineChart
                  data={getChartData()}
                  width={CHART_CONTAINER_WIDTH}
                  height={260}
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundGradientFrom: 'rgba(0,0,0,0)',
                    backgroundGradientTo: 'rgba(0,0,0,0)',
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientToOpacity: 0,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
                    style: {
                      borderRadius: 0,
                    },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#34C759"
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: "0",
                      stroke: "rgba(255, 255, 255, 0.1)",
                      strokeWidth: 1
                    },
                    fillShadowGradient: '#34C759',
                    fillShadowGradientFrom: '#34C759',
                    fillShadowGradientTo: 'rgba(52, 199, 89, 0.1)',
                    fillShadowGradientOpacity: 0.4,
                    useShadowColorFromDataset: false,
                  }}
                  bezier
                  withDots={true}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withShadow={true}
                  withAreaChart={true}
                  transparent={true}
                  getDotColor={() => '#34C759'}
                  segments={getChartData().datasets[0].data.length - 1}
                  horizontalLabelRotation={0}
                  verticalLabelRotation={0}
                  fromZero={true}
                  style={{
                    borderRadius: 0,
                    backgroundColor: 'transparent',
                  }}
                  formatYLabel={(value) => formatYAxisLabel(parseFloat(value))}
                  onDataPointClick={(data, index) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                />
              </View>
            </View>

            {/* Filter Section */}
            <View style={styles.filterSection}>
              <SegmentedControl
                values={['7D', '1M', '3M', '6M', 'YTD']}
                selectedIndex={selectedTimeFilter}
                onChange={(event) => {
                  handleTimeFilterChange(event.nativeEvent.selectedSegmentIndex);
                }}
                style={styles.chartSegmentedControl}
                tintColor="rgba(255, 255, 255, 0.2)"
                backgroundColor="transparent"
                fontStyle={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                activeFontStyle={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}
              />
            </View>
          </View>

          {/* Enhanced KPI Grid */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiLabel}>Efectivo</Text>
                <View style={styles.kpiIndicator} />
              </View>
              <Text style={styles.kpiValue}>{formatCurrency(salesStats.cashSales)}</Text>
              <Text style={styles.kpiChange}>+12% vs mes anterior</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiLabel}>Link Web</Text>
                <View style={styles.kpiIndicator} />
              </View>
              <Text style={styles.kpiValue}>{formatCurrency(salesStats.linkSales)}</Text>
              <Text style={styles.kpiChange}>+8% vs mes anterior</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiLabel}>Comisión</Text>
                <View style={styles.kpiIndicator} />
              </View>
              <Text style={styles.kpiValue}>{formatCurrency(salesStats.commission)}</Text>
              <Text style={styles.kpiChange}>+15% vs mes anterior</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiLabel}>Tickets</Text>
                <View style={styles.kpiIndicator} />
              </View>
              <Text style={styles.kpiValue}>{salesStats.ticketsSold}</Text>
              <Text style={styles.kpiChange}>+5% vs mes anterior</Text>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="flash" size={18} color="#FF3B30" />
                <Text style={styles.metricTitle}>Conversión</Text>
              </View>
              <Text style={styles.metricValue}>85%</Text>
              <Text style={styles.metricTrend}>+5% vs mes anterior</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="calendar" size={18} color="#FF9500" />
                <Text style={styles.metricTitle}>Días Activos</Text>
              </View>
              <Text style={styles.metricValue}>7</Text>
              <Text style={styles.metricTrend}>Esta semana</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="people" size={18} color="#007AFF" />
                <Text style={styles.metricTitle}>Clientes</Text>
              </View>
              <Text style={styles.metricValue}>124</Text>
              <Text style={styles.metricTrend}>+12 nuevos</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="star" size={18} color="#34C759" />
                <Text style={styles.metricTitle}>Rating</Text>
              </View>
              <Text style={styles.metricValue}>4.8</Text>
              <Text style={styles.metricTrend}>Muy bueno</Text>
            </View>
          </View>
        </View>


        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSalesOption('cash')}
          >
            <GlassView
              tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="cash" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Venta Efectivo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSalesOption('link')}
          >
            <GlassView
              tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="link" size={24} color="#ffffff" />
            <Text style={styles.actionButtonText}>Generar Link</Text>
          </TouchableOpacity>
        </View>

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

  // Header Stats
  headerStatsContainer: {
    marginBottom: 32,
  },

  // New Sales Chart Card Structure
  salesChartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },

  // Header Section
  salesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  salesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  salesInfoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  salesValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.headline,
  },
  salesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    ...Typography.body,
  },
  salesSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    ...Typography.body,
  },
  salesGrowthIndicator: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  salesGrowthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    ...Typography.body,
  },

  // Chart Section
  chartSection: {
    marginBottom: 20,
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  // Filter Section
  filterSection: {
    width: '100%',
  },
  chartSegmentedControl: {
    width: '100%',
    height: 40,
  },
  mainStatCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainStatContent: {
    // Content styling
  },
  mainStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthIndicator: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  growthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    ...Typography.body,
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    ...Typography.largeTitle,
  },
  mainStatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    ...Typography.headline,
  },
  mainStatSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    ...Typography.subheadline,
  },
  mainStatChart: {
    marginTop: 24,
    alignItems: 'flex-start',
    width: '100%',
  },
  mainStatFilterContainer: {
    marginTop: 20,
    width: '100%',
  },
  mainStatSegmentedControl: {
    height: 36,
    width: '100%',
  },

  // Stats Grid
  // Simple KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  kpiIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  kpiLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    ...Typography.body,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    ...Typography.headline,
  },
  kpiChange: {
    fontSize: 12,
    fontWeight: '500',
    color: '#34C759',
    ...Typography.caption1,
  },

  // Metrics Section
  metricsContainer: {
    marginBottom: 32,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    ...Typography.subheadline,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.title2,
  },
  metricTrend: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    ...Typography.caption2,
  },


  // Tooltip
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    ...Typography.caption1,
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
    marginBottom: 2,
    ...Typography.headline,
  },
  tooltipSubtext: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    ...Typography.caption2,
  },

  // Sections
  sectionTitle: {
    fontSize: 20,
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
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
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

  // Sales Section
  salesCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  salesCardContent: {
    padding: 20,
  },
  salesRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  salesMetric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  salesMetricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  salesMetricInfo: {
    flex: 1,
  },
  salesMetricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  salesMetricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
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
});