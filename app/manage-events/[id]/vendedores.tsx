import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { Typography } from '../../../constants/fonts';

interface Seller {
  id: number;
  name: string;
  email: string;
  totalSales: number;
  commission: number;
  status: 'active' | 'inactive';
  lastSale: string;
}

export default function VendedoresScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const handleSellerPress = (seller: Seller) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Vendedor', `Detalles de ${seller.name}`);
  };

  const [sellers] = useState<Seller[]>([
    {
      id: 1,
      name: 'Ana García',
      email: 'ana.garcia@email.com',
      totalSales: 45,
      commission: 112500,
      status: 'active',
      lastSale: 'Hace 2 horas',
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      totalSales: 32,
      commission: 80000,
      status: 'active',
      lastSale: 'Hace 5 horas',
    },
    {
      id: 3,
      name: 'María López',
      email: 'maria.lopez@email.com',
      totalSales: 28,
      commission: 70000,
      status: 'inactive',
      lastSale: 'Hace 2 días',
    },
    {
      id: 4,
      name: 'Luis Fernández',
      email: 'luis.fernandez@email.com',
      totalSales: 19,
      commission: 47500,
      status: 'active',
      lastSale: 'Hace 1 hora',
    },
  ]);

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a1a', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header with Billetera Style */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 20 }]}>
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Vendedores</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen Total</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sellers.filter(s => s.status === 'active').length}</Text>
              <Text style={styles.summaryLabel}>Vendedores Activos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sellers.reduce((sum, s) => sum + s.totalSales, 0)}</Text>
              <Text style={styles.summaryLabel}>Ventas Totales</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>₡{(sellers.reduce((sum, s) => sum + s.commission, 0) / 1000).toFixed(0)}K</Text>
              <Text style={styles.summaryLabel}>Comisiones</Text>
            </View>
          </View>
        </View>

        {/* Simple Sellers List */}
        <View style={styles.sellersSection}>
          <Text style={styles.sectionTitle}>Lista de Vendedores</Text>
          {sellers.map((seller) => (
            <TouchableOpacity
              key={seller.id}
              style={styles.sellerRow}
              onPress={() => handleSellerPress(seller)}
            >
              <View style={styles.sellerLeft}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.avatarText}>{seller.name.charAt(0)}</Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{seller.name}</Text>
                  <Text style={styles.sellerSubtitle}>{seller.totalSales} ventas • ₡{(seller.commission / 1000).toFixed(0)}K</Text>
                </View>
              </View>
              <View style={[styles.statusDot, { backgroundColor: seller.status === 'active' ? '#34C759' : '#FF3B30' }]} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    height: 140,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    ...Typography.title1,
  },
  headerSpacer: {
    width: 24,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 140,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  sellersSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  sellerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  sellerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});