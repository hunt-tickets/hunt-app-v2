import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { Typography } from '../../../constants/fonts';

const { width } = Dimensions.get('window');

interface Ticket {
  id: number;
  name: string;
  price: number;
  soldCount: number;
  totalCount: number;
  maxTime: string;
  status: 'active' | 'sold_out' | 'expired';
  description: string;
}

interface Product {
  id: number;
  name: string;
  category: 'bar' | 'merchandise';
  price: number;
  stock: number;
  soldCount: number;
  status: 'available' | 'out_of_stock';
  description: string;
}

export default function ProductosScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<'tickets' | 'products'>('tickets');

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const [tickets] = useState<Ticket[]>([
    {
      id: 1,
      name: 'General',
      price: 25000,
      soldCount: 150,
      totalCount: 300,
      maxTime: '23:30',
      status: 'active',
      description: 'Entrada general al evento'
    },
    {
      id: 2,
      name: 'VIP',
      price: 45000,
      soldCount: 45,
      totalCount: 50,
      maxTime: '23:30',
      status: 'active',
      description: 'Entrada VIP con acceso especial'
    },
    {
      id: 3,
      name: 'Early Bird',
      price: 20000,
      soldCount: 100,
      totalCount: 100,
      maxTime: '20:00',
      status: 'sold_out',
      description: 'Entrada anticipada con descuento'
    }
  ]);

  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'Cerveza Nacional',
      category: 'bar',
      price: 8000,
      stock: 200,
      soldCount: 45,
      status: 'available',
      description: 'Cerveza nacional 330ml'
    },
    {
      id: 2,
      name: 'Whisky Premium',
      category: 'bar',
      price: 25000,
      stock: 50,
      soldCount: 12,
      status: 'available',
      description: 'Whisky premium por copa'
    },
    {
      id: 3,
      name: 'Camiseta del Evento',
      category: 'merchandise',
      price: 35000,
      stock: 0,
      soldCount: 25,
      status: 'out_of_stock',
      description: 'Camiseta oficial del evento'
    },
    {
      id: 4,
      name: 'Gorra Oficial',
      category: 'merchandise',
      price: 28000,
      stock: 15,
      soldCount: 8,
      status: 'available',
      description: 'Gorra oficial del evento'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-CO')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return '#34C759';
      case 'sold_out':
      case 'out_of_stock':
        return '#FF453A';
      case 'expired':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'available': return 'Disponible';
      case 'sold_out': return 'Agotado';
      case 'out_of_stock': return 'Sin Stock';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const renderTicketCard = (ticket: Ticket) => (
    <TouchableOpacity
      key={ticket.id}
      style={[styles.card, { backgroundColor: theme.cardBackground }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Ticket', `Detalles de ${ticket.name}`);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={[styles.cardName, { color: theme.text }]}>{ticket.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
            <Text style={styles.statusText}>{getStatusText(ticket.status)}</Text>
          </View>
        </View>
        <Text style={[styles.cardPrice, { color: theme.accent }]}>{formatCurrency(ticket.price)}</Text>
      </View>

      <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>{ticket.description}</Text>

      <View style={styles.ticketStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Vendidos</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{ticket.soldCount}/{ticket.totalCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Hora máx.</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{ticket.maxTime}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Ingresos</Text>
          <Text style={[styles.statValue, { color: theme.accent }]}>
            {formatCurrency(ticket.soldCount * ticket.price)}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: getStatusColor(ticket.status),
                width: `${(ticket.soldCount / ticket.totalCount) * 100}%`
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {Math.round((ticket.soldCount / ticket.totalCount) * 100)}% vendido
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={[styles.card, { backgroundColor: theme.cardBackground }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Producto', `Detalles de ${product.name}`);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={[styles.cardName, { color: theme.text }]}>{product.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: product.category === 'bar' ? '#007AFF' : '#AF52DE' }]}>
            <Text style={styles.categoryText}>
              {product.category === 'bar' ? 'Barra' : 'Mercancía'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(product.status) }]}>
            <Text style={styles.statusText}>{getStatusText(product.status)}</Text>
          </View>
        </View>
        <Text style={[styles.cardPrice, { color: theme.accent }]}>{formatCurrency(product.price)}</Text>
      </View>

      <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>{product.description}</Text>

      <View style={styles.productStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Stock</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{product.stock}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Vendidos</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{product.soldCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Ingresos</Text>
          <Text style={[styles.statValue, { color: theme.accent }]}>
            {formatCurrency(product.soldCount * product.price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const totalTicketRevenue = tickets.reduce((sum, ticket) => sum + (ticket.soldCount * ticket.price), 0);
  const totalProductRevenue = products.reduce((sum, product) => sum + (product.soldCount * product.price), 0);

  return (
    <>
      <StatusBar style="light" />
      <LinearGradient
        colors={theme.gradientColors || ['#1a1a1a', '#2d2d2d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Productos</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Category Selector */}
        <View style={styles.categorySelector}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'tickets' && styles.categoryButtonActive
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory('tickets');
            }}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'tickets' && styles.categoryButtonTextActive
            ]}>
              Tickets
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'products' && styles.categoryButtonActive
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory('products');
            }}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'products' && styles.categoryButtonTextActive
            ]}>
              Productos
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedCategory === 'tickets' ? (
            <View style={styles.section}>
              {/* Tickets Header */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Gestión de Tickets</Text>
                  <Text style={styles.sectionSubtitle}>
                    {tickets.length} tipos de tickets • {formatCurrency(totalTicketRevenue)} ingresos
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert('Agregar Ticket', 'Funcionalidad próximamente');
                  }}
                >
                  <Ionicons name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Tickets List */}
              <View style={styles.cardsList}>
                {tickets.map(renderTicketCard)}
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              {/* Products Header */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Gestión de Productos</Text>
                  <Text style={styles.sectionSubtitle}>
                    {products.length} productos • {formatCurrency(totalProductRevenue)} ingresos
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert('Agregar Producto', 'Funcionalidad próximamente');
                  }}
                >
                  <Ionicons name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Product Categories */}
              <View style={styles.productCategories}>
                <View style={styles.categoryCard}>
                  <View style={styles.categoryCardHeader}>
                    <Ionicons name="wine" size={24} color="#007AFF" />
                    <Text style={[styles.categoryCardTitle, { color: theme.text }]}>Productos de Barra</Text>
                  </View>
                  <Text style={[styles.categoryCardCount, { color: theme.textSecondary }]}>
                    {products.filter(p => p.category === 'bar').length} productos
                  </Text>
                </View>

                <View style={styles.categoryCard}>
                  <View style={styles.categoryCardHeader}>
                    <Ionicons name="shirt" size={24} color="#AF52DE" />
                    <Text style={[styles.categoryCardTitle, { color: theme.text }]}>Mercancía</Text>
                  </View>
                  <Text style={[styles.categoryCardCount, { color: theme.textSecondary }]}>
                    {products.filter(p => p.category === 'merchandise').length} productos
                  </Text>
                </View>
              </View>

              {/* Products List */}
              <View style={styles.cardsList}>
                {products.map(renderProductCard)}
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    ...Typography.heading,
  },
  placeholder: {
    width: 40,
  },
  categorySelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    ...Typography.heading,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCategories: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  categoryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCardCount: {
    fontSize: 14,
  },
  cardsList: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    ...Typography.heading,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: '700',
    ...Typography.heading,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  ticketStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
});