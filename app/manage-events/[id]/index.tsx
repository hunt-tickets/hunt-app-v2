import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { Typography } from '../../../constants/fonts';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const { width } = Dimensions.get('window');

interface EventStats {
  totalSales: number;
  totalRevenue: number;
  attendees: number;
  capacity: number;
  salesByDay: { day: string; sales: number }[];
  salesByCategory: { category: string; amount: number; color: string }[];
  recentActivity: { type: string; description: string; time: string }[];
}

export default function EventDashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  // Mock event data
  const eventData = {
    id: parseInt(id as string),
    title: 'MARÍA HELENA AMADOR',
    subtitle: 'ZONAS VERDES Y COLISEO CUBIERTO',
    location: 'Gimnasio Moderno',
    date: '29',
    month: 'sep',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=1000&fit=crop',
  };

  // Mock statistics
  const stats: EventStats = {
    totalSales: 245,
    totalRevenue: 6125000,
    attendees: 245,
    capacity: 300,
    salesByDay: [
      { day: 'Lun', sales: 12 },
      { day: 'Mar', sales: 35 },
      { day: 'Mié', sales: 28 },
      { day: 'Jue', sales: 45 },
      { day: 'Vie', sales: 67 },
      { day: 'Sáb', sales: 58 },
      { day: 'Dom', sales: 0 },
    ],
    salesByCategory: [
      { category: 'General', amount: 4250000, color: '#007AFF' },
      { category: 'VIP', amount: 1425000, color: '#FF9500' },
      { category: 'Estudiante', amount: 450000, color: '#34C759' },
    ],
    recentActivity: [
      { type: 'sale', description: 'Nueva venta - 2 entradas VIP', time: 'Hace 5 min' },
      { type: 'refund', description: 'Reembolso procesado', time: 'Hace 1 hora' },
      { type: 'sale', description: 'Nueva venta - 1 entrada General', time: 'Hace 2 horas' },
      { type: 'update', description: 'Información del evento actualizada', time: 'Hace 3 horas' },
    ],
  };

  const handleTabChange = (event: any) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setSelectedTab(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderBarChart = () => {
    const maxSales = Math.max(...stats.salesByDay.map(d => d.sales));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Ventas por día</Text>
        <View style={styles.barChart}>
          {stats.salesByDay.map((day, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (day.sales / maxSales) * 80,
                      backgroundColor: day.sales > 0 ? theme.colors.primary : '#333'
                    }
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{day.day}</Text>
              <Text style={styles.barValue}>{day.sales}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Ingresos por categoría</Text>
        <View style={styles.pieContainer}>
          {stats.salesByCategory.map((category, index) => (
            <View key={index} style={styles.pieItem}>
              <View style={[styles.pieColor, { backgroundColor: category.color }]} />
              <View style={styles.pieInfo}>
                <Text style={styles.pieCategory}>{category.category}</Text>
                <Text style={styles.pieAmount}>₡{category.amount.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRecentActivity = () => {
    return (
      <View style={styles.activityContainer}>
        <Text style={styles.chartTitle}>Actividad reciente</Text>
        {stats.recentActivity.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={[styles.activityIcon, {
              backgroundColor: activity.type === 'sale' ? '#34C759' :
                              activity.type === 'refund' ? '#FF3B30' : '#007AFF'
            }]}>
              <Ionicons
                name={activity.type === 'sale' ? 'arrow-up' :
                     activity.type === 'refund' ? 'arrow-down' : 'create'}
                size={16}
                color="#ffffff"
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const styles = createStyles(theme, insets);

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Unified Custom Header */}
      <View style={[styles.unifiedHeader, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MARÍA HELENA AMADOR</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalSales}</Text>
            <Text style={styles.statLabel}>Entradas vendidas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₡{(stats.totalRevenue / 1000000).toFixed(1)}M</Text>
            <Text style={styles.statLabel}>Ingresos totales</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round((stats.attendees / stats.capacity) * 100)}%</Text>
            <Text style={styles.statLabel}>Ocupación</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.capacity - stats.attendees}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <SegmentedControl
          values={['Gráficos', 'Actividad']}
          selectedIndex={selectedTab}
          onChange={handleTabChange}
          style={styles.segmentedControl}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedTab === 0 ? (
          <>
            {renderBarChart()}
            {renderPieChart()}
          </>
        ) : (
          renderRecentActivity()
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
  unifiedHeader: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  eventSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  statsContainer: {
    padding: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentedControl: {
    width: '100%',
    height: 36,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  pieContainer: {
    gap: 16,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  pieInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pieAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  activityContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});