import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Typography } from '../../constants/fonts';

export default function AjustesScreen() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Cuenta',
      items: [
        {
          id: 1,
          title: 'Perfil',
          subtitle: 'Luis Fernando',
          icon: 'person-outline',
          type: 'navigation',
          action: () => router.push('/profile'),
        },
        {
          id: 2,
          title: 'Información personal',
          subtitle: 'Email, teléfono, dirección',
          icon: 'card-outline',
          type: 'navigation',
          action: () => console.log('Personal info'),
        },
        {
          id: 3,
          title: 'Seguridad',
          subtitle: 'Contraseña y autenticación',
          icon: 'lock-closed-outline',
          type: 'navigation',
          action: () => console.log('Security settings'),
        },
        {
          id: 13,
          title: 'Administrar eventos',
          subtitle: 'Crear, editar y gestionar eventos',
          icon: 'calendar-outline',
          type: 'navigation',
          action: () => {
            console.log('Navigating to administrar-eventos');
            try {
              router.push('/manage-events');
            } catch (error) {
              console.error('Navigation error:', error);
            }
          },
        },
        {
          id: 14,
          title: 'Vender tickets',
          subtitle: 'Dashboard de vendedores y tickets',
          icon: 'ticket-outline',
          type: 'navigation',
          action: () => {
            console.log('Navigating to vender-tickets');
            try {
              router.push('/vender-tickets');
            } catch (error) {
              console.error('Navigation error:', error);
            }
          },
        },
      ],
    },
    {
      title: 'Notificaciones',
      items: [
        {
          id: 4,
          title: 'Notificaciones push',
          subtitle: 'Eventos, recordatorios, ofertas',
          icon: 'notifications-outline',
          type: 'toggle',
          value: notifications,
          action: setNotifications,
        },
        {
          id: 5,
          title: 'Emails promocionales',
          subtitle: 'Ofertas y eventos especiales',
          icon: 'mail-outline',
          type: 'toggle',
          value: emailUpdates,
          action: setEmailUpdates,
        },
      ],
    },
    {
      title: 'Privacidad',
      items: [
        {
          id: 6,
          title: 'Acceso a ubicación',
          subtitle: 'Para eventos cercanos',
          icon: 'location-outline',
          type: 'toggle',
          value: locationAccess,
          action: setLocationAccess,
        },
      ],
    },
    {
      title: 'Apariencia',
      items: [
        {
          id: 7,
          title: theme.isDark ? 'Modo oscuro' : 'Modo claro',
          subtitle: theme.isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
          icon: theme.isDark ? 'moon' : 'sunny',
          type: 'toggle',
          value: theme.isDark,
          action: (value: boolean) => {
            toggleTheme();
            console.log('Theme changed to:', value ? 'dark' : 'light');
          },
        },
      ],
    },
    {
      title: 'General',
      items: [
        {
          id: 8,
          title: 'Términos y Condiciones',
          icon: 'document-text-outline',
          type: 'navigation',
          action: () => console.log('Terms'),
        },
        {
          id: 9,
          title: 'Política de Privacidad',
          icon: 'shield-outline',
          type: 'navigation',
          action: () => console.log('Privacy'),
        },
        {
          id: 10,
          title: 'Cerrar sesión',
          icon: 'log-out-outline',
          type: 'action',
          action: handleSignOut,
        },
      ],
    },
  ];

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Header with Gradient Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 20 }]}>
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Ajustes</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            {group.items.map((item) => (
              item.type === 'toggle' ? (
                <View key={item.id} style={styles.settingItem}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon as any} size={20} color={theme.colors.text} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.action}
                    trackColor={{
                      false: theme.isDark ? '#333333' : '#e0e0e0',
                      true: theme.colors.primary
                    }}
                    thumbColor={item.value ? '#ffffff' : (theme.isDark ? '#cccccc' : '#f4f4f4')}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  key={item.id}
                  style={styles.settingItem}
                  onPress={item.action}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon as any} size={20} color={theme.colors.text} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )
            ))}
          </View>
        ))}
        
        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>HUNT v2.0.0</Text>
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
    paddingBottom: 24,
    height: 140,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    ...Typography.title1,
  },
  content: {
    flex: 1,
    paddingTop: 140,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 20,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: -0.3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  settingIcon: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.card,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  settingSubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontWeight: '400',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  versionText: {
    fontSize: 15,
    color: theme.colors.textTertiary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});