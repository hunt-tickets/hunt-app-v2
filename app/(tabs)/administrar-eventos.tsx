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
        title: 'Festival de Música Electrónica',
        date: '15 Oct 2024',
        location: 'Medellín',
        attendees: 245,
        revenue: 12450000,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop',
      },
      {
        id: 2,
        title: 'Stand Up Comedy Night',
        date: '22 Oct 2024',
        location: 'Bogotá',
        attendees: 89,
        revenue: 3560000,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      },
    ],
    borradores: [
      {
        id: 3,
        title: 'Concierto Acústico',
        date: 'Sin fecha',
        location: 'Sin definir',
        status: 'draft',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      },
    ],
    archivados: [
      {
        id: 4,
        title: 'Festival de Jazz 2024',
        date: '10 Sep 2024',
        location: 'Cartagena',
        attendees: 156,
        revenue: 7800000,
        status: 'archived',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop',
      },
    ],
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
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Administrar Eventos</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedTab(tab.key);
            }}
          >
            <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            <View style={[styles.badge, selectedTab === tab.key && styles.activeBadge]}>
              <Text style={[styles.badgeText, selectedTab === tab.key && styles.activeBadgeText]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event)}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <View style={styles.eventInfo}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusDot, 
                        event.status === 'active' && styles.activeDot,
                        event.status === 'draft' && styles.draftDot,
                        event.status === 'archived' && styles.archivedDot
                      ]} />
                    </View>
                  </View>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventLocation}>{event.location}</Text>
                  
                  {event.status !== 'draft' && (
                    <View style={styles.eventStats}>
                      <View style={styles.stat}>
                        <Ionicons name="people-outline" size={16} color="#888888" />
                        <Text style={styles.statText}>
                          {event.attendees || 0} asistentes
                        </Text>
                      </View>
                      {event.revenue && (
                        <View style={styles.stat}>
                          <Ionicons name="card-outline" size={16} color="#888888" />
                          <Text style={styles.statText}>
                            {formatCurrency(event.revenue)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666666" />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  title: {
    ...Typography.title2,
    color: '#ffffff',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D68F',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 40,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventTitle: {
    ...Typography.bodyMedium,
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666666',
  },
  activeDot: {
    backgroundColor: '#00D68F',
  },
  draftDot: {
    backgroundColor: '#FFA500',
  },
  archivedDot: {
    backgroundColor: '#666666',
  },
  eventDate: {
    ...Typography.caption,
    color: '#888888',
    marginBottom: 2,
  },
  eventLocation: {
    ...Typography.caption,
    color: '#888888',
    marginBottom: 8,
  },
  eventStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...Typography.caption2,
    color: '#888888',
  },
});