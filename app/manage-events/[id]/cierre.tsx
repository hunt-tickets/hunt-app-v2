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
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme, Theme } from '../../../contexts/ThemeContext';

interface CierreData {
  totalIngresos: number;
  totalVentas: number;
  comisiones: number;
  gastos: number;
  utilidad: number;
  metodoPago: { tipo: string; monto: number; porcentaje: number }[];
  resumenVentas: { categoria: string; ventas: number; monto: number }[];
}

export default function CierreScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [eventClosed, setEventClosed] = useState(false);

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const cierreData: CierreData = {
    totalIngresos: 6125000,
    totalVentas: 245,
    comisiones: 390000,
    gastos: 450000,
    utilidad: 5285000,
    metodoPago: [
      { tipo: 'Tarjeta de crédito', monto: 3675000, porcentaje: 60 },
      { tipo: 'Tarjeta de débito', monto: 1837500, porcentaje: 30 },
      { tipo: 'Efectivo', monto: 612500, porcentaje: 10 },
    ],
    resumenVentas: [
      { categoria: 'General', ventas: 150, monto: 3750000 },
      { categoria: 'VIP', ventas: 70, monto: 2100000 },
      { categoria: 'Estudiante', ventas: 25, monto: 275000 },
    ],
  };

  const handleCloseEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Cerrar Evento',
      '¿Estás seguro que deseas cerrar este evento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Evento',
          style: 'destructive',
          onPress: () => {
            setEventClosed(true);
            Alert.alert('Evento Cerrado', 'El evento ha sido cerrado exitosamente');
          },
        },
      ]
    );
  };

  const handleGenerateReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Generar Reporte', 'Funcionalidad próximamente');
  };

  const handleExportData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Exportar Datos', 'Funcionalidad próximamente');
  };

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
        <View style={[styles.statusBadge, { backgroundColor: eventClosed ? '#FF3B30' : '#34C759' }]}>
          <Text style={styles.statusText}>{eventClosed ? 'CERRADO' : 'ACTIVO'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Resumen Financiero */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Financiero</Text>

          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Ingresos Totales</Text>
              <Text style={styles.financialValue}>₡{cierreData.totalIngresos.toLocaleString()}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Comisiones</Text>
              <Text style={[styles.financialValue, { color: '#FF9500' }]}>-₡{cierreData.comisiones.toLocaleString()}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Gastos</Text>
              <Text style={[styles.financialValue, { color: '#FF3B30' }]}>-₡{cierreData.gastos.toLocaleString()}</Text>
            </View>
            <View style={[styles.financialRow, styles.financialTotal]}>
              <Text style={styles.financialTotalLabel}>Utilidad Neta</Text>
              <Text style={styles.financialTotalValue}>₡{cierreData.utilidad.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Métodos de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métodos de Pago</Text>
          <View style={styles.paymentMethodsCard}>
            {cierreData.metodoPago.map((metodo, index) => (
              <View key={index} style={styles.paymentMethodRow}>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>{metodo.tipo}</Text>
                  <Text style={styles.paymentMethodAmount}>₡{metodo.monto.toLocaleString()}</Text>
                </View>
                <View style={styles.paymentMethodPercentage}>
                  <Text style={styles.paymentMethodPercent}>{metodo.porcentaje}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Resumen de Ventas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Ventas</Text>
          <View style={styles.salesSummaryCard}>
            {cierreData.resumenVentas.map((categoria, index) => (
              <View key={index} style={styles.salesRow}>
                <View style={styles.salesInfo}>
                  <Text style={styles.salesCategory}>{categoria.categoria}</Text>
                  <Text style={styles.salesCount}>{categoria.ventas} entradas</Text>
                </View>
                <Text style={styles.salesAmount}>₡{categoria.monto.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleGenerateReport}>
            <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Generar Reporte</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <Ionicons name="cloud-download" size={24} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Exportar Datos</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {!eventClosed && (
            <TouchableOpacity style={styles.closeEventButton} onPress={handleCloseEvent}>
              <Ionicons name="lock-closed" size={24} color="#ffffff" />
              <Text style={styles.closeEventButtonText}>Cerrar Evento</Text>
            </TouchableOpacity>
          )}
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
  backButton: {
    padding: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  financialCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  financialTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  financialLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  financialTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  financialTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#34C759',
  },
  paymentMethodsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  paymentMethodAmount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  paymentMethodPercentage: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentMethodPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  salesSummaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  salesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  salesInfo: {
    flex: 1,
  },
  salesCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  salesCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  salesAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  actionButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginLeft: 12,
  },
  closeEventButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  closeEventButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});