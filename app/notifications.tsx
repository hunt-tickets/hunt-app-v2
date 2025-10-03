import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Typography } from '../constants/fonts';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: 1,
      title: 'Nuevo evento disponible',
      message: 'MARÍA HELENA AMADOR - Boletos ya disponibles',
      time: 'Hace 2 horas',
      type: 'event',
      read: false,
    },
    {
      id: 2,
      title: 'Recordatorio de evento',
      message: 'Tu evento INSIDE PRESENTA es mañana a las 7:30 PM',
      time: 'Hace 5 horas',
      type: 'reminder',
      read: false,
    },
    {
      id: 3,
      title: 'Pago confirmado',
      message: 'Tu compra ha sido procesada exitosamente',
      time: 'Hace 1 día',
      type: 'payment',
      read: true,
    },
    {
      id: 4,
      title: 'Evento cancelado',
      message: 'FESTIVAL DE MÚSICA ha sido reprogramado',
      time: 'Hace 2 días',
      type: 'alert',
      read: true,
    },
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'event':
        return 'calendar';
      case 'reminder':
        return 'time';
      case 'payment':
        return 'card';
      case 'alert':
        return 'warning';
      default:
        return 'notifications';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'event':
        return '#007AFF';
      case 'reminder':
        return '#FF9500';
      case 'payment':
        return '#34C759';
      case 'alert':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity style={styles.markAllButton}>
          <Text style={styles.markAllText}>Marcar todo</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              console.log('Notification pressed:', notification.title);
            }}
          >
            <View style={styles.cardContent}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: getColorForType(notification.type) + '20' }
              ]}>
                <Ionicons
                  name={getIconForType(notification.type) as any}
                  size={20}
                  color={getColorForType(notification.type)}
                />
              </View>

              <View style={styles.textContent}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {notification.time}
                </Text>
              </View>

              {!notification.read && (
                <View style={styles.unreadDot} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty state if no notifications */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No hay notificaciones</Text>
            <Text style={styles.emptyMessage}>
              Te notificaremos cuando algo importante suceda
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.title2,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    ...Typography.caption,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notificationCard: {
    backgroundColor: '#111111',
    borderRadius: 20,
    marginVertical: 8,
    borderWidth: 0.5,
    borderColor: '#333333',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  unreadCard: {
    borderColor: '#007AFF20',
    backgroundColor: '#1a1a1a',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  notificationTitle: {
    ...Typography.bodyMedium,
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  notificationMessage: {
    ...Typography.body,
    color: '#bbbbbb',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: '400',
  },
  notificationTime: {
    ...Typography.caption,
    color: '#999999',
    fontSize: 13,
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 12,
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...Typography.title3,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    ...Typography.body,
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});