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
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, G, Text as SvgText } from 'react-native-svg';
import { ApiService } from '../../../lib/api';

const { width } = Dimensions.get('window');

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

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
        <GlassView
          tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
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
        {/* Sales Trend Chart */}
        {renderSalesTrendChart()}

        {/* Resumen General Section */}
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
                    <Ionicons name="cash" size={28} color="#ffffff" />
                  </View>
                  <View style={styles.growthBadge}>
                    <Ionicons name="trending-up" size={14} color="#34C759" />
                    <Text style={styles.growthText}>+15.6%</Text>
                  </View>
                </View>
                <Text style={styles.primaryMetricValue}>
                  {formatCurrency(salesStats.totalSales)}
                </Text>
                <Text style={styles.primaryMetricLabel}>Ventas totales</Text>
                <Text style={styles.primaryMetricSubtext}>
                  {salesStats.ticketsSold} tickets vendidos este período
                </Text>
              </View>
            </View>

            <View style={styles.secondaryMetricsContainer}>
              <View style={styles.secondaryMetricCard}>
                <View style={styles.secondaryMetricContent}>
                  <Ionicons name="wallet" size={20} color="rgba(255, 149, 0, 0.8)" />
                  <Text style={styles.secondaryMetricValue}>
                    {formatCurrency(salesStats.cashSales)}
                  </Text>
                  <Text style={styles.secondaryMetricLabel}>Ventas efectivo</Text>
                </View>
              </View>

              <View style={styles.secondaryMetricCard}>
                <View style={styles.secondaryMetricContent}>
                  <Ionicons name="link" size={20} color="rgba(0, 122, 255, 0.8)" />
                  <Text style={styles.secondaryMetricValue}>
                    {formatCurrency(salesStats.linkSales)}
                  </Text>
                  <Text style={styles.secondaryMetricLabel}>Ventas por link</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Ventas y Comisiones Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.sectionTitle}>Ventas y Comisiones</Text>
          </View>

          <View style={styles.salesCard}>
            <View style={styles.salesCardContent}>
              <View style={styles.salesRow}>
                <View style={styles.salesMetric}>
                  <View style={styles.salesMetricIconContainer}>
                    <Ionicons name="ticket-outline" size={18} color="rgba(52, 199, 89, 0.8)" />
                  </View>
                  <View style={styles.salesMetricInfo}>
                    <Text style={styles.salesMetricValue}>{salesStats.ticketsSold}</Text>
                    <Text style={styles.salesMetricLabel}>Tickets vendidos</Text>
                  </View>
                </View>

                <View style={styles.salesMetric}>
                  <View style={styles.salesMetricIconContainer}>
                    <Ionicons name="trending-up" size={18} color="rgba(0, 122, 255, 0.8)" />
                  </View>
                  <View style={styles.salesMetricInfo}>
                    <Text style={styles.salesMetricValue}>{formatCurrency(salesStats.commission)}</Text>
                    <Text style={styles.salesMetricLabel}>Comisión ganada</Text>
                  </View>
                </View>
              </View>

              <View style={styles.salesRow}>
                <View style={styles.salesMetric}>
                  <View style={styles.salesMetricIconContainer}>
                    <Ionicons name="calendar-outline" size={18} color="rgba(255, 149, 0, 0.8)" />
                  </View>
                  <View style={styles.salesMetricInfo}>
                    <Text style={styles.salesMetricValue}>7</Text>
                    <Text style={styles.salesMetricLabel}>Días activos</Text>
                  </View>
                </View>

                <View style={styles.salesMetric}>
                  <View style={styles.salesMetricIconContainer}>
                    <Ionicons name="flash-outline" size={18} color="rgba(255, 59, 48, 0.8)" />
                  </View>
                  <View style={styles.salesMetricInfo}>
                    <Text style={styles.salesMetricValue}>85%</Text>
                    <Text style={styles.salesMetricLabel}>Tasa conversión</Text>
                  </View>
                </View>
              </View>
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