import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { Typography } from '../../constants/fonts';
import { SaleRecord } from '../../lib/api';

export default function DetalleVentaScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Parse the sale data from params
  const saleData: SaleRecord = params.sale ? JSON.parse(params.sale as string) : null;

  if (!saleData) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#ffffff', textAlign: 'center', marginTop: 100 }}>
          Error: No se pudo cargar la información de la venta
        </Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Fecha no disponible';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const shareContent = `
🧾 FACTURA DE VENTA - HUNT

📋 Orden: ${saleData.order_id}
🆔 ID Transacción: ${saleData.transaction_id}

👤 Cliente: ${saleData.user_name}
📧 Email: ${saleData.user_email}

🎫 Ticket: ${saleData.ticket_name}
📊 Cantidad: ${saleData.quantity}

💰 Total: ${formatCurrency(saleData.total)}
💳 Método de pago: ${saleData.payment}

📅 Fecha: ${formatDateTime(saleData.updated_at || saleData.created_at)}

Generado con Hunt App
    `.trim();

    try {
      await Share.share({
        message: shareContent,
        title: 'Factura de Venta',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const styles = createStyles(theme, insets);

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.gradientOverlay}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalle de Venta</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={22} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Header */}
        <View style={styles.receiptHeader}>
          <View style={styles.receiptTitle}>
            <Ionicons name="receipt" size={28} color="#ffffff" />
            <Text style={styles.receiptTitleText}>Recibo de Venta</Text>
          </View>
          <Text style={styles.receiptId}>#{saleData.transaction_id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.receiptDate}>{formatDateTime(saleData.updated_at || saleData.created_at)}</Text>
        </View>

        {/* Customer Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerHeader}>
            <Ionicons name="person-circle" size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.customerTitle}>Cliente</Text>
          </View>
          <Text style={styles.customerName}>{saleData.user_name}</Text>
          <Text style={styles.customerEmail}>{saleData.user_email}</Text>
        </View>

        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productHeader}>
            <Ionicons name="ticket" size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.productTitle}>Producto</Text>
          </View>
          <View style={styles.productDetails}>
            <View style={styles.productLeft}>
              <Text style={styles.productName}>{saleData.ticket_name}</Text>
              <Text style={styles.productQuantity}>{saleData.quantity}</Text>
            </View>
            <Text style={styles.productPrice}>{formatCurrency(saleData.total)}</Text>
          </View>
        </View>

        {/* Payment Card */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <Ionicons name="card" size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.paymentTitle}>Pago</Text>
          </View>
          <View style={styles.paymentDetails}>
            <View style={styles.paymentMethod}>
              <Ionicons
                name={saleData.payment === 'Efectivo' ? 'cash' : 'link'}
                size={18}
                color="#ffffff"
              />
              <Text style={styles.paymentMethodText}>{saleData.payment}</Text>
            </View>
            <Text style={styles.paymentAmount}>{formatCurrency(saleData.total)}</Text>
          </View>
        </View>

        {/* Transaction Info */}
        <View style={styles.transactionCard}>
          <Text style={styles.transactionTitle}>Información de Transacción</Text>
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>ID de Orden</Text>
            <Text style={styles.transactionValue}>{saleData.order_id}</Text>
          </View>
          <View style={styles.transactionRow}>
            <Text style={styles.transactionLabel}>ID de Transacción</Text>
            <Text style={styles.transactionValue}>{saleData.transaction_id}</Text>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
          <Text style={styles.successTitle}>¡Venta Completada!</Text>
          <Text style={styles.successSubtext}>El recibo ha sido generado exitosamente</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: insets.top + 15,
    paddingBottom: 20,
    zIndex: 100,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    ...Typography.title3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: insets.bottom + 40,
  },

  // Receipt Header
  receiptHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 24,
  },
  receiptTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  receiptTitleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    ...Typography.title1,
  },
  receiptId: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    ...Typography.title3,
  },
  receiptDate: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    ...Typography.subheadline,
  },

  // Customer Card
  customerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  customerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    ...Typography.headline,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    ...Typography.title3,
  },
  customerEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    ...Typography.subheadline,
  },

  // Product Card
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    ...Typography.headline,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    ...Typography.title3,
  },
  productQuantity: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    ...Typography.subheadline,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    ...Typography.title2,
  },

  // Payment Card
  paymentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    ...Typography.headline,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    ...Typography.body,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    ...Typography.title2,
  },

  // Transaction Card
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    ...Typography.headline,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    ...Typography.subheadline,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    ...Typography.body,
  },

  // Success Card
  successCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
    ...Typography.title2,
  },
  successSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    ...Typography.subheadline,
  },
});