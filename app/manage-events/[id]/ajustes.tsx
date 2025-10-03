import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme, Theme } from '../../../contexts/ThemeContext';

export default function AjustesEventoScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const [settings, setSettings] = useState({
    ventasActivas: true,
    notificacionesVentas: true,
    validacionCodigos: true,
    permitirReembolsos: false,
    ventasEnLinea: true,
    ventasEnPuerta: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEditEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Editar Evento', 'Funcionalidad próximamente');
  };

  const handleManageCategories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Gestionar Categorías', 'Funcionalidad próximamente');
  };

  const handleManagePromotions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Promociones', 'Funcionalidad próximamente');
  };

  const handleDeleteEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Eliminar Evento',
      '¿Estás seguro que deseas eliminar este evento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => Alert.alert('Evento eliminado', 'El evento ha sido eliminado'),
        },
      ]
    );
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
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Configuración de Ventas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de Ventas</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Ventas Activas</Text>
                <Text style={styles.settingDescription}>Permitir la venta de entradas</Text>
              </View>
              <Switch
                value={settings.ventasActivas}
                onValueChange={(value) => handleSettingChange('ventasActivas', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Ventas en Línea</Text>
                <Text style={styles.settingDescription}>Venta a través de la app</Text>
              </View>
              <Switch
                value={settings.ventasEnLinea}
                onValueChange={(value) => handleSettingChange('ventasEnLinea', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Ventas en Puerta</Text>
                <Text style={styles.settingDescription}>Venta directa en el evento</Text>
              </View>
              <Switch
                value={settings.ventasEnPuerta}
                onValueChange={(value) => handleSettingChange('ventasEnPuerta', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Configuración de Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notificaciones de Ventas</Text>
                <Text style={styles.settingDescription}>Recibir alertas de nuevas ventas</Text>
              </View>
              <Switch
                value={settings.notificacionesVentas}
                onValueChange={(value) => handleSettingChange('notificacionesVentas', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Configuración de Seguridad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Validación de Códigos</Text>
                <Text style={styles.settingDescription}>Validar códigos QR en entrada</Text>
              </View>
              <Switch
                value={settings.validacionCodigos}
                onValueChange={(value) => handleSettingChange('validacionCodigos', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Permitir Reembolsos</Text>
                <Text style={styles.settingDescription}>Permitir solicitudes de reembolso</Text>
              </View>
              <Switch
                value={settings.permitirReembolsos}
                onValueChange={(value) => handleSettingChange('permitirReembolsos', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Gestión del Evento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión del Evento</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleEditEvent}>
            <Ionicons name="create" size={24} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Editar Información del Evento</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleManageCategories}>
            <Ionicons name="pricetags" size={24} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Gestionar Categorías de Entradas</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleManagePromotions}>
            <Ionicons name="gift" size={24} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Promociones y Descuentos</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Zona de Peligro */}
        <View style={styles.section}>
          <Text style={styles.dangerSectionTitle}>Zona de Peligro</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteEvent}>
            <Ionicons name="trash" size={24} color="#ffffff" />
            <Text style={styles.dangerButtonText}>Eliminar Evento</Text>
          </TouchableOpacity>
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
  headerSpacer: {
    width: 24,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  dangerSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  dangerButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});