import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Typography, FontFamily } from '../../constants/fonts';

export default function AdministrarEventosScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('publicados'); // publicados, borradores, archivados

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Mock data for events
  const eventos = {
    publicados: [
      {
        id: 1,
        title: 'Faena',
        subtitle: 'SECRET LOCATION',
        dates: [
          { location: 'ROCHA • PLAYA PRIVADA', date: 'MIE 16 OCT' },
          { location: 'PROVENZA', date: 'JUE 10 OCT' },
          { location: 'BAMBORA', date: 'VIE 17 OCT' }
        ],
        status: 'STATUS',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop',
      },
      {
        id: 2,
        title: 'NN ROSARIO & SABANA',
        subtitle: 'SECRET LOCATION',
        dates: [
          { location: 'ROCHA • PLAYA PRIVADA', date: 'MIE 16 OCT' },
          { location: 'PROVENZA', date: 'JUE 10 OCT' },
          { location: 'BAMBORA', date: 'VIE 17 OCT' }
        ],
        status: 'ACTIVO',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
      },
      {
        id: 3,
        title: 'NN CESA & SENIORS',
        subtitle: 'SECRET LOCATION',
        dates: [
          { location: 'DIA DE LANCHA • PLAYA PRIVADA', date: 'MIE 08 OCT' },
          { location: 'PROVENZA WHITE PARTY', date: 'JUE 09 OCT' },
          { location: 'SECRET LOCATION', date: 'VIE 10 OCT' }
        ],
        status: 'ACTIVO',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
      },
    ],
    borradores: [],
    archivados: [],
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCreateEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to create event screen
    console.log('Create new event');
  };

  const handleEventPress = (event: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Edit event:', event.title);
  };

  const tabs = [
    { key: 'publicados', label: 'Publicados', count: eventos.publicados.length },
    { key: 'borradores', label: 'Borradores', count: eventos.borradores.length },
    { key: 'archivados', label: 'Archivados', count: eventos.archivados.length },
  ];

  const currentEvents = eventos[selectedTab as keyof typeof eventos] || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis eventos</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleBackPress}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666666" />
          <Text style={styles.searchPlaceholder}>Buscar evento</Text>
        </View>
      </View>


      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={["#ffffff"]}
          />
        }
      >
        {currentEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#666666" />
            <Text style={styles.emptyTitle}>No hay eventos</Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'publicados' && 'Aún no tienes eventos publicados'}
              {selectedTab === 'borradores' && 'No tienes borradores guardados'}
              {selectedTab === 'archivados' && 'No hay eventos archivados'}
            </Text>
            {selectedTab !== 'archivados' && (
              <TouchableOpacity style={styles.createEventButton} onPress={handleCreateEvent}>
                <Text style={styles.createEventText}>Crear evento</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.eventsList}>
            {currentEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                {/* Status Badge */}
                <View style={styles.statusBadge}>
                  <Ionicons name="settings" size={14} color="#ffffff" />
                  <Text style={styles.statusText}>{event.status}</Text>
                </View>

                {/* Event Image */}
                <Image source={{ uri: event.image }} style={styles.eventImage} />

                {/* Event Content */}
                <View style={styles.eventContent}>
                  {/* Dates */}
                  <View style={styles.datesContainer}>
                    {event.dates.map((dateInfo, index) => (
                      <View key={index} style={styles.dateRow}>
                        <Text style={styles.dateLocation}>{dateInfo.location}</Text>
                        <Text style={styles.dateText}>{dateInfo.date}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Event Title */}
                  <Text style={styles.eventTitle}>{event.title}</Text>

                  {/* Ver detalles button */}
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => handleEventPress(event)}
                  >
                    <Text style={styles.detailsText}>Ver detalles</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* Share button */}
                <TouchableOpacity style={styles.shareButton}>
                  <Ionicons name="share-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Event Button */}
      <TouchableOpacity style={styles.createEventFloatingButton} onPress={handleCreateEvent}>
        <Text style={styles.createEventButtonText}>Crear nuevo evento</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    ...Typography.title1,
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchPlaceholder: {
    ...Typography.body,
    color: '#666666',
    marginLeft: 12,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  activeTab: {
    backgroundColor: '#00D68F',
    borderColor: '#00D68F',
  },
  tabText: {
    ...Typography.bodyMedium,
    color: '#888888',
    marginRight: 6,
  },
  activeTabText: {
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#333333',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    ...Typography.caption2,
    color: '#888888',
    fontSize: 12,
  },
  activeBadgeText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    ...Typography.title3,
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 24,
  },
  createEventButton: {
    backgroundColor: '#00D68F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createEventText: {
    ...Typography.bodyMedium,
    color: '#ffffff',
  },
  eventsList: {
    paddingBottom: 120,
  },
  eventCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 2,
    gap: 6,
  },
  statusText: {
    ...Typography.caption2,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 20,
  },
  datesContainer: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLocation: {
    ...Typography.caption,
    color: '#8A2BE2',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    flex: 1,
  },
  dateText: {
    ...Typography.caption,
    color: '#8A2BE2',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventTitle: {
    ...Typography.title2,
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsText: {
    ...Typography.body,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  createEventFloatingButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createEventButtonText: {
    ...Typography.bodyMedium,
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '600',
  },
});