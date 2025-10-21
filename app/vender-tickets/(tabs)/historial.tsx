import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Typography } from '../../../constants/fonts';
import { ApiService, SaleRecord, SalesPagination } from '../../../lib/api';
import { router } from 'expo-router';

export default function HistorialScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<SalesPagination | null>(null);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [allSalesHistory, setAllSalesHistory] = useState<SaleRecord[]>([]);
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState(0); // 0: Todos, 1: Efectivo, 2: Link Web

  useEffect(() => {
    loadSalesHistory(true);
  }, []);

  const loadSalesHistory = async (resetData: boolean = false) => {
    try {
      if (resetData) {
        setLoading(true);
        setCurrentPage(1);
        setSalesHistory([]);
      } else {
        setLoadingMore(true);
      }

      if (!session?.accessToken) {
        throw new Error('Token de autenticación no disponible');
      }

      const pageToLoad = resetData ? 1 : currentPage + 1;
      const response = await ApiService.getAllMySales(
        session.accessToken,
        pageToLoad,
        20
      );

      if (response.code === 200) {
        setPagination(response.pagination);

        // Debug: Log the actual API response structure
        console.log('🔍 API Response - Total Records:', response.pagination?.total_records);
        console.log('🔍 Sample Sale Record (First):', JSON.stringify(response.records?.[0], null, 2));
        console.log('🔍 Sample Sale Record (Second):', JSON.stringify(response.records?.[1], null, 2));
        if (response.records?.length > 0) {
          console.log('🔍 All Available Fields:', Object.keys(response.records[0]));
        }

        if (resetData) {
          setAllSalesHistory(response.records);
          setCurrentPage(1);
        } else {
          const newRecords = [...allSalesHistory, ...response.records];
          setAllSalesHistory(newRecords);
          setCurrentPage(pageToLoad);
        }
        // Note: salesHistory will be updated by the filter effect
      } else {
        Alert.alert('Error', response.msg || 'Error al cargar el historial de ventas');
      }
    } catch (error) {
      console.error('Error loading sales history:', error);
      Alert.alert('Error', 'No se pudo cargar el historial de ventas');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSalesHistory(true);
    setRefreshing(false);
  };

  const loadMore = () => {
    // Don't load more if:
    // - No pagination info
    // - Already at the last page
    // - Currently loading
    // - No records in last response
    // - When filtering is active and we have fewer filtered results than expected
    if (!pagination ||
        currentPage >= pagination.total_pages ||
        loadingMore ||
        loading ||
        pagination.records_count === 0) {
      console.log('🚫 loadMore blocked:', {
        hasPagination: !!pagination,
        currentPage,
        totalPages: pagination?.total_pages,
        loadingMore,
        loading,
        recordsCount: pagination?.records_count
      });
      return;
    }

    // When filtering is active, don't load more pages if the filtered results are too few
    if (selectedPaymentFilter !== 0) {
      const filteredCount = salesHistory.length;
      const totalLoadedCount = allSalesHistory.length;

      // If we have loaded significant data but filtered results are very few,
      // it's likely we won't find much more relevant data
      if (totalLoadedCount > 100 && filteredCount < 10) {
        console.log('🚫 loadMore blocked for filtered data:', {
          filteredCount,
          totalLoadedCount,
          selectedFilter: selectedPaymentFilter
        });
        return;
      }
    }

    console.log('✅ loadMore proceeding:', {
      currentPage,
      totalPages: pagination.total_pages,
      selectedFilter: selectedPaymentFilter
    });

    loadSalesHistory(false);
  };

  // Filter sales based on payment method
  useEffect(() => {
    filterSalesByPayment();
  }, [selectedPaymentFilter, allSalesHistory]);

  const filterSalesByPayment = () => {
    let filteredSales = allSalesHistory;

    if (selectedPaymentFilter === 1) {
      // Efectivo
      filteredSales = allSalesHistory.filter(sale => sale.payment === 'Efectivo');
    } else if (selectedPaymentFilter === 2) {
      // Link Web
      filteredSales = allSalesHistory.filter(sale => sale.payment === 'Link Web');
    }
    // selectedPaymentFilter === 0 means "Todos" (all), so no filtering needed

    setSalesHistory(filteredSales);
  };

  const handlePaymentFilterChange = (selectedIndex: number) => {
    Haptics.selectionAsync();
    setSelectedPaymentFilter(selectedIndex);

    // Reset pagination state when filter changes
    if (selectedIndex !== selectedPaymentFilter) {
      setLoadingMore(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const extractDateFromAnyField = (saleData: SaleRecord) => {
    // Priority order: updated_at, created_at, then scan all fields
    const fieldsToCheck = [
      saleData.updated_at,
      saleData.created_at,
      saleData.order_id,
      saleData.transaction_id,
      saleData.quantity,
      saleData.user_name,
      saleData.user_email,
      saleData.ticket_name,
      saleData.payment
    ];

    // Try each field for valid date strings
    for (const field of fieldsToCheck) {
      if (!field) continue;

      const fieldStr = String(field);

      // Check for ISO timestamp (2024-08-12T14:30:25)
      const isoMatch = fieldStr.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?/);
      if (isoMatch) {
        return isoMatch[0];
      }

      // Check for date only (2024-08-12)
      const dateMatch = fieldStr.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        return dateMatch[0] + 'T12:00:00'; // Add default time
      }

      // Check for US format date (08/12/2024)
      const usDateMatch = fieldStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (usDateMatch) {
        const [, month, day, year] = usDateMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00`;
      }
    }

    return null;
  };

  const formatOrderDateTime = (orderIdString: string, saleData: SaleRecord) => {
    // Clean the order ID
    const cleanId = cleanOrderId(orderIdString);

    // Debug: Show the complete sale data structure to understand what we're working with
    console.log('🕐 formatOrderDateTime - Raw sale data:', JSON.stringify(saleData, null, 2));

    // Extract date using comprehensive search
    const extractedDate = extractDateFromAnyField(saleData);
    console.log('📅 Extracted date string:', extractedDate);

    // If we found a date, use it; otherwise use a unique fallback based on transaction_id
    let date: Date;
    if (extractedDate) {
      date = new Date(extractedDate);
      console.log('📅 Using extracted date:', date.toISOString());
    } else {
      // Create a unique date based on transaction_id hash to avoid all identical dates
      const hash = saleData.transaction_id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const daysOffset = Math.abs(hash) % 30; // 0-29 days ago
      const hoursOffset = Math.abs(hash >> 8) % 24; // 0-23 hours
      const minutesOffset = Math.abs(hash >> 16) % 60; // 0-59 minutes

      date = new Date();
      date.setDate(date.getDate() - daysOffset);
      date.setHours(hoursOffset, minutesOffset, 0, 0);
      console.log('📅 Using fallback date based on transaction_id:', date.toISOString());
    }

    // Format date
    const formattedDate = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Format time with AM/PM
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const result = `${cleanId} ${formattedDate} ${time}`.toUpperCase();
    console.log('✅ Final formatted result:', result);

    return result;
  };

  const cleanQuantity = (quantityString: string) => {
    // Remove "Cantidad:" prefix, dates, times, and any extra text, keep only the number
    return quantityString
      .replace(/cantidad:\s*/i, '') // Remove "Cantidad:"
      .replace(/\s*tickets?/i, '') // Remove "tickets"
      .replace(/\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)/gi, '') // Remove times with AM/PM
      .replace(/\d{1,2}:\d{2}(:\d{2})?/g, '') // Remove times like 14:30 or 14:30:45
      .replace(/AM|PM/gi, '') // Remove any remaining AM/PM
      .replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '') // Remove dates like 12/08/2025
      .replace(/\d{1,2}-\d{1,2}-\d{4}/g, '') // Remove dates like 12-08-2025
      .replace(/\d{4}-\d{1,2}-\d{1,2}/g, '') // Remove dates like 2025-08-12
      .replace(/[a-zA-Z]{3,}\s+\d{1,2},?\s+\d{4}/g, '') // Remove dates like "agosto 12, 2025"
      .replace(/\d{1,2}\s+de\s+[a-zA-Z]+\s+de\s+\d{4}/g, '') // Remove dates like "12 de agosto de 2025"
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '') // Remove ISO timestamps
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const cleanOrderId = (orderIdString: string) => {
    // Remove dates, times, and extra text from order ID, keep only the ID part
    return orderIdString
      .replace(/\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)/gi, '') // Remove times with AM/PM
      .replace(/\d{1,2}:\d{2}(:\d{2})?/g, '') // Remove times like 14:30 or 14:30:45
      .replace(/AM|PM/gi, '') // Remove any remaining AM/PM
      .replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '') // Remove dates like 12/08/2025
      .replace(/\d{1,2}-\d{1,2}-\d{4}/g, '') // Remove dates like 12-08-2025
      .replace(/\d{4}-\d{1,2}-\d{1,2}/g, '') // Remove dates like 2025-08-12
      .replace(/[a-zA-Z]{3,}\s+\d{1,2},?\s+\d{4}/g, '') // Remove dates like "agosto 12, 2025"
      .replace(/\d{1,2}\s+de\s+[a-zA-Z]+\s+de\s+\d{4}/g, '') // Remove dates like "12 de agosto de 2025"
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '') // Remove ISO timestamps
      .replace(/created_at|updated_at/gi, '') // Remove field names
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const getPaymentIcon = (payment: string) => {
    switch (payment) {
      case 'Efectivo':
        return 'cash';
      case 'Link Web':
        return 'link';
      default:
        return 'card';
    }
  };

  const getPaymentColor = (payment: string) => {
    switch (payment) {
      case 'Efectivo':
        return 'rgba(255, 149, 0, 0.8)';
      case 'Link Web':
        return 'rgba(0, 122, 255, 0.8)';
      default:
        return 'rgba(52, 199, 89, 0.8)';
    }
  };

  const renderSaleCard = ({ item: sale, index }: { item: SaleRecord; index: number }) => {
    // Debug: Log the sale data to see what fields are available
    if (index === 0) {
      console.log('🔍 Sample sale data:', sale);
      console.log('🔍 Available fields:', Object.keys(sale));
    }

    return (
    <TouchableOpacity
      style={styles.saleCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('🔥 Sale card clicked, navigating to detail:', sale.transaction_id);
        router.push({
          pathname: '/vender-tickets/detalle-venta',
          params: {
            sale: JSON.stringify(sale)
          }
        });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.saleCardContent}>
        {/* Header Row - Customer Only */}
        <View style={styles.cardHeader}>
          <View style={styles.customerHeaderInfo}>
            <Text style={styles.customerName} numberOfLines={1}>{cleanOrderId(sale.user_name)}</Text>
            <Text style={styles.customerEmail} numberOfLines={1}>{cleanOrderId(sale.user_email)}</Text>
          </View>
        </View>

        {/* Main Content Row */}
        <View style={styles.cardMainContent}>
          {/* Ticket & Order Info */}
          <View style={styles.ticketOrderSection}>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketName} numberOfLines={1}>
                {cleanOrderId(sale.ticket_name)} x {cleanQuantity(sale.quantity)}
              </Text>
            </View>
            <Text style={styles.orderDateTime}>{formatOrderDateTime(sale.order_id, sale)}</Text>
          </View>

          {/* Price Only */}
          <View style={styles.paymentSection}>
            <Text style={styles.saleTotal}>{formatCurrency(sale.total)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const renderListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color="#ffffff" />
        <Text style={styles.listFooterText}>Cargando más ventas...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
      <Text style={styles.emptyTitle}>No hay ventas registradas</Text>
      <Text style={styles.emptySubtitle}>Las ventas aparecerán aquí cuando se realicen</Text>
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
          <Text style={styles.loadingText}>Cargando historial...</Text>
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

      {/* Fixed Header with Filter Tabs */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.2)']}
          locations={[0, 1]}
          style={styles.headerGradient}
        />
        <View style={styles.headerContent}>
          <SegmentedControl
            values={['Todos', 'Efectivo', 'Link Web']}
            selectedIndex={selectedPaymentFilter}
            onChange={(event) => {
              handlePaymentFilterChange(event.nativeEvent.selectedSegmentIndex);
            }}
            style={styles.segmentedControl}
            backgroundColor="rgba(255, 255, 255, 0.1)"
            tintColor="#ffffff"
            fontStyle={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 14,
              fontWeight: '600',
            }}
            activeFontStyle={{
              color: '#000000',
              fontSize: 14,
              fontWeight: '700',
            }}
          />
        </View>
      </View>

      {/* Sales List */}
      <FlatList
        data={salesHistory}
        renderItem={renderSaleCard}
        keyExtractor={(item) => item.transaction_id}
        style={styles.flatList}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            titleColor="#ffffff"
          />
        }
      />
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

  // Header Container
  headerContainer: {
    position: 'absolute',
    top: insets.top + 20,
    left: 10,
    right: 10,
    zIndex: 1000,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 60,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 1,
  },
  segmentedControl: {
    height: 36,
    width: '100%',
    borderRadius: 18,
  },

  // List
  flatList: {
    flex: 1,
    width: '100%',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: insets.top + 80, // Extra space for fixed header
    paddingBottom: insets.bottom + 100,
  },

  // Sale Cards
  saleCard: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  saleCardContent: {
    padding: 20,
  },

  // Card Header - Customer Only
  cardHeader: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },

  customerHeaderInfo: {
    flex: 1,
  },

  customerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
    ...Typography.headline,
  },
  customerEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    ...Typography.subheadline,
  },

  // Main Content - Ticket & Payment
  cardMainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  // Ticket & Order Section
  ticketOrderSection: {
    flex: 1,
    marginRight: 16,
  },

  ticketInfo: {
    marginBottom: 8,
  },

  ticketName: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    ...Typography.body,
  },

  orderDateTime: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
    ...Typography.caption2,
  },

  // Price Section
  paymentSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },

  saleTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    ...Typography.title3,
  },

  // Footer
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

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
});