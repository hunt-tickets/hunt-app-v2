import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function AjustesScreen() {
  const [notifications, setNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

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
          action: () => console.log('Profile'),
        },
        {
          id: 2,
          title: 'Información personal',
          subtitle: 'Email, teléfono, dirección',
          icon: 'card-outline',
          type: 'navigation',
          action: () => console.log('Personal info'),
        },
      ],
    },
    {
      title: 'Notificaciones',
      items: [
        {
          id: 3,
          title: 'Notificaciones push',
          subtitle: 'Eventos, recordatorios, ofertas',
          icon: 'notifications-outline',
          type: 'toggle',
          value: notifications,
          action: setNotifications,
        },
        {
          id: 4,
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
          id: 5,
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
      title: 'General',
      items: [
        {
          id: 6,
          title: 'Términos y Condiciones',
          icon: 'document-text-outline',
          type: 'navigation',
          action: () => console.log('Terms'),
        },
        {
          id: 7,
          title: 'Política de Privacidad',
          icon: 'shield-outline',
          type: 'navigation',
          action: () => console.log('Privacy'),
        },
        {
          id: 8,
          title: 'Cerrar sesión',
          icon: 'log-out-outline',
          type: 'action',
          action: () => Alert.alert('Cerrar sesión', '¿Estás seguro?'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ajustes</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            {group.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={item.type === 'toggle' ? undefined : item.action}
                disabled={item.type === 'toggle'}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as any} size={20} color="#ffffff" />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                {item.type === 'toggle' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.action}
                    trackColor={{ false: '#333333', true: '#4CAF50' }}
                    thumbColor={item.value ? '#ffffff' : '#cccccc'}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#666666" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>HUNT v2.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#333333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#cccccc',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#666666',
  },
});