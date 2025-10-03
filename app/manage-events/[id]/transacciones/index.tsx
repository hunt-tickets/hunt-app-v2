import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../../../contexts/ThemeContext';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

interface Transaction {
  id: number;
  tipo: 'venta' | 'reembolso' | 'transferencia';
  descripcion: string;
  monto: number;
  fecha: string;
  hora: string;
  vendedor: string;
  metodo: string;
  estado: 'completada' | 'pendiente' | 'cancelada';
}

export default function TransaccionesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };
  const [searchText, setSearchText] = useState((params.q as string) || '');
  const [selectedFilter, setSelectedFilter] = useState(0);

  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      tipo: 'venta',
      descripcion: '2 entradas VIP - MARÍA HELENA AMADOR',
      monto: 50000,
      fecha: '2024-10-02',
      hora: '14:30',
      vendedor: 'Ana García',
      metodo: 'Tarjeta de crédito',
      estado: 'completada',
    },
    {
      id: 2,
      tipo: 'venta',
      descripcion: '1 entrada General - MARÍA HELENA AMADOR',
      monto: 25000,
      fecha: '2024-10-02',
      hora: '13:45',
      vendedor: 'Carlos Rodríguez',
      metodo: 'Efectivo',
      estado: 'completada',
    },
    {
      id: 3,
      tipo: 'reembolso',
      descripcion: 'Reembolso entrada VIP',
      monto: -25000,
      fecha: '2024-10-02',
      hora: '12:15',
      vendedor: 'Sistema',
      metodo: 'Tarjeta de crédito',
      estado: 'completada',
    },
    {
      id: 4,
      tipo: 'venta',
      descripcion: '3 entradas Estudiante - MARÍA HELENA AMADOR',
      monto: 33000,
      fecha: '2024-10-02',
      hora: '11:20',
      vendedor: 'María López',
      metodo: 'Tarjeta de débito',
      estado: 'pendiente',
    },
    {
      id: 5,
      tipo: 'transferencia',
      descripcion: 'Transferencia entre vendedores',
      monto: 15000,
      fecha: '2024-10-01',
      hora: '16:30',
      vendedor: 'Luis Fernández',
      metodo: 'Transferencia',
      estado: 'completada',
    },
  ]);

  const filters = ['Todas', 'Ventas', 'Reembolsos', 'Transferencias'];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.descripcion.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.vendedor.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.metodo.toLowerCase().includes(searchText.toLowerCase());

    const matchesFilter =
      selectedFilter === 0 ||
      (selectedFilter === 1 && transaction.tipo === 'venta') ||
      (selectedFilter === 2 && transaction.tipo === 'reembolso') ||
      (selectedFilter === 3 && transaction.tipo === 'transferencia');

    return matchesSearch && matchesFilter;
  });

  const handleFilterChange = (event: any) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setSelectedFilter(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getTransactionIcon = (tipo: string) => {
    switch (tipo) {
      case 'venta': return 'arrow-up';
      case 'reembolso': return 'arrow-down';
      case 'transferencia': return 'swap-horizontal';
      default: return 'document';
    }
  };

  const getTransactionColor = (tipo: string) => {
    switch (tipo) {
      case 'venta': return '#34C759';
      case 'reembolso': return '#FF3B30';
      case 'transferencia': return '#007AFF';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completada': return '#34C759';
      case 'pendiente': return '#FF9500';
      case 'cancelada': return '#FF3B30';
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'completada': return 'Completada';
      case 'pendiente': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      default: return '';
    }
  };

  useEffect(() => {
    if (params.q) {
      setSearchText(params.q as string);
    }
  }, [params.q]);

  const styles = createStyles(theme);

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

      {/* Search Query Display */}
      {searchText ? (
        <View style={styles.searchContainer}>
          <Text style={styles.searchQuery}>Buscando: "{searchText}"</Text>
        </View>
      ) : null}

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <SegmentedControl
          values={filters}
          selectedIndex={selectedFilter}
          onChange={handleFilterChange}
          style={styles.segmentedControl}
        />
      </View>

      {/* Results Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {filteredTransactions.length} transacciones encontradas
        </Text>
        <Text style={styles.totalAmount}>
          Total: ₡{filteredTransactions.reduce((sum, t) => sum + t.monto, 0).toLocaleString()}
        </Text>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Handle transaction details
              }}
            >
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIconContainer}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: getTransactionColor(transaction.tipo) }
                  ]}>
                    <Ionicons
                      name={getTransactionIcon(transaction.tipo)}
                      size={20}
                      color="#ffffff"
                    />
                  </View>
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>{transaction.descripcion}</Text>
                  <Text style={styles.transactionDetails}>
                    {transaction.vendedor} • {transaction.metodo}
                  </Text>
                </View>

                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.amountText,
                    { color: transaction.monto > 0 ? '#34C759' : '#FF3B30' }
                  ]}>
                    {transaction.monto > 0 ? '+' : ''}₡{Math.abs(transaction.monto).toLocaleString()}
                  </Text>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(transaction.estado) }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(transaction.estado) }
                    ]}>
                      {getStatusLabel(transaction.estado)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.transactionFooter}>
                <Text style={styles.transactionTime}>
                  {transaction.fecha} • {transaction.hora}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No hay transacciones</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchText ? 'No se encontraron resultados para tu búsqueda' : 'No hay transacciones registradas'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
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
  backButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  searchQuery: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  segmentedControl: {
    width: '100%',
    height: 36,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  transactionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  transactionDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  transactionFooter: {
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  transactionTime: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
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