import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { Typography } from '../../../constants/fonts';

const { width, height } = Dimensions.get('window');

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

export default function TransactionSearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchTransactions();
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
  }, [id]);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, transactions]);

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const fetchTransactions = async () => {
    try {
      setError(null);
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
        throw new Error(`API Error (${response.status}): Failed to fetch transactions`);
      }

      const data: TransactionsResponse = await response.json();
      setTransactions(data.data);
      setFilteredTransactions(data.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = transactions.filter(transaction =>
      transaction.order_id.toLowerCase().includes(query) ||
      transaction.total.toString().includes(query) ||
      transaction.source.toLowerCase().includes(query) ||
      transaction.created_at_date.toLowerCase().includes(query) ||
      transaction.created_at_time.toLowerCase().includes(query)
    );

    setFilteredTransactions(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchTransactions();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const clearSearch = () => {
    setSearchQuery('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const styles = createStyles(theme, insets);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando transacciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Liquid Glass Header */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 20 }]}>
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.glassBackButton} onPress={handleGoBack}>
            <GlassView
              glassEffectStyle="regular"
              tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.glassButtonOverlay}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Transacciones</Text>
            <Text style={styles.headerSubtitle}>{transactions.length} transacciones</Text>
          </View>

          <TouchableOpacity style={styles.glassMenuButton}>
            <GlassView
              glassEffectStyle="regular"
              tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.glassButtonOverlay}>
              <Ionicons name="filter-outline" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <GlassView
            glassEffectStyle="regular"
            tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.searchContent}>
            <Ionicons name="search-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por ID, monto, fecha..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        showsVerticalScrollIndicator={false}
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
            <GlassView
              glassEffectStyle="regular"
              tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.errorContent}>
              <Ionicons name="warning-outline" size={28} color="#FF453A" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchTransactions}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!error && (
          <>
            {/* Search Results Info */}
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsText}>
                {filteredTransactions.length} de {transactions.length} transacciones
              </Text>
              {searchQuery.length > 0 && (
                <Text style={styles.searchingText}>
                  Buscando: "{searchQuery}"
                </Text>
              )}
            </View>

            {/* Transactions List */}
            {filteredTransactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {filteredTransactions.map((transaction) => (
                  <TouchableOpacity
                    key={transaction.id}
                    style={styles.transactionCard}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // Aquí puedes agregar navegación a detalle de transacción
                    }}
                  >
                    <GlassView
                      glassEffectStyle="regular"
                      tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.transactionContent}>
                      <View style={styles.transactionMain}>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionId}>{transaction.order_id}</Text>
                          <Text style={styles.transactionDateTime}>
                            {transaction.created_at_date} • {transaction.created_at_time}
                          </Text>
                        </View>

                        <View style={styles.transactionRight}>
                          <Text style={styles.transactionTotal}>{formatCurrency(transaction.total)}</Text>
                          <View style={[styles.sourceBadge, {
                            backgroundColor: transaction.source === 'app' ? '#007AFF20' :
                                            transaction.source === 'web' ? '#34C75920' : '#FF950020'
                          }]}>
                            <Text style={[styles.sourceText, {
                              color: transaction.source === 'app' ? '#007AFF' :
                                     transaction.source === 'web' ? '#34C759' : '#FF9500'
                            }]}>
                              {transaction.source.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Status indicator */}
                      <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, {
                          backgroundColor: transaction.status === 'completed' ? '#34C759' :
                                          transaction.status === 'pending' ? '#FF9500' : '#FF453A'
                        }]} />
                        <Text style={styles.statusText}>
                          {transaction.status === 'completed' ? 'Completada' :
                           transaction.status === 'pending' ? 'Pendiente' : 'Fallida'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.emptyTitle}>
                  {searchQuery.length > 0 ? 'No se encontraron transacciones' : 'No hay transacciones'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery.length > 0
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Las transacciones aparecerán aquí cuando se registren'
                  }
                </Text>
              </View>
            )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 150,
    paddingBottom: 20,
    zIndex: 5,
  },
  searchBar: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    ...Typography.body,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 20,
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
  resultsInfo: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  searchingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  transactionsList: {
    paddingHorizontal: 20,
  },
  transactionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionContent: {
    padding: 20,
  },
  transactionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  transactionDateTime: {
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 120,
  },
});