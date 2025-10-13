import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { Typography } from '../../constants/fonts';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TWO_FACTOR: '@hunt_2fa_enabled',
  FACE_ID: '@hunt_faceid_enabled',
};

export default function SecurityScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences on mount
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const [twoFactor, faceId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TWO_FACTOR),
        AsyncStorage.getItem(STORAGE_KEYS.FACE_ID),
      ]);

      setTwoFactorEnabled(twoFactor === 'true');
      setFaceIdEnabled(faceId === 'true');
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      try {
        // Check if device supports biometric authentication
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (!compatible) {
          Alert.alert(
            'No disponible',
            'Tu dispositivo no soporta autenticación biométrica'
          );
          return;
        }

        // Check specifically for Face ID support
        const hasFaceID = supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        );

        if (!hasFaceID) {
          Alert.alert(
            'Face ID no disponible',
            'Este dispositivo no soporta Face ID.'
          );
          return;
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
          Alert.alert(
            'Face ID no configurado',
            'Por favor configura Face ID en Ajustes > Face ID y código',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Ir a Ajustes',
                onPress: () => {
                  // This would open Settings app on a real device
                  console.log('Opening settings...');
                }
              }
            ]
          );
          return;
        }

        // For now, just enable it without authentication (since Face ID doesn't work in Expo Go)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFaceIdEnabled(true);
        await saveSetting(STORAGE_KEYS.FACE_ID, true);
        Alert.alert(
          'Face ID configurado',
          'Face ID estará disponible cuando uses un development build en dispositivo físico'
        );
      } catch (error) {
        console.error('Face ID error:', error);
        Alert.alert(
          'Error',
          'Ocurrió un error al configurar Face ID. Por favor intenta de nuevo.'
        );
      }
    } else {
      Alert.alert(
        'Desactivar Face ID',
        '¿Estás seguro de que quieres desactivar Face ID?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: async () => {
              setFaceIdEnabled(false);
              await saveSetting(STORAGE_KEYS.FACE_ID, false);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        ]
      );
    }
  };

  const handle2FAToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Activar 2FA',
        'Se enviará un código de verificación a tu número de teléfono registrado',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Activar',
            onPress: async () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setTwoFactorEnabled(true);
              await saveSetting(STORAGE_KEYS.TWO_FACTOR, true);
              // Here you would implement the actual 2FA setup
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Desactivar 2FA',
        '¿Estás seguro? Tu cuenta será menos segura sin autenticación de dos factores',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: async () => {
              setTwoFactorEnabled(false);
              await saveSetting(STORAGE_KEYS.TWO_FACTOR, false);
            },
          },
        ]
      );
    }
  };

  const securityOptions = [
    {
      title: 'Autenticación',
      items: [
        {
          id: 1,
          title: 'Autenticación de dos factores',
          subtitle: 'Añade una capa extra de seguridad',
          icon: 'shield-checkmark-outline',
          type: 'toggle',
          value: twoFactorEnabled,
          action: handle2FAToggle,
        },
        {
          id: 2,
          title: 'Face ID',
          subtitle: 'Usa reconocimiento facial para acceder',
          icon: 'scan-outline',
          type: 'toggle',
          value: faceIdEnabled,
          action: handleBiometricToggle,
        },
      ],
    },
    {
      title: 'Sesiones activas',
      items: [
        {
          id: 3,
          title: 'Dispositivos conectados',
          subtitle: '3 dispositivos activos',
          icon: 'phone-portrait-outline',
          type: 'navigation',
          action: () => console.log('Show active sessions'),
        },
      ],
    },
  ];

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Options */}
        {securityOptions.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            {group.items.map((item) =>
              item.type === 'toggle' ? (
                <View key={item.id} style={styles.settingItem}>
                  <View style={styles.settingIcon}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={theme.colors.text}
                    />
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
                      true: theme.colors.primary,
                    }}
                    thumbColor={
                      item.value ? '#ffffff' : theme.isDark ? '#cccccc' : '#f4f4f4'
                    }
                  />
                </View>
              ) : (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    item.type === 'action' && styles.actionItem,
                  ]}
                  onPress={item.action}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={
                        item.type === 'action' ? '#FF3B30' : theme.colors.text
                      }
                    />
                  </View>
                  <View style={styles.settingContent}>
                    <Text
                      style={[
                        styles.settingTitle,
                        item.type === 'action' && styles.actionText,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  {item.type === 'navigation' && (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  )}
                </TouchableOpacity>
              )
            )}
          </View>
        ))}

        {/* Security Tips */}
        <View style={styles.tipsCard}>
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.tipsText}>
            Mantén tu cuenta segura activando la autenticación de dos factores y usando Face ID
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      paddingTop: 100,
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
    actionItem: {
      borderColor: 'rgba(255, 59, 48, 0.2)',
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
    actionText: {
      color: '#FF3B30',
    },
    tipsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 16,
      marginTop: 8,
      borderWidth: 0.5,
      borderColor: theme.colors.primary + '30',
    },
    tipsText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });