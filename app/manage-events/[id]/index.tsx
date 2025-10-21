import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { Typography } from '../../../constants/fonts';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, G, Text as SvgText, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface EventSalesStats {
  event_id: string;
  ventas_totales: number;
  ingreso_neto_productor_ajustado: number;
  ventas_en_app: {
    total: number;
    productor: number;
    servicio: number;
    impuestos: number;
  };
  ventas_en_web: {
    total: number;
    productor: number;
    servicio: number;
    impuestos: number;
  };
  ventas_en_efectivo: {
    total: number;
    productor: number;
    servicio: number;
    impuestos: number;
  };
  promoters: Array<{
    promoter_id: string;
    promoter_name: string;
    total_sales: number;
  }>;
  promedio_edad: number;
  rangos_edad: {
    '18-25': number;
    '26-35': number;
    '36-45': number;
    '46-55': number;
    '56+': number;
  };
  generos: {
    masculino: number;
    femenino: number;
    otro: number;
  };
  hora_promedio_entrada: string;
  distribucion_horaria: Array<{
    hora: string;
    cantidad: number;
  }>;
  precio_promedio_transaccion: number;
  cantidad_entradas_vendidas: number;
  timestamp: string;
}

interface Transaction {
  id: string;
  order_id: string;
  total: number;
  created_at: string;
  created_at_iso: string;
  created_at_date: string;
  created_at_time: string;
  created_at_full: string;
  status: string;
  source: string;
  resend_id: string | null;
}

interface TransactionsResponse {
  data: Transaction[];
}

interface HourlyData {
  hour: string;
  sales: number;
  transactions: number;
  fullDate?: string;
}

// Cache interfaces and utilities
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface EventDataCache {
  stats: CacheEntry<EventSalesStats> | null;
  transactions: CacheEntry<Transaction[]> | null;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// In-memory cache store
const eventDataCache = new Map<string, EventDataCache>();

// Cache utilities
const createCacheEntry = <T>(data: T): CacheEntry<T> => {
  const now = Date.now();
  return {
    data,
    timestamp: now,
    expiresAt: now + CACHE_DURATION
  };
};

const isCacheValid = <T>(entry: CacheEntry<T> | null): boolean => {
  if (!entry) return false;
  return Date.now() < entry.expiresAt;
};

const getCachedData = <T>(eventId: string, type: 'stats' | 'transactions'): T | null => {
  const cache = eventDataCache.get(eventId);
  if (!cache) return null;

  const entry = cache[type] as CacheEntry<T> | null;
  return isCacheValid(entry) ? entry!.data : null;
};

const setCachedData = <T>(eventId: string, type: 'stats' | 'transactions', data: T): void => {
  const cache = eventDataCache.get(eventId) || { stats: null, transactions: null };
  (cache[type] as CacheEntry<T>) = createCacheEntry(data);
  eventDataCache.set(eventId, cache);

  // Log cache status for debugging
  console.log(`✅ Cached ${type} for event ${eventId} (expires in ${CACHE_DURATION / 1000}s)`);
};

const clearEventCache = (eventId: string): void => {
  eventDataCache.delete(eventId);
  console.log(`🗑️ Cleared cache for event ${eventId}`);
};

export default function EventDashboard() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventStats, setEventStats] = useState<EventSalesStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<HourlyData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showChart, setShowChart] = useState(true);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [showChannelValues, setShowChannelValues] = useState(false);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'app' | 'web'>('app');
  const [selectedAnalyticsIndex, setSelectedAnalyticsIndex] = useState(0);
  const [selectedDateFilter, setSelectedDateFilter] = useState(4); // Default to "Todo"
  const [isShowingFallbackData, setIsShowingFallbackData] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [crosshairX, setCrosshairX] = useState(0);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tooltipX = useRef(new Animated.Value(0)).current;
  const tooltipY = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Chart states
  const [selectedGenderSegment, setSelectedGenderSegment] = useState<number | null>(null);
  const [genderAnimation] = useState(new Animated.Value(0));
  const [selectedAgeSegment, setSelectedAgeSegment] = useState<number | null>(null);
  const [ageAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchData();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Start chart animations
      Animated.timing(genderAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      Animated.timing(ageAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [id]);


  const fetchData = async (forceRefresh = false) => {
    await Promise.all([fetchEventStats(forceRefresh), fetchTransactions(forceRefresh)]);
  };

  const fetchEventStats = async (forceRefresh = false) => {
    try {
      setError(null);

      if (!id || typeof id !== 'string') {
        throw new Error('Invalid event ID');
      }

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedStats = getCachedData<EventSalesStats>(id, 'stats');
        if (cachedStats) {
          console.log('📦 Using cached stats for event ID:', id);
          setEventStats(cachedStats);
          setLoading(false);
          return;
        }
      }

      console.log('🌐 Fetching fresh stats for event ID:', id);

      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0ZmNmc25rc3l3b3RsYnNkZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2NTMxNjksImV4cCI6MjA0NTIyOTE2OX0.JMasBB86_w6ra1aDaVJG2w7Xo33L0SAJW_DZlumAKIk';

      const response = await fetch('https://jtfcfsnksywotlbsddqb.supabase.co/rest/v1/rpc/get_event_sales_stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          p_event_id: id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', response.status, errorText);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Event stats fetched successfully:', data);

      // Cache the fetched data
      setCachedData(id, 'stats', data);
      setEventStats(data);
    } catch (err) {
      console.error('Error fetching event stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchTransactions = async (forceRefresh = false) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid event ID for transactions');
      }

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedTransactions = getCachedData<Transaction[]>(id, 'transactions');
        if (cachedTransactions) {
          console.log('📦 Using cached transactions for event ID:', id);
          setTransactions(cachedTransactions);
          processHourlyData(cachedTransactions);
          return;
        }
      }

      console.log('🌐 Fetching fresh transactions for event ID:', id);

      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0ZmNmc25rc3l3b3RsYnNkZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2NTMxNjksImV4cCI6MjA0NTIyOTE2OX0.JMasBB86_w6ra1aDaVJG2w7Xo33L0SAJW_DZlumAKIk';

      const response = await fetch('https://jtfcfsnksywotlbsddqb.supabase.co/rest/v1/rpc/get_event_transactions_list_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          p_event_id: id
        })
      });

      if (!response.ok) {
        return;
      }

      const data: TransactionsResponse = await response.json();
      setTransactions(data.data);

      // Cache the transactions data
      setCachedData(id, 'transactions', data.data);

      // For initial load, show all data (don't apply filter immediately)
      // This prevents empty chart if data is older than default filter
      processHourlyData(data.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsByDate = (transactionData: Transaction[], filterKey: string): Transaction[] => {
    if (transactionData.length === 0) return [];

    const now = new Date();
    let cutoffDate: Date;

    // Debug: Check transaction dates (remove in production)
    if (__DEV__) {
      console.log('=== DEBUG FILTER ===');
      console.log('Filter:', filterKey);
      console.log('Total transactions:', transactionData.length);

      if (transactionData.length > 0) {
        const dates = transactionData.map(t => new Date(t.created_at_iso));
        const oldest = new Date(Math.min(...dates.map(d => d.getTime())));
        const newest = new Date(Math.max(...dates.map(d => d.getTime())));
        console.log('Data range:', oldest.toISOString(), 'to', newest.toISOString());
      }
    }

    switch (filterKey) {
      case '1D':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
        break;
      case '7D':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      case '1M':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        break;
      case '3M':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
        break;
      case 'All':
        return transactionData; // Return all data
      default:
        return transactionData; // Return all data if filter not recognized
    }

    const filtered = transactionData.filter(transaction => {
      const transactionDate = new Date(transaction.created_at_iso);
      return transactionDate >= cutoffDate;
    });

    if (__DEV__) {
      console.log('Cutoff date:', cutoffDate.toISOString());
      console.log('Filtered transactions:', filtered.length);
    }

    // If filtering results in insufficient data for a meaningful chart,
    // return a fallback with the most recent transactions
    const minTransactionsForChart = filterKey === '1D' ? 3 : 5;

    if (filtered.length < minTransactionsForChart && transactionData.length > 0) {
      if (__DEV__) {
        console.log(`Filter resulted in ${filtered.length} transactions (minimum: ${minTransactionsForChart}), using fallback`);
      }

      // Sort transactions by date (newest first)
      const sortedTransactions = [...transactionData].sort((a, b) =>
        new Date(b.created_at_iso).getTime() - new Date(a.created_at_iso).getTime()
      );

      // For 1D filter, show last 10-15 transactions
      // For 7D filter, show last 30-50 transactions
      const limit = filterKey === '1D' ? 15 : 50;
      const fallbackData = sortedTransactions.slice(0, Math.min(limit, sortedTransactions.length));

      if (__DEV__) {
        console.log('Returning fallback data:', fallbackData.length, 'transactions');
      }

      // Set fallback data flag
      setIsShowingFallbackData(true);
      return fallbackData;
    }

    // Reset fallback flag when using actual filtered data
    setIsShowingFallbackData(false);
    return filtered;
  };

  const processHourlyData = (transactionData: Transaction[]) => {
    if (__DEV__) {
      console.log('=== PROCESS HOURLY DATA ===');
      console.log('Input transactions:', transactionData.length);
    }

    if (transactionData.length === 0) {
      if (__DEV__) {
        console.log('No transactions, setting empty hourlyData');
      }
      setHourlyData([]);
      return;
    }

    // Encontrar el rango de fechas
    const dates = transactionData.map(t => new Date(t.created_at_iso));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Calcular diferencia en días
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let groupedData: { [key: string]: { sales: number; transactions: number } } = {};

    if (daysDiff <= 1) {
      // Mismo día: agrupar por horas
      transactionData.forEach(transaction => {
        const date = new Date(transaction.created_at_iso);
        const hourKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}`;

        if (!groupedData[hourKey]) {
          groupedData[hourKey] = { sales: 0, transactions: 0 };
        }
        groupedData[hourKey].sales += transaction.total;
        groupedData[hourKey].transactions += 1;
      });
    } else if (daysDiff <= 14) {
      // Hasta 2 semanas: agrupar por días
      transactionData.forEach(transaction => {
        const date = new Date(transaction.created_at_iso);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { sales: 0, transactions: 0 };
        }
        groupedData[dateKey].sales += transaction.total;
        groupedData[dateKey].transactions += 1;
      });
    } else {
      // Más de 2 semanas: agrupar por semanas
      transactionData.forEach(transaction => {
        const date = new Date(transaction.created_at_iso);

        // Calcular el lunes de esa semana
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convertir domingo de 0 a 7
        const mondayOfWeek = new Date(date);
        mondayOfWeek.setDate(date.getDate() - dayOfWeek + 1);

        const weekKey = mondayOfWeek.toISOString().split('T')[0]; // YYYY-MM-DD del lunes

        if (!groupedData[weekKey]) {
          groupedData[weekKey] = { sales: 0, transactions: 0 };
        }
        groupedData[weekKey].sales += transaction.total;
        groupedData[weekKey].transactions += 1;
      });
    }

    // Determinar formato de etiquetas según el tipo de agrupación
    const formatLabel = (dateObj: Date, daysDiff: number) => {
      if (daysDiff <= 1) {
        // Horas
        return `${dateObj.getHours().toString().padStart(2, '0')}:00`;
      } else if (daysDiff <= 14) {
        // Días
        const dayName = dateObj.toLocaleDateString('es', { weekday: 'short' });
        return `${dayName} ${dateObj.getDate()}`;
      } else {
        // Semanas
        const endOfWeek = new Date(dateObj);
        endOfWeek.setDate(dateObj.getDate() + 6);

        if (dateObj.getMonth() === endOfWeek.getMonth()) {
          // Misma mes
          return `${dateObj.getDate()}-${endOfWeek.getDate()} ${dateObj.toLocaleDateString('es', { month: 'short' })}`;
        } else {
          // Diferentes meses
          return `${dateObj.getDate()} ${dateObj.toLocaleDateString('es', { month: 'short' })}`;
        }
      }
    };

    const processed = Object.entries(groupedData)
      .map(([key, data]) => {
        let dateObj: Date;

        if (daysDiff <= 1) {
          // Parsear clave de hora: YYYY-MM-DD-HH
          const [year, month, day, hour] = key.split('-').map(Number);
          dateObj = new Date(year, month - 1, day, hour);
        } else {
          // Parsear clave de fecha: YYYY-MM-DD
          dateObj = new Date(key);
        }

        return {
          hour: formatLabel(dateObj, daysDiff),
          sales: data.sales,
          transactions: data.transactions,
          fullDate: key,
        };
      })
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

    if (__DEV__) {
      console.log('Processed hourly data points:', processed.length);
      console.log('Processed data:', processed);
      console.log('===========================');
    }

    setHourlyData(processed);
  };

  const handleRefresh = async () => {
    // Validate ID before refreshing
    if (!id || typeof id !== 'string') {
      console.warn('Cannot refresh: Invalid event ID');
      return;
    }

    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await fetchData(true); // Force refresh to bypass cache
    } catch (error) {
      console.error('Error during refresh:', error);
      setError('Error al actualizar los datos');
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatCurrencyFull = (amount: number | undefined): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0';
    }
    return `$${amount.toLocaleString()}`;
  };

  const getEventName = () => {
    if (!eventStats) return 'Loading...';
    return eventStats.event_id.split('-')[0].toUpperCase() + ' EVENT';
  };

  const getChannelData = () => {
    if (!eventStats) return [];

    return [
      {
        name: 'App',
        amount: eventStats.ventas_en_app.total,
        color: 'rgba(255, 255, 255, 0.9)',
        icon: 'phone-portrait-outline',
        percentage: (eventStats.ventas_en_app.total / eventStats.ventas_totales) * 100,
      },
      {
        name: 'Web',
        amount: eventStats.ventas_en_web.total,
        color: 'rgba(255, 255, 255, 0.7)',
        icon: 'globe-outline',
        percentage: (eventStats.ventas_en_web.total / eventStats.ventas_totales) * 100,
      },
      {
        name: 'Cash',
        amount: eventStats.ventas_en_efectivo.total,
        color: 'rgba(255, 255, 255, 0.5)',
        icon: 'cash-outline',
        percentage: (eventStats.ventas_en_efectivo.total / eventStats.ventas_totales) * 100,
      },
    ].sort((a, b) => b.amount - a.amount);
  };

  const renderEnhancedGenderChart = () => {
    const data = [
      { label: 'Femenino', shortLabel: 'F', value: 92, color: 'rgba(139, 92, 246, 0.8)' },
      { label: 'Masculino', shortLabel: 'M', value: 88, color: 'rgba(59, 130, 246, 0.8)' },
      { label: 'Otro', shortLabel: 'O', value: 5, color: 'rgba(156, 163, 175, 0.8)' },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 80;
    const innerRadius = 35;
    const centerX = 100;
    const centerY = 100;

    let currentAngle = -Math.PI / 2;
    const paths = data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const innerX1 = centerX + innerRadius * Math.cos(startAngle);
      const innerY1 = centerY + innerRadius * Math.sin(startAngle);
      const innerX2 = centerX + innerRadius * Math.cos(endAngle);
      const innerY2 = centerY + innerRadius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${innerX1.toFixed(2)} ${innerY1.toFixed(2)}`,
        `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
        `L ${innerX2.toFixed(2)} ${innerY2.toFixed(2)}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1.toFixed(2)} ${innerY1.toFixed(2)}`,
        'Z'
      ].join(' ');

      currentAngle = endAngle;

      return (
        <Path
          key={index}
          d={pathData}
          fill={item.color}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="2"
        />
      );
    });

    return (
      <View style={styles.compactChartContainer}>
        <View style={styles.enhancedChartContainer}>
          <Svg width={200} height={200} style={styles.compactPieChart}>
            <Defs>
              <SvgLinearGradient id="centerGlowGender" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="rgba(40, 40, 40, 1)" />
                <Stop offset="100%" stopColor="rgba(40, 40, 40, 1)" />
              </SvgLinearGradient>
            </Defs>
            {paths}
            <Circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="url(#centerGlowGender)"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
            />
          </Svg>
        </View>
        <View style={styles.compactLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.compactLegendItem}>
              <View style={[styles.compactIndicator, { backgroundColor: item.color }]} />
              <View style={styles.compactLegendText}>
                <Text style={styles.compactLabel}>{item.label}</Text>
                <Text style={styles.compactValue}>{Math.round((item.value / total) * 100)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEnhancedAgeChart = () => {
    const data = [
      { label: '18-25', value: 45, color: 'rgba(52, 211, 153, 0.8)' },
      { label: '26-35', value: 78, color: 'rgba(59, 130, 246, 0.8)' },
      { label: '36-45', value: 32, color: 'rgba(251, 191, 36, 0.8)' },
      { label: '46-55', value: 18, color: 'rgba(248, 113, 113, 0.8)' },
      { label: '56+', value: 12, color: 'rgba(168, 85, 247, 0.8)' },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 80;
    const innerRadius = 35;
    const centerX = 100;
    const centerY = 100;

    let currentAngle = -Math.PI / 2;
    const paths = data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const innerX1 = centerX + innerRadius * Math.cos(startAngle);
      const innerY1 = centerY + innerRadius * Math.sin(startAngle);
      const innerX2 = centerX + innerRadius * Math.cos(endAngle);
      const innerY2 = centerY + innerRadius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${innerX1.toFixed(2)} ${innerY1.toFixed(2)}`,
        `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
        `L ${innerX2.toFixed(2)} ${innerY2.toFixed(2)}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1.toFixed(2)} ${innerY1.toFixed(2)}`,
        'Z'
      ].join(' ');

      currentAngle = endAngle;

      return (
        <Path
          key={index}
          d={pathData}
          fill={item.color}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="2"
        />
      );
    });

    return (
      <View style={styles.compactChartContainer}>
        <View style={styles.enhancedChartContainer}>
          <Svg width={200} height={200} style={styles.compactPieChart}>
            <Defs>
              <SvgLinearGradient id="centerGlowAge" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="rgba(40, 40, 40, 1)" />
                <Stop offset="100%" stopColor="rgba(40, 40, 40, 1)" />
              </SvgLinearGradient>
            </Defs>
            {paths}
            <Circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="url(#centerGlowAge)"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
            />
          </Svg>
        </View>
        <View style={styles.compactLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.compactLegendItem}>
              <View style={[styles.compactIndicator, { backgroundColor: item.color }]} />
              <View style={styles.compactLegendText}>
                <Text style={styles.compactLabel}>{item.label}</Text>
                <Text style={styles.compactValue}>{Math.round((item.value / total) * 100)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderModernGenderChart = () => {
    const data = [
      { label: 'Femenino', value: 92, color: 'rgba(139, 92, 246, 0.8)', gradientEnd: 'rgba(99, 102, 241, 0.6)' },
      { label: 'Masculino', value: 88, color: 'rgba(59, 130, 246, 0.8)', gradientEnd: 'rgba(37, 99, 235, 0.6)' },
      { label: 'Otro', value: 5, color: 'rgba(156, 163, 175, 0.8)', gradientEnd: 'rgba(107, 114, 128, 0.6)' },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 85;
    const innerRadius = 45;
    const centerX = 110;
    const centerY = 110;

    let currentAngle = -Math.PI / 2;
    const paths = data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const isSelected = selectedGenderSegment === index;
      const segmentRadius = isSelected ? radius + 8 : radius;
      const segmentInnerRadius = isSelected ? innerRadius - 3 : innerRadius;

      const x1 = centerX + segmentRadius * Math.cos(startAngle);
      const y1 = centerY + segmentRadius * Math.sin(startAngle);
      const x2 = centerX + segmentRadius * Math.cos(endAngle);
      const y2 = centerY + segmentRadius * Math.sin(endAngle);

      const innerX1 = centerX + segmentInnerRadius * Math.cos(startAngle);
      const innerY1 = centerY + segmentInnerRadius * Math.sin(startAngle);
      const innerX2 = centerX + segmentInnerRadius * Math.cos(endAngle);
      const innerY2 = centerY + segmentInnerRadius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${innerX1.toFixed(2)} ${innerY1.toFixed(2)}`,
        `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
        `A ${segmentRadius} ${segmentRadius} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
        `L ${innerX2.toFixed(2)} ${innerY2.toFixed(2)}`,
        `A ${segmentInnerRadius} ${segmentInnerRadius} 0 ${largeArcFlag} 0 ${innerX1.toFixed(2)} ${innerY1.toFixed(2)}`,
        'Z'
      ].join(' ');

      currentAngle = endAngle;
      const gradientId = `gradient-gender-${index}`;

      return (
        <G key={index}>
          <Path
            d={pathData}
            fill={`url(#${gradientId})`}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={isSelected ? "3" : "1.5"}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedGenderSegment(selectedGenderSegment === index ? null : index);
            }}
          />
        </G>
      );
    });

    return (
      <View style={styles.modernChartContainer}>
        <Animated.View style={[styles.modernChartWrapper, { opacity: genderAnimation }]}>
          <Svg width={220} height={220} style={styles.modernChart}>
            <Defs>
              {data.map((item, index) => (
                <SvgLinearGradient key={index} id={`gradient-gender-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={item.color} stopOpacity="1" />
                  <Stop offset="100%" stopColor={item.gradientEnd} stopOpacity="0.8" />
                </SvgLinearGradient>
              ))}
              <SvgLinearGradient id="centerGradientGender" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="rgba(40, 40, 40, 1)" />
                <Stop offset="100%" stopColor="rgba(30, 30, 30, 1)" />
              </SvgLinearGradient>
            </Defs>
            {paths}
            <Circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="url(#centerGradientGender)"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />
            {selectedGenderSegment !== null && (
              <G>
                <SvgText
                  x={centerX}
                  y={centerY - 8}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#ffffff"
                  fontWeight="700"
                >
                  {data[selectedGenderSegment].value}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={centerY + 8}
                  textAnchor="middle"
                  fontSize="12"
                  fill="rgba(255, 255, 255, 0.8)"
                  fontWeight="500"
                >
                  {data[selectedGenderSegment].label}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={centerY + 24}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(255, 255, 255, 0.6)"
                  fontWeight="500"
                >
                  {Math.round((data[selectedGenderSegment].value / total) * 100)}%
                </SvgText>
              </G>
            )}
          </Svg>
        </Animated.View>
      </View>
    );
  };

  const renderModernAgeChart = () => {
    const data = [
      { label: '18-25', value: 45, color: 'rgba(52, 211, 153, 0.8)', gradientEnd: 'rgba(34, 197, 94, 0.6)' },
      { label: '26-35', value: 78, color: 'rgba(59, 130, 246, 0.8)', gradientEnd: 'rgba(37, 99, 235, 0.6)' },
      { label: '36-45', value: 32, color: 'rgba(251, 191, 36, 0.8)', gradientEnd: 'rgba(245, 158, 11, 0.6)' },
      { label: '46-55', value: 18, color: 'rgba(248, 113, 113, 0.8)', gradientEnd: 'rgba(239, 68, 68, 0.6)' },
      { label: '56+', value: 12, color: 'rgba(168, 85, 247, 0.8)', gradientEnd: 'rgba(147, 51, 234, 0.6)' },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 85;
    const innerRadius = 45;
    const centerX = 110;
    const centerY = 110;

    let currentAngle = -Math.PI / 2;
    const paths = data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const isSelected = selectedAgeSegment === index;
      const segmentRadius = isSelected ? radius + 8 : radius;
      const segmentInnerRadius = isSelected ? innerRadius - 3 : innerRadius;

      const x1 = centerX + segmentRadius * Math.cos(startAngle);
      const y1 = centerY + segmentRadius * Math.sin(startAngle);
      const x2 = centerX + segmentRadius * Math.cos(endAngle);
      const y2 = centerY + segmentRadius * Math.sin(endAngle);

      const innerX1 = centerX + segmentInnerRadius * Math.cos(startAngle);
      const innerY1 = centerY + segmentInnerRadius * Math.sin(startAngle);
      const innerX2 = centerX + segmentInnerRadius * Math.cos(endAngle);
      const innerY2 = centerY + segmentInnerRadius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${innerX1.toFixed(2)} ${innerY1.toFixed(2)}`,
        `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
        `A ${segmentRadius} ${segmentRadius} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
        `L ${innerX2.toFixed(2)} ${innerY2.toFixed(2)}`,
        `A ${segmentInnerRadius} ${segmentInnerRadius} 0 ${largeArcFlag} 0 ${innerX1.toFixed(2)} ${innerY1.toFixed(2)}`,
        'Z'
      ].join(' ');

      currentAngle = endAngle;
      const gradientId = `gradient-age-${index}`;

      return (
        <G key={index}>
          <Path
            d={pathData}
            fill={`url(#${gradientId})`}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={isSelected ? "3" : "1.5"}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedAgeSegment(selectedAgeSegment === index ? null : index);
            }}
          />
        </G>
      );
    });

    return (
      <View style={styles.modernChartContainer}>
        <Animated.View style={[styles.modernChartWrapper, { opacity: ageAnimation }]}>
          <Svg width={220} height={220} style={styles.modernChart}>
            <Defs>
              {data.map((item, index) => (
                <SvgLinearGradient key={index} id={`gradient-age-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={item.color} stopOpacity="1" />
                  <Stop offset="100%" stopColor={item.gradientEnd} stopOpacity="0.8" />
                </SvgLinearGradient>
              ))}
              <SvgLinearGradient id="centerGradientAge" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="rgba(40, 40, 40, 1)" />
                <Stop offset="100%" stopColor="rgba(30, 30, 30, 1)" />
              </SvgLinearGradient>
            </Defs>
            {paths}
            <Circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="url(#centerGradientAge)"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />
            {selectedAgeSegment !== null && (
              <G>
                <SvgText
                  x={centerX}
                  y={centerY - 8}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#ffffff"
                  fontWeight="700"
                >
                  {data[selectedAgeSegment].value}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={centerY + 8}
                  textAnchor="middle"
                  fontSize="12"
                  fill="rgba(255, 255, 255, 0.8)"
                  fontWeight="500"
                >
                  {data[selectedAgeSegment].label}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={centerY + 24}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(255, 255, 255, 0.6)"
                  fontWeight="500"
                >
                  {Math.round((data[selectedAgeSegment].value / total) * 100)}%
                </SvgText>
              </G>
            )}
          </Svg>
        </Animated.View>
      </View>
    );
  };

  const renderGenderPieChart = () => {
    // Datos falsos para distribución de género
    const data = [
      { label: 'Femenino', shortLabel: 'F', value: 92, color: 'rgba(244, 63, 94, 0.8)' },
      { label: 'Masculino', shortLabel: 'M', value: 88, color: 'rgba(59, 130, 246, 0.8)' },
      { label: 'Otro', shortLabel: 'O', value: 5, color: 'rgba(156, 163, 175, 0.8)' },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const radius = 70;
    const innerRadius = 25;
    const centerX = 90;
    const centerY = 90;

    let currentAngle = -Math.PI / 2; // Start from top
    const paths = data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 2 * Math.PI;

      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const ix1 = centerX + innerRadius * Math.cos(startAngle);
      const iy1 = centerY + innerRadius * Math.sin(startAngle);
      const ix2 = centerX + innerRadius * Math.cos(endAngle);
      const iy2 = centerY + innerRadius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${ix1} ${iy1}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${ix2} ${iy2}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`,
        'Z'
      ].join(' ');

      currentAngle += angle;

      return (
        <Path
          key={index}
          d={pathData}
          fill={item.color}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    });

    return (
      <View style={styles.compactChartContainer}>
        <View style={styles.compactChartHeader}>
          <Svg width={180} height={180} style={styles.compactPieChart}>
            <Defs>
              <SvgLinearGradient id="centerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="rgba(40, 40, 40, 1)" />
                <Stop offset="100%" stopColor="rgba(40, 40, 40, 1)" />
              </SvgLinearGradient>
            </Defs>
            {paths}
            <Circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="url(#centerGlow)"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />
          </Svg>
        </View>
        <View style={styles.compactLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.compactLegendItem}>
              <View style={[styles.compactIndicator, { backgroundColor: item.color }]} />
              <Text style={styles.compactLabel}>{item.label}</Text>
              <Text style={styles.compactValue}>{Math.round((item.value / total) * 100)}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAgePieChart = () => {
    // Datos falsos para distribución de edad
    const data = [
      { label: '18-25', value: 45, color: 'rgba(34, 197, 94, 0.8)' },
      { label: '26-35', value: 78, color: 'rgba(59, 130, 246, 0.8)' },
      { label: '36-45', value: 32, color: 'rgba(251, 191, 36, 0.8)' },
      { label: '46-55', value: 18, color: 'rgba(239, 68, 68, 0.8)' },
      { label: '56+', value: 12, color: 'rgba(147, 51, 234, 0.8)' }
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const radius = 70;
    const innerRadius = 25;
    const centerX = 90;
    const centerY = 90;

    let currentAngle = -Math.PI / 2; // Start from top
    const paths = data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 2 * Math.PI;

      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const ix1 = centerX + innerRadius * Math.cos(startAngle);
      const iy1 = centerY + innerRadius * Math.sin(startAngle);
      const ix2 = centerX + innerRadius * Math.cos(endAngle);
      const iy2 = centerY + innerRadius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${ix1} ${iy1}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${ix2} ${iy2}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`,
        'Z'
      ].join(' ');

      currentAngle += angle;

      return (
        <Path
          key={index}
          d={pathData}
          fill={item.color}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    });

    return (
      <View style={styles.compactChartContainer}>
        <View style={styles.compactChartHeader}>
          <Svg width={180} height={180} style={styles.compactPieChart}>
            <Defs>
              <SvgLinearGradient id="centerGlowAge" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="rgba(40, 40, 40, 1)" />
                <Stop offset="100%" stopColor="rgba(40, 40, 40, 1)" />
              </SvgLinearGradient>
            </Defs>
            {paths}
            <Circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="url(#centerGlowAge)"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />
          </Svg>
        </View>
        <View style={styles.compactLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.compactLegendItem}>
              <View style={[styles.compactIndicator, { backgroundColor: item.color }]} />
              <Text style={styles.compactLabel}>{item.label}</Text>
              <Text style={styles.compactValue}>{Math.round((item.value / total) * 100)}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSalesChannelsBarChart = () => {
    const channelData = getChannelData();
    if (channelData.length === 0) return null;

    const total = channelData.reduce((sum, channel) => sum + channel.amount, 0);
    if (total === 0) return null;

    const barHeight = 24;
    const barSpacing = 16;
    const chartHeight = channelData.length * (barHeight + barSpacing) - barSpacing + 20;

    return (
      <TouchableOpacity
        style={styles.fullWidthChartContainer}
        activeOpacity={0.8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowChannelValues(!showChannelValues);
        }}
      >
        <View style={styles.horizontalBarChart}>
          {channelData.map((channel, index) => (
            <View key={index} style={styles.horizontalBarItem}>
              <View style={styles.barLabelContainer}>
                <View style={styles.barLabelRow}>
                  <View style={[styles.barIndicator, { backgroundColor: channel.color }]} />
                  <Text style={styles.barLabel}>{channel.name}</Text>
                </View>
                <Text style={styles.barValue}>
                  {showChannelValues ? formatCurrency(channel.amount) : `${channel.percentage.toFixed(1)}%`}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${channel.percentage}%`,
                      backgroundColor: channel.color
                    }
                  ]}
                />
              </View>
            </View>
          ))}

        </View>
      </TouchableOpacity>
    );
  };

  const analyticsFilters = [
    { key: 'app', label: 'App' },
    { key: 'web', label: 'Web' },
  ];

  const dateFilters = [
    { key: '1D', label: '1D' },
    { key: '7D', label: '7D' },
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: 'All', label: 'Todo' },
  ];

  const handleAnalyticsFilterChange = (event: any) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setSelectedAnalyticsIndex(index);
    setActiveAnalyticsTab(analyticsFilters[index].key as 'app' | 'web');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDateFilterChange = (event: any) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setSelectedDateFilter(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Re-process data with new date filter
    const filteredTransactions = filterTransactionsByDate(transactions, dateFilters[index].key);
    processHourlyData(filteredTransactions);
  };

  const renderHourlyBarChart = () => {
    if (!eventStats?.distribucion_horaria || eventStats.distribucion_horaria.length === 0) {
      // Datos de ejemplo para pruebas
      const fakeData = [
        { hora: '18:00', cantidad: 25 },
        { hora: '19:00', cantidad: 45 },
        { hora: '20:00', cantidad: 80 },
        { hora: '21:00', cantidad: 120 },
        { hora: '22:00', cantidad: 95 },
        { hora: '23:00', cantidad: 60 },
        { hora: '00:00', cantidad: 30 }
      ];

      const maxValue = Math.max(...fakeData.map(item => item.cantidad));
      const chartWidth = width - 60;
      const chartHeight = 140;
      const barWidth = (chartWidth - 40) / fakeData.length - 8;
      const padding = { top: 20, bottom: 35, left: 20, right: 20 };

      return (
        <View style={styles.fullWidthBarContainer}>
          <Svg width={chartWidth} height={chartHeight} style={styles.fullWidthBarChart}>
            <Defs>
              <SvgLinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
                <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.45)" />
              </SvgLinearGradient>
            </Defs>

            {/* Grid lines */}
            {[0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => {
              const y = padding.top + (1 - ratio) * (chartHeight - padding.top - padding.bottom);
              return (
                <Path
                  key={`grid-${index}`}
                  d={`M ${padding.left} ${y} L ${chartWidth - padding.right} ${y}`}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="0.5"
                  strokeDasharray="3,3"
                />
              );
            })}

            {fakeData.map((item, index) => {
              const barHeight = (item.cantidad / maxValue) * (chartHeight - padding.top - padding.bottom);
              const x = padding.left + index * (barWidth + 6);
              const y = chartHeight - padding.bottom - barHeight;

              return (
                <G key={index}>
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="url(#barGradient)"
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1.5"
                    rx="4"
                  />
                  <SvgText
                    x={x + barWidth / 2}
                    y={chartHeight - padding.bottom + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fill="rgba(255, 255, 255, 0.9)"
                    fontWeight="600"
                  >
                    {item.hora}
                  </SvgText>
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fill="rgba(255, 255, 255, 0.95)"
                    fontWeight="700"
                  >
                    {item.cantidad}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>
      );
    }

    const maxValue = Math.max(...eventStats.distribucion_horaria.map(item => item.cantidad));
    const chartWidth = width - 60;
    const chartHeight = 140;
    const barWidth = (chartWidth - 40) / eventStats.distribucion_horaria.length - 8;
    const padding = { top: 20, bottom: 35, left: 20, right: 20 };

    return (
      <View style={styles.fullWidthBarContainer}>
        <Svg width={chartWidth} height={chartHeight} style={styles.fullWidthBarChart}>
          <Defs>
            <SvgLinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.45)" />
            </SvgLinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => {
            const y = padding.top + (1 - ratio) * (chartHeight - padding.top - padding.bottom);
            return (
              <Path
                key={`grid-${index}`}
                d={`M ${padding.left} ${y} L ${chartWidth - padding.right} ${y}`}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
            );
          })}

          {eventStats.distribucion_horaria.map((item, index) => {
            const barHeight = (item.cantidad / maxValue) * (chartHeight - padding.top - padding.bottom);
            const x = padding.left + index * (barWidth + 6);
            const y = chartHeight - padding.bottom - barHeight;

            return (
              <G key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGradient)"
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth="1.5"
                  rx="4"
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="rgba(255, 255, 255, 0.9)"
                  fontWeight="600"
                >
                  {item.hora}
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="12"
                  fill="rgba(255, 255, 255, 0.95)"
                  fontWeight="700"
                >
                  {item.cantidad}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
    );
  };


  const renderBarChart = () => {
    if (hourlyData.length === 0) return null;

    const maxSales = Math.max(...hourlyData.map(d => d.sales));
    const chartWidth = width - 40;
    const chartHeight = 300;
    const padding = { top: 20, bottom: 50, left: 0, right: 0 };
    const plotWidth = chartWidth;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const barWidth = Math.max(8, Math.min(plotWidth / hourlyData.length - 4, 40)); // Min 8px, max 40px, with 4px spacing
    const spacing = 4;
    const totalBarWidth = barWidth + spacing;
    const startX = (plotWidth - (hourlyData.length * totalBarWidth - spacing)) / 2; // Center bars

    const handleBarInteraction = (event: any, index: number) => {
      setIsInteracting(true);
      setLastSelectedIndex(index);
      setSelectedDataPoint(hourlyData[index]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const barX = startX + index * totalBarWidth + barWidth / 2;
      setCrosshairX(barX);

      // Position tooltip
      const tooltipXPos = barX - 50;
      const tooltipYPos = 10;
      tooltipX.setValue(Math.max(10, Math.min(tooltipXPos, chartWidth - 100)));
      tooltipY.setValue(tooltipYPos);
    };

    const handleBarEnd = () => {
      setIsInteracting(false);
      setCrosshairX(0);
      setLastSelectedIndex(-1);
      setTimeout(() => {
        setSelectedDataPoint(null);
      }, 1500);
    };

    return (
      <View style={styles.chartContainer}>
        <View style={{ width: chartWidth, height: chartHeight }}>
          <Svg width={chartWidth} height={chartHeight} style={styles.enhancedChart}>
            <Defs>
              <SvgLinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#34C759" stopOpacity="0.9" />
                <Stop offset="100%" stopColor="#34C759" stopOpacity="0.6" />
              </SvgLinearGradient>
            </Defs>

            {/* Bars */}
            {hourlyData.map((point, index) => {
              const barHeight = (point.sales / maxSales) * plotHeight;
              const barX = startX + index * totalBarWidth;
              const barY = padding.top + plotHeight - barHeight;
              const isSelected = lastSelectedIndex === index;

              return (
                <G key={`bar-${index}`}>
                  <Rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={isSelected ? "#22C55E" : "url(#barGradient)"}
                    rx={2}
                    opacity={isSelected ? 1 : 0.8}
                    onPress={(event) => handleBarInteraction(event, index)}
                  />
                  {/* Bar value label */}
                  <SvgText
                    x={barX + barWidth / 2}
                    y={barY - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill="rgba(255, 255, 255, 0.7)"
                    opacity={isSelected ? 1 : 0}
                  >
                    {point.sales > 0 ? formatCurrency(point.sales) : ''}
                  </SvgText>
                </G>
              );
            })}

            {/* Crosshair line for selected bar */}
            {isInteracting && crosshairX > 0 && (
              <Path
                d={`M ${crosshairX} ${padding.top} L ${crosshairX} ${chartHeight - padding.bottom}`}
                stroke="rgba(200, 200, 200, 0.8)"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            )}

            {/* X-axis labels */}
            {hourlyData.map((point, index) => {
              const labelX = startX + index * totalBarWidth + barWidth / 2;
              const labelY = chartHeight - 15;

              return (
                <SvgText
                  key={`label-${index}`}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(255, 255, 255, 0.6)"
                >
                  {point.hour}
                </SvgText>
              );
            })}
          </Svg>
        </View>
      </View>
    );
  };

  const renderEnhancedChart = () => {
    if (hourlyData.length === 0) return null;

    const maxSales = Math.max(...hourlyData.map(d => d.sales));
    const minSales = -1000; // Valor mínimo del gráfico
    const salesRange = maxSales - minSales;
    const chartWidth = width - 40; // Screen width minus heroCard margins (20px × 2)
    const chartHeight = 300;
    const padding = { top: 20, bottom: 50, left: 0, right: 0 };
    const plotWidth = chartWidth; // Sin padding lateral
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const findClosestPoint = (gestureX: number) => {
      let closestIndex = 0;
      let minDistance = Infinity;

      hourlyData.forEach((point, index) => {
        let x: number;
        if (hourlyData.length === 1) {
          x = plotWidth / 2;
        } else {
          x = (index / (hourlyData.length - 1)) * plotWidth;
        }

        const distance = Math.abs(x - gestureX);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    };

    const handleChartStart = (event: any) => {
      setIsInteracting(true);
      handleChartMove(event);
    };

    const handleChartMove = (event: any) => {
      const gestureX = event.nativeEvent.locationX;
      const constrainedX = Math.max(0, Math.min(gestureX, plotWidth));

      const closestIndex = findClosestPoint(constrainedX);
      const point = hourlyData[closestIndex];

      // Solo hacer haptic feedback cuando cambia el punto seleccionado
      if (closestIndex !== lastSelectedIndex) {
        setLastSelectedIndex(closestIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      let pointX: number;
      if (hourlyData.length === 1) {
        pointX = plotWidth / 2;
      } else {
        pointX = (closestIndex / (hourlyData.length - 1)) * plotWidth;
      }
      const pointY = padding.top + (1 - ((point.sales - minSales) / salesRange)) * plotHeight;

      // Sincronizar línea y tooltip como un solo componente
      setCrosshairX(constrainedX);
      setSelectedDataPoint(point);

      // Posicionar tooltip arriba alineado con la línea vertical
      const tooltipXPos = constrainedX - 50; // Centrar tooltip con la línea (width ~100px)
      const tooltipYPos = 10; // Siempre en la parte superior

      // Actualizar posición del tooltip instantáneamente - movimiento unificado
      tooltipX.setValue(Math.max(10, Math.min(tooltipXPos, chartWidth - 100)));
      tooltipY.setValue(tooltipYPos);
    };

    const handleChartEnd = () => {
      setIsInteracting(false);
      setCrosshairX(0);
      setLastSelectedIndex(-1);

      // Esconder tooltip después de un delay
      setTimeout(() => {
        setSelectedDataPoint(null);
      }, 1500);
    };

    return (
      <View style={styles.chartContainer}>
        <View
          style={{ width: chartWidth, height: chartHeight }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleChartStart}
          onResponderMove={handleChartMove}
          onResponderRelease={handleChartEnd}
          onResponderTerminate={handleChartEnd}
        >
          <Svg width={chartWidth} height={chartHeight} style={styles.enhancedChart}>
          <Defs>
            <SvgLinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#34C759" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#34C759" stopOpacity="0.03" />
            </SvgLinearGradient>
          </Defs>

          {/* Area fill - Using same curve logic as line */}
          {hourlyData.length > 0 && (
            <Path
              d={(() => {
                // Generate the same curve path as the line
                const linePath = hourlyData.map((point, index) => {
                  let x: number;
                  if (hourlyData.length === 1) {
                    x = plotWidth / 2;
                  } else {
                    x = (index / (hourlyData.length - 1)) * plotWidth;
                  }
                  const y = padding.top + (1 - ((point.sales - minSales) / salesRange)) * plotHeight;

                  if (index === 0) {
                    return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
                  }

                  // Same bezier curve logic as line
                  let prevX: number;
                  if (hourlyData.length === 1) {
                    prevX = plotWidth / 2;
                  } else {
                    prevX = ((index - 1) / (hourlyData.length - 1)) * plotWidth;
                  }
                  const prevY = padding.top + (1 - ((hourlyData[index - 1].sales - minSales) / salesRange)) * plotHeight;

                  const cpX1 = prevX + (x - prevX) * 0.5;
                  const cpY1 = prevY;
                  const cpX2 = prevX + (x - prevX) * 0.5;
                  const cpY2 = y;

                  return `C ${cpX1.toFixed(2)} ${cpY1.toFixed(2)} ${cpX2.toFixed(2)} ${cpY2.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
                }).join(' ');

                // Get first and last point coordinates
                const firstX = hourlyData.length === 1 ? plotWidth / 2 : 0;
                const lastX = hourlyData.length === 1 ? plotWidth / 2 : plotWidth;
                const bottomY = padding.top + plotHeight;

                // Create closed area path: line path + bottom edge + close
                return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
              })()}
              fill="url(#areaGradient)"
            />
          )}

          {/* Main line - Smooth curve */}
          {hourlyData.length > 0 && (
            <Path
              d={hourlyData.map((point, index) => {
                let x: number;
                if (hourlyData.length === 1) {
                  x = plotWidth / 2; // Centrar si solo hay un punto
                } else {
                  x = (index / (hourlyData.length - 1)) * plotWidth;
                }
                const y = padding.top + (1 - ((point.sales - minSales) / salesRange)) * plotHeight;

                if (index === 0) {
                  return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
                }

                // Crear curva suave usando bezier
                let prevX: number;
                if (hourlyData.length === 1) {
                  prevX = plotWidth / 2;
                } else {
                  prevX = ((index - 1) / (hourlyData.length - 1)) * plotWidth;
                }
                const prevY = padding.top + (1 - ((hourlyData[index - 1].sales - minSales) / salesRange)) * plotHeight;

                const cpX1 = prevX + (x - prevX) * 0.5;
                const cpY1 = prevY;
                const cpX2 = prevX + (x - prevX) * 0.5;
                const cpY2 = y;

                return `C ${cpX1.toFixed(2)} ${cpY1.toFixed(2)} ${cpX2.toFixed(2)} ${cpY2.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
              }).join(' ')}
              stroke="rgba(52, 211, 153, 0.9)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {hourlyData.map((point, index) => {
            let x: number;
            if (hourlyData.length === 1) {
              x = plotWidth / 2; // Centrar si solo hay un punto
            } else {
              x = (index / (hourlyData.length - 1)) * plotWidth;
            }
            const y = padding.top + (1 - (point.sales / maxSales)) * plotHeight;
            const isSelected = selectedDataPoint?.hour === point.hour;

            if (!isFinite(x) || !isFinite(y)) return null;

            // Solo mostrar etiquetas en algunos puntos para no saturar
            const totalPoints = hourlyData.length;
            const shouldShowLabel = totalPoints <= 3 ||
                                   index === 0 ||
                                   index === Math.floor(totalPoints / 2) ||
                                   index === totalPoints - 1 ||
                                   (totalPoints <= 7 && index % 2 === 0);

            return (
              <G key={`point-${index}`}>
                {/* Solo mostrar etiquetas selectivas */}
                {shouldShowLabel && (
                  <SvgText
                    x={x.toFixed(2)}
                    y={chartHeight - padding.bottom + 25}
                    textAnchor="middle"
                    fontSize="12"
                    fill="rgba(255, 255, 255, 0.9)"
                    fontWeight="600"
                  >
                    {point.hour}
                  </SvgText>
                )}
              </G>
            );
          })}

          {/* Crosshair Line - Línea vertical que sigue el dedo */}
          {isInteracting && crosshairX > 0 && (
            <G opacity={0.8}>
              {/* Línea vertical principal */}
              <Path
                d={`M ${crosshairX} ${padding.top} L ${crosshairX} ${chartHeight - padding.bottom}`}
                stroke="rgba(200, 200, 200, 0.8)"
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity={0.9}
              />

              {/* Punto en la línea del gráfico */}
              {selectedDataPoint && (
                <Circle
                  cx={crosshairX}
                  cy={padding.top + (1 - ((selectedDataPoint.sales - minSales) / salesRange)) * plotHeight}
                  r="6"
                  fill="rgba(52, 211, 153, 0.9)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity={1}
                />
              )}

              {/* Indicador en el eje X */}
              <Rect
                x={crosshairX - 25}
                y={chartHeight - padding.bottom + 5}
                width="50"
                height="20"
                fill="rgba(52, 199, 89, 0.9)"
                rx="4"
              />
              {selectedDataPoint && (
                <SvgText
                  x={crosshairX}
                  y={chartHeight - padding.bottom + 18}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#ffffff"
                  fontWeight="600"
                >
                  {selectedDataPoint.hour}
                </SvgText>
              )}
            </G>
          )}

          </Svg>
        </View>

        {/* Dynamic Tooltip - TradingView Style */}
        {selectedDataPoint && (
          <Animated.View
            style={[
              styles.tradingTooltip,
              {
                left: tooltipX,
                top: tooltipY,
                opacity: isInteracting ? 1 : 0.9,
                transform: [
                  { scale: isInteracting ? 1 : 0.95 }
                ]
              }
            ]}
          >
            <BlurView
              glassEffectStyle="regular"
              tintColor="rgba(0,0,0,0.3)"
              style={StyleSheet.absoluteFillObject}
              experimentalBlurMethod="dimezisBlurView"
            />

            {/* Punta del tooltip */}
            <View style={styles.tooltipArrow} />

            <View style={styles.tradingTooltipContent}>
              {/* Header con hora */}
              <View style={styles.tooltipHeader}>
                <View style={styles.tooltipTimeIndicator} />
                <Text style={styles.tooltipTimeText}>{selectedDataPoint.hour}</Text>
              </View>

              {/* Datos principales */}
              <View style={styles.tooltipDataSection}>
                <View style={styles.tooltipDataRow}>
                  <Text style={styles.tooltipLabel}>Ventas</Text>
                  <Text style={styles.tooltipValue}>{formatCurrency(selectedDataPoint.sales)}</Text>
                </View>

                <View style={styles.tooltipDataRow}>
                  <Text style={styles.tooltipLabel}>Transacciones</Text>
                  <Text style={styles.tooltipValueSecondary}>
                    {selectedDataPoint.transactions}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderAppTrafficChart = () => {
    const appTrafficData = [
      { day: 'Lun', impressions: 1200, users: 180 },
      { day: 'Mar', impressions: 1450, users: 220 },
      { day: 'Mié', impressions: 980, users: 165 },
      { day: 'Jue', impressions: 1680, users: 285 },
      { day: 'Vie', impressions: 2100, users: 340 },
      { day: 'Sáb', impressions: 1890, users: 310 },
      { day: 'Dom', impressions: 1250, users: 195 }
    ];

    const maxImpressions = Math.max(...appTrafficData.map(d => d.impressions));
    const chartWidth = width - 80;
    const chartHeight = 160;
    const barWidth = (chartWidth - 60) / appTrafficData.length - 12;
    const padding = { top: 20, bottom: 40, left: 30, right: 30 };

    return (
      <View style={styles.appTrafficChartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <SvgLinearGradient id="appTrafficGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgba(34, 197, 94, 0.8)" />
              <Stop offset="100%" stopColor="rgba(34, 197, 94, 0.3)" />
            </SvgLinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding.top + (1 - ratio) * (chartHeight - padding.top - padding.bottom);
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

          {appTrafficData.map((item, index) => {
            const barHeight = (item.impressions / maxImpressions) * (chartHeight - padding.top - padding.bottom);
            const x = padding.left + index * (barWidth + 12);
            const y = chartHeight - padding.bottom - barHeight;

            return (
              <G key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#appTrafficGradient)"
                  stroke="rgba(34, 197, 94, 0.4)"
                  strokeWidth="1"
                  rx="4"
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="rgba(255, 255, 255, 0.8)"
                  fontWeight="500"
                >
                  {item.day}
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(255, 255, 255, 0.9)"
                  fontWeight="600"
                >
                  {item.impressions}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
    );
  };

  const renderWebTrafficSources = () => {
    const trafficSources = [
      { source: 'Google', visits: 4850, percentage: 42.3, color: 'rgba(34, 197, 94, 0.8)' },
      { source: 'Facebook', visits: 2890, percentage: 25.2, color: 'rgba(59, 130, 246, 0.8)' },
      { source: 'Instagram', visits: 1950, percentage: 17.0, color: 'rgba(168, 85, 247, 0.8)' },
      { source: 'Directo', visits: 1200, percentage: 10.5, color: 'rgba(245, 158, 11, 0.8)' },
      { source: 'Otros', visits: 585, percentage: 5.0, color: 'rgba(156, 163, 175, 0.8)' }
    ];

    return (
      <View style={styles.trafficSourcesList}>
        {trafficSources.map((source, index) => (
          <View key={index} style={styles.trafficSourceItem}>
            <View style={styles.trafficSourceInfo}>
              <View style={[styles.trafficSourceIndicator, { backgroundColor: source.color }]} />
              <Text style={styles.trafficSourceName}>{source.source}</Text>
            </View>
            <View style={styles.trafficSourceStats}>
              <Text style={styles.trafficSourceVisits}>{source.visits.toLocaleString()}</Text>
              <Text style={styles.trafficSourcePercentage}>{source.percentage}%</Text>
            </View>
            <View style={styles.trafficSourceBar}>
              <View style={styles.trafficSourceBarTrack}>
                <View
                  style={[
                    styles.trafficSourceBarFill,
                    { width: `${source.percentage}%`, backgroundColor: source.color }
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const styles = createStyles(theme, insets);

  if (loading && !eventStats) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />


      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'ios' ? headerHeight : 20,
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isInteracting}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ffffff"
            colors={["#007AFF"]}
          />
        }
      >
        {error && (
          <View style={styles.errorCard}>
            <BlurView
              glassEffectStyle="regular"
              tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.errorContent}>
              <Ionicons name="warning-outline" size={28} color="#FF453A" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!error && eventStats && (
          <>
            {/* Hero Revenue Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroContent}>
                <View style={styles.heroHeader}>
                  <View style={styles.heroTitleSection}>
                    <Text style={styles.heroLabel}>Ingresos totales</Text>
                    <Text style={styles.heroAmount}>{formatCurrencyFull(eventStats.ventas_totales)}</Text>
                  </View>

                  {hourlyData.length > 0 && (
                    <TouchableOpacity
                      style={styles.chartToggleButton}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowChart(!showChart);
                      }}
                      activeOpacity={0.8}
                    >
                      <BlurView
                        glassEffectStyle="regular"
                        tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.chartToggleOverlay}>
                        <Ionicons
                          name={showChart ? "eye-off-outline" : "analytics-outline"}
                          size={18}
                          color="rgba(255, 255, 255, 0.8)"
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                {hourlyData.length > 0 && showChart && (
                  <View style={styles.chartSection}>
                    {/* Chart Type Toggle */}
                    <View style={styles.chartTypeContainer}>
                      <SegmentedControl
                        values={['Líneas', 'Barras']}
                        selectedIndex={chartType === 'area' ? 0 : 1}
                        onChange={(event) => {
                          const index = event.nativeEvent.selectedSegmentIndex;
                          setChartType(index === 0 ? 'area' : 'bar');
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={styles.chartTypeControl}
                      />
                    </View>
                    {chartType === 'area' ? renderEnhancedChart() : renderBarChart()}

                    {/* Date Filter Tabs - Moved below chart */}
                    <View style={styles.dateFilterContainer}>
                      <SegmentedControl
                        values={dateFilters.map(f => f.label)}
                        selectedIndex={selectedDateFilter}
                        onChange={handleDateFilterChange}
                        style={[
                          styles.dateFilterControl,
                          {
                            width: '100%', // Full width
                          }
                        ]}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Main KPIs */}
            <View style={styles.mainKpisGrid}>
              <View style={styles.mainKpiCard}>
                <BlurView
                  glassEffectStyle="regular"
                  tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.mainKpiContent}>
                  <View style={[styles.mainKpiIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                    <Ionicons name="ticket-outline" size={20} color="rgba(34, 197, 94, 0.9)" />
                  </View>
                  <View style={styles.mainKpiTextContainer}>
                    <Text style={styles.mainKpiNumber}>{eventStats.cantidad_entradas_vendidas}</Text>
                    <Text style={styles.mainKpiLabel}>Entradas vendidas</Text>
                  </View>
                </View>
              </View>

              <View style={styles.mainKpiCard}>
                <BlurView
                  glassEffectStyle="regular"
                  tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.mainKpiContent}>
                  <View style={[styles.mainKpiIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                    <Ionicons name="calculator-outline" size={20} color="rgba(34, 197, 94, 0.9)" />
                  </View>
                  <View style={styles.mainKpiTextContainer}>
                    <Text style={styles.mainKpiNumber}>{formatCurrencyFull(eventStats.precio_promedio_transaccion)}</Text>
                    <Text style={styles.mainKpiLabel}>Precio promedio</Text>
                  </View>
                </View>
              </View>
            </View>



            {/* Analytics Section */}
            <View style={styles.fullWidthAnalytics}>
              <Text style={styles.analyticsMainTitle}>Analíticas de audiencia</Text>

              {/* Age and Gender Distribution Row */}
              <View style={styles.demographicsRow}>
                {/* Age Distribution */}
                <View style={styles.demographicsCard}>
                  <BlurView
                    glassEffectStyle="regular"
                    tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.demographicsContent}>
                    <View style={styles.chartHeader}>
                      <Text style={styles.chartTitle}>Edades</Text>
                    </View>
                    {renderModernAgeChart()}
                  </View>
                </View>

                {/* Gender Distribution */}
                <View style={styles.demographicsCard}>
                  <BlurView
                    glassEffectStyle="regular"
                    tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.demographicsContent}>
                    <View style={styles.chartHeader}>
                      <Text style={styles.chartTitle}>Géneros</Text>
                    </View>
                    {renderModernGenderChart()}
                  </View>
                </View>
              </View>

              {/* Hourly Entry Chart */}
              <View style={styles.fullWidthCard}>
                <View style={styles.fullWidthBlurBackground}>
                  <BlurView
                    glassEffectStyle="regular"
                    tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                    style={StyleSheet.absoluteFillObject}
                  />
                </View>
                <View style={styles.fullWidthContent}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Horarios de entrada</Text>
                    <Text style={styles.chartSubtitle}>Distribución por hora de llegada</Text>
                  </View>
                  {renderHourlyBarChart()}
                </View>
              </View>

              {/* Sales Channels */}
              <View style={styles.fullWidthCard}>
                <BlurView
                  glassEffectStyle="regular"
                  tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={[styles.fullWidthContent, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                  <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Canales de venta</Text>
                  </View>
                  {renderSalesChannelsBarChart()}
                </View>
              </View>
            </View>

            {/* Top Promoters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top vendedores</Text>

              {eventStats.promoters.map((promoter, index) => (
                <View key={promoter.promoter_id} style={styles.promoterCard}>
                  <BlurView
                    glassEffectStyle="regular"
                    tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.promoterContent}>
                    <View style={styles.promoterRank}>
                      <Text style={styles.rankNumber}>#{index + 1}</Text>
                    </View>

                    <View style={styles.promoterInfo}>
                      <Text style={styles.promoterName}>{promoter.promoter_name}</Text>
                      <Text style={styles.promoterSales}>{formatCurrency(promoter.total_sales)}</Text>
                    </View>

                    <View style={styles.promoterProgress}>
                      <View style={styles.promoterProgressBar}>
                        <View
                          style={[
                            styles.promoterProgressFill,
                            {
                              width: `${(promoter.total_sales / eventStats.promoters[0].total_sales) * 100}%`
                            }
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}

            </View>

            {/* Analytics with Tabs Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Analíticas de tráfico</Text>

              {/* Native Segmented Control */}
              <View style={styles.analyticsTabContainer}>
                <SegmentedControl
                  values={analyticsFilters.map(f => f.label)}
                  selectedIndex={selectedAnalyticsIndex}
                  onChange={handleAnalyticsFilterChange}
                  style={styles.segmentedControl}
                />
              </View>

              {/* App Analytics Tab */}
              {activeAnalyticsTab === 'app' && (
                <View style={styles.analyticsTabContent}>
                  {/* App KPIs Grid */}
                  <View style={styles.trafficKpisGrid}>
                    <View style={styles.trafficKpiCard}>
                      <BlurView
                        glassEffectStyle="regular"
                        tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.trafficKpiContent}>
                        <View style={[styles.trafficKpiIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                          <Ionicons name="eye-outline" size={18} color="rgba(34, 197, 94, 0.9)" />
                        </View>
                        <Text style={styles.trafficKpiNumber}>8.2K</Text>
                        <Text style={styles.trafficKpiLabel}>Impresiones</Text>
                      </View>
                    </View>

                    <View style={styles.trafficKpiCard}>
                      <BlurView
                        glassEffectStyle="regular"
                        tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.trafficKpiContent}>
                        <View style={[styles.trafficKpiIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                          <Ionicons name="finger-print-outline" size={18} color="rgba(59, 130, 246, 0.9)" />
                        </View>
                        <Text style={styles.trafficKpiNumber}>1.6K</Text>
                        <Text style={styles.trafficKpiLabel}>Usuarios únicos</Text>
                      </View>
                    </View>

                    <View style={styles.trafficKpiCard}>
                      <BlurView
                        glassEffectStyle="regular"
                        tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.trafficKpiContent}>
                        <View style={[styles.trafficKpiIcon, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                          <Ionicons name="time-outline" size={18} color="rgba(168, 85, 247, 0.9)" />
                        </View>
                        <Text style={styles.trafficKpiNumber}>4:32</Text>
                        <Text style={styles.trafficKpiLabel}>Tiempo promedio</Text>
                      </View>
                    </View>

                    <View style={styles.trafficKpiCard}>
                      <BlurView
                        glassEffectStyle="regular"
                        tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.trafficKpiContent}>
                        <View style={[styles.trafficKpiIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                          <Ionicons name="trending-up-outline" size={18} color="rgba(245, 158, 11, 0.9)" />
                        </View>
                        <Text style={styles.trafficKpiNumber}>19.5%</Text>
                        <Text style={styles.trafficKpiLabel}>CTR</Text>
                      </View>
                    </View>
                  </View>

                  {/* App Traffic Chart */}
                  <View style={styles.trafficChartCard}>
                    <BlurView
                      glassEffectStyle="regular"
                      tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.trafficChartContent}>
                      <Text style={styles.trafficChartTitle}>Tráfico en app (últimos 7 días)</Text>
                      {renderAppTrafficChart()}
                    </View>
                  </View>
                </View>
              )}

              {/* Web Analytics Tab */}
              {activeAnalyticsTab === 'web' && (
                <View style={styles.analyticsTabContent}>
                  {/* Web KPIs Grid */}
                  <View style={styles.trafficKpisGrid}>
                    <View style={styles.trafficKpiCard}>
                      <BlurView
                        glassEffectStyle="regular"
                        tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.trafficKpiContent}>
                        <View style={[styles.trafficKpiIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                          <Ionicons name="eye-outline" size={18} color="rgba(34, 197, 94, 0.9)" />
                        </View>
                        <Text style={styles.trafficKpiNumber}>12.5K</Text>
                        <Text style={styles.trafficKpiLabel}>Visitas</Text>
                      </View>
                    </View>

                    <View style={styles.trafficKpiCard}>
                      <BlurView
                        glassEffectStyle="regular"
                        tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.trafficKpiContent}>
                        <View style={[styles.trafficKpiIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                          <Ionicons name="people-outline" size={18} color="rgba(59, 130, 246, 0.9)" />
                        </View>
                        <Text style={styles.trafficKpiNumber}>9.8K</Text>
                        <Text style={styles.trafficKpiLabel}>Únicos</Text>
                      </View>
                    </View>

                    <View style={styles.trafficKpiCard}>
                      <BlurView
                        glassEffectStyle="regular"
                        tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.trafficKpiContent}>
                        <View style={[styles.trafficKpiIcon, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                          <Ionicons name="link-outline" size={18} color="rgba(168, 85, 247, 0.9)" />
                        </View>
                        <Text style={styles.trafficKpiNumber}>2.3</Text>
                        <Text style={styles.trafficKpiLabel}>Páginas/sesión</Text>
                      </View>
                    </View>

                    <View style={styles.trafficKpiCard}>
                      <BlurView
                        glassEffectStyle="regular"
                        tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.trafficKpiContent}>
                        <View style={[styles.trafficKpiIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                          <Ionicons name="arrow-back-outline" size={18} color="rgba(245, 158, 11, 0.9)" />
                        </View>
                        <Text style={styles.trafficKpiNumber}>23.7%</Text>
                        <Text style={styles.trafficKpiLabel}>Rebote</Text>
                      </View>
                    </View>
                  </View>

                  {/* Web Traffic Sources */}
                  <View style={styles.trafficSourcesCard}>
                    <BlurView
                      glassEffectStyle="regular"
                      tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.trafficSourcesContent}>
                      <Text style={styles.trafficChartTitle}>Referencias de tráfico</Text>
                      {renderWebTrafficSources()}
                    </View>
                  </View>
                </View>
              )}
            </View>

          </>
        )}

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
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
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    height: 140,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  glassBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  glassMenuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
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
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    ...Typography.title2,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  errorCard: {
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    shadowColor: '#FF453A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  errorContent: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    ...Typography.body,
  },
  retryButton: {
    backgroundColor: '#FF453A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  heroCard: {
    margin: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(40, 40, 40, 1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  heroContent: {
    padding: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroTitleSection: {
    flex: 1,
  },
  chartToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  chartToggleOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    ...Typography.title1,
    letterSpacing: -1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  liveText: {
    color: 'rgba(52, 211, 153, 0.9)',
    fontSize: 12,
    fontWeight: '700',
  },
  chartSection: {
    marginTop: 8,
  },
  chartContainer: {
    position: 'relative',
    marginTop: 12,
    marginHorizontal: -24, // Compensate for heroContent padding only
  },
  chartLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    fontWeight: '600',
  },
  enhancedChart: {
    marginTop: 8,
  },
  tooltip: {
    position: 'absolute',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  tooltipContent: {
    padding: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  tooltipTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  tooltipAmount: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '800',
    marginBottom: 2,
  },
  tooltipTransactions: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  tradingTooltip: {
    position: 'absolute',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
    minWidth: 120,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tradingTooltipContent: {
    padding: 8,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  tooltipTimeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  tooltipTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    ...Typography.body,
  },
  tooltipDataSection: {
    gap: 4,
  },
  tooltipDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  tooltipLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(52, 211, 153, 0.9)',
    ...Typography.body,
  },
  tooltipValueSecondary: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  tooltipValueTertiary: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mainKpisGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  mainKpiCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(25, 25, 25, 1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  mainKpiContent: {
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainKpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mainKpiTextContainer: {
    flex: 1,
  },
  mainKpiNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  mainKpiLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  statContent: {
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.title3,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
    ...Typography.title2,
    letterSpacing: -0.5,
  },
  channelCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  channelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  channelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelDetails: {
    flex: 1,
  },
  channelName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  channelAmount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  channelPercentage: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  promoterCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'rgba(25, 25, 25, 1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  promoterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  promoterRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  promoterInfo: {
    flex: 1,
  },
  promoterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  promoterSales: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  promoterProgress: {
    width: 80,
  },
  promoterProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  promoterProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700',
  },
  transactionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  transactionTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  sourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bottomSpacer: {
    height: 120,
  },
  webAnalyticsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  webAnalyticsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  webAnalyticsContent: {
    padding: 16,
    alignItems: 'center',
  },
  webAnalyticsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  webAnalyticsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.title3,
  },
  webAnalyticsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
  },
  appAnalyticsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  appAnalyticsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appAnalyticsContent: {
    padding: 16,
    alignItems: 'center',
  },
  appAnalyticsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appAnalyticsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.title3,
  },
  appAnalyticsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
  },
  analyticsTabContainer: {
    marginBottom: 24,
  },
  segmentedControl: {
    width: '100%',
    height: 36,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitleContainer: {
    flex: 1,
  },
  fallbackIndicator: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    marginTop: 2,
    fontStyle: 'italic',
  },
  chartTypeContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
    width: '100%',
    paddingRight: 4,
  },
  chartTypeControl: {
    height: 32,
    width: 180,
  },
  dateFilterContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  dateFilterControl: {
    height: 32,
  },
  analyticsTabContent: {
    gap: 20,
  },
  trafficKpisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  trafficKpiCard: {
    width: '48%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(25, 25, 25, 1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  trafficKpiContent: {
    padding: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  trafficKpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  trafficKpiNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
    ...Typography.title3,
  },
  trafficKpiLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
  },
  trafficChartCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(25, 25, 25, 1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  trafficChartContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  trafficChartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    ...Typography.body,
  },
  appTrafficChartContainer: {
    alignItems: 'center',
  },
  trafficSourcesCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(25, 25, 25, 1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  trafficSourcesContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  trafficSourcesList: {
    gap: 16,
  },
  trafficSourceItem: {
    gap: 12,
  },
  trafficSourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trafficSourceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trafficSourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  trafficSourceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trafficSourceVisits: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  trafficSourcePercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  trafficSourceBar: {
    height: 6,
  },
  trafficSourceBarTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  trafficSourceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  analyticsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  analyticsCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 180,
  },
  analyticsContent: {
    padding: 20,
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    textAlign: 'center',
  },
  pieChart: {
    marginBottom: 12,
  },
  pieChartLegend: {
    alignItems: 'flex-start',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  hourlyCard: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  hourlyContent: {
    padding: 20,
    alignItems: 'center',
  },
  barChart: {
    backgroundColor: 'transparent',
  },
  channelsCard: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  channelsContent: {
    padding: 20,
    alignItems: 'center',
  },
  legendAmount: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    marginLeft: 8,
  },
  modernChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  pieChartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernPieChart: {
    backgroundColor: 'transparent',
  },
  modernLegend: {
    alignItems: 'flex-start',
    gap: 12,
    minWidth: '100%',
  },
  modernLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minWidth: '100%',
  },
  legendIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  legendContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  legendLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 2,
  },
  legendPercentage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  modernBarChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  modernBarChart: {
    backgroundColor: 'transparent',
  },
  // Full Width Analytics Styles
  fullWidthAnalytics: {
    paddingHorizontal: 20,
    gap: 20,
    marginBottom: 32,
  },
  demographicsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  demographicsCard: {
    flex: 1,
    maxWidth: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(25, 25, 25, 1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  demographicsContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
  },
  compactChartContainer: {
    width: '100%',
    alignItems: 'center',
  },
  enhancedChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  compactChartHeader: {
    marginBottom: 12,
    alignItems: 'center',
  },
  compactPieChart: {
    backgroundColor: 'transparent',
  },
  compactLegend: {
    width: '100%',
    gap: 6,
  },
  compactLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  compactLabel: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  compactValue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  analyticsMainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    ...Typography.title1,
    letterSpacing: -0.8,
  },
  fullWidthCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(25, 25, 25, 1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  fullWidthBlurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullWidthContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  chartHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.title3,
    letterSpacing: -0.4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  fullWidthChartContainer: {
    width: '100%',
    alignItems: 'center',
  },
  horizontalBarChart: {
    width: '100%',
    gap: 16,
    paddingBottom: 16,
  },
  horizontalBarItem: {
    width: '100%',
  },
  barLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  barValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  barTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '700',
  },
  chartContentRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  chartVisual: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthPieChart: {
    backgroundColor: 'transparent',
  },
  chartLegendFull: {
    flex: 1,
    gap: 8,
  },
  fullWidthLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  legendItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  legendIndicatorLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  legendLabelLarge: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  legendItemRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  legendValueLarge: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  legendPercentageLarge: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  fullWidthBarContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthBarChart: {
    backgroundColor: 'transparent',
  },
  // Enhanced KPI Styles
  enhancedKPISection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  kpiSectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    ...Typography.title1,
    letterSpacing: -0.8,
  },
  enhancedKPICard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 12,
  },
  enhancedKPIContent: {
    padding: 20,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  kpiIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  kpiHeaderText: {
    flex: 1,
  },
  kpiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.title3,
    letterSpacing: -0.3,
  },
  kpiSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  kpiValueSection: {
    alignItems: 'flex-start',
  },
  kpiMainValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.largeTitle,
    letterSpacing: -1,
  },
  kpiMainUnit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    marginBottom: 16,
  },
  kpiMetrics: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
  },
  kpiMetric: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  kpiMetricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiMetricValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
});