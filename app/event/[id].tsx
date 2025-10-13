import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  console.log('🔵 [EventDetailScreen] ==========================================');
  console.log('🔵 [EventDetailScreen] Component mounted successfully!');
  console.log('🔵 [EventDetailScreen] Event ID:', id);

  // Mock event data - replace with actual API call
  const eventData = {
    id: id as string,
    name: 'SABANA & ROSARIO',
    subtitle: 'NN 25°',
    location: 'ST. MARTA',
    date: '14 de octubre de 2025',
    time: '01:00 - 08:00',
    ageLimit: '18+ años',
    city: 'Santa Marta',
    venue: 'Santa Marta',
    coordinates: '11°14\'31.9"N 74°12\'47.8"W',
    ticketsAvailable: false,
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=1000&fit=crop',
    description: 'Una experiencia única en Santa Marta con la mejor música electrónica',
    flyer: 'https://jtfcfsnksywotlbsddqb.supabase.co/storage/v1/object/public/events/flyers/7e3d4e39-ca58-4ba8-90f8-94b5f9f1a0ac.webp?t=1753057229228'
  };

  useEffect(() => {
    console.log('🔵 [EventDetailScreen] useEffect triggered');
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      console.log('🔵 [EventDetailScreen] Loading complete');
    }, 500);
  }, [id]);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `¡Mira este evento: ${eventData.name} en ${eventData.location}! 🎉`,
        title: eventData.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (loading) {
    console.log('🔵 [EventDetailScreen] Rendering loading state');
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Cargando evento...</Text>
      </View>
    );
  }

  console.log('🔵 [EventDetailScreen] Rendering full event detail page');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: eventData.flyer || eventData.image }}
          style={styles.heroImage}
        />

        {/* Purple Gradient Overlay */}
        <LinearGradient
          colors={['rgba(138, 43, 226, 0.8)', 'rgba(75, 0, 130, 0.9)']}
          locations={[0, 1]}
          style={styles.heroGradient}
        />

        {/* Header Actions */}
        <View style={[styles.headerActions, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Event Info */}
        <View style={styles.heroContent}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroSubtitle}>{eventData.subtitle}</Text>
            <Text style={styles.heroLocation}>{eventData.location}</Text>
          </View>

          <Text style={styles.heroTitle}>{eventData.name}</Text>

          {/* Event Dates */}
          <View style={styles.eventDates}>
            <Text style={styles.secretLocation}>SECRET LOCATION</Text>
            <Text style={styles.dateRange}>MAR 14 OCT</Text>
            <Text style={styles.dateLocation}>DIA DE LANCHA - PLAYA PRIVADA MIE 15 OCT</Text>
            <Text style={styles.dateLocation}>PROVENZA JUE 16 OCT</Text>
            <Text style={styles.dateLocation}>BAMBORA VIE 17 OCT</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Glass Card Section */}
        <View style={styles.glassCard}>
          <BlurView
            intensity={40}
            tint="systemThinMaterialDark"
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.glassCardContent}>
            {/* Event Badge */}
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>Evento</Text>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#ffffff" />
              <Text style={styles.shareButtonText}>Compartir</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardTitle}>{eventData.name}</Text>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            {/* Date Card */}
            <View style={styles.infoCard}>
              <Ionicons name="calendar-outline" size={24} color="#ffffff" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Fecha</Text>
                <Text style={styles.infoCardValue}>{eventData.date}</Text>
                <Text style={styles.infoCardTime}>{eventData.time}</Text>
              </View>
            </View>

            {/* Location Card */}
            <View style={styles.infoCard}>
              <Ionicons name="location-outline" size={24} color="#ffffff" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Lugar</Text>
                <Text style={styles.infoCardValue}>{eventData.venue}</Text>
                <Text style={styles.infoCardSubtitle}>{eventData.city}</Text>
              </View>
            </View>

            {/* Age Limit Card */}
            <View style={styles.infoCard}>
              <Ionicons name="person-outline" size={24} color="#ffffff" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Edad mínima</Text>
                <Text style={styles.infoCardValue}>{eventData.ageLimit}</Text>
              </View>
            </View>
          </View>

          {/* Tickets Section */}
          <TouchableOpacity
            style={[styles.ticketButton, !eventData.ticketsAvailable && styles.ticketButtonDisabled]}
            disabled={!eventData.ticketsAvailable}
            onPress={() => {
              if (eventData.ticketsAvailable) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                // Navigate to tickets page
              } else {
                Alert.alert('No disponible', 'Los tickets no están disponibles en este momento');
              }
            }}
          >
            <Text style={styles.ticketButtonText}>
              {eventData.ticketsAvailable ? 'Comprar tickets' : 'Sin tickets disponibles'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Event Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca del evento</Text>

          <View style={styles.eventDetailItem}>
            <View style={styles.eventDetailIcon}>
              <Ionicons name="calendar-outline" size={18} color="#ffffff" />
            </View>
            <Text style={styles.eventDetailText}>Semana Sabana/Rosario (13-19 OCT)</Text>
          </View>

          <View style={styles.eventDetailItem}>
            <View style={styles.eventDetailIcon}>
              <Ionicons name="location-outline" size={18} color="#ffffff" />
            </View>
            <Text style={styles.eventDetailText}>Secret Location - Martes 14 OCT</Text>
          </View>

          <View style={styles.eventDetailItem}>
            <View style={styles.eventDetailIcon}>
              <Ionicons name="boat-outline" size={18} color="#ffffff" />
            </View>
            <Text style={styles.eventDetailText}>Día de Lancha - Miércoles 15 OCT | Playa Privada</Text>
          </View>

          <Text style={styles.eventNote}>** No incluye día de lanchas</Text>
        </View>

        {/* Organizers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organizadores</Text>

          <View style={styles.organizerCard}>
            <View style={styles.organizerLogo}>
              <Text style={styles.organizerLogoText}>NN</Text>
            </View>
            <Text style={styles.organizerName}>Nautical Nite</Text>
          </View>
        </View>

        {/* Venue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{eventData.venue}</Text>
          <Text style={styles.venueSubtitle}>{eventData.city}</Text>

          {/* Map Container */}
          <TouchableOpacity style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={48} color="#ffffff" />
              <Text style={styles.mapText}>Ver en Google Maps</Text>
              <Text style={styles.coordinatesText}>{eventData.coordinates}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hunt Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.brandLogo}>
            <Ionicons name="apps" size={24} color="#ffffff" />
          </View>
          <View style={styles.brandContent}>
            <Text style={styles.brandTitle}>Hunt</Text>
            <Text style={styles.brandSubtitle}>Tu plataforma de tickets para eventos</Text>
          </View>
        </View>

        {/* Bottom padding for safe area */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Hero Section
  heroContainer: {
    height: height * 0.6,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
  },
  heroLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 52,
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: -1,
  },
  eventDates: {
    alignItems: 'center',
    gap: 8,
  },
  secretLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  dateRange: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  dateLocation: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  // Content
  content: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Glass Card
  glassCard: {
    margin: 20,
    marginTop: -40,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  glassCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  eventBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
    lineHeight: 32,
  },
  // Info Cards
  infoCards: {
    paddingHorizontal: 20,
    gap: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 20,
  },
  infoCardTime: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  infoCardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  // Tickets
  ticketButton: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ticketButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  ticketButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  // Sections
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  // Event Details
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  eventDetailIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetailText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  eventNote: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
    fontStyle: 'italic',
  },
  // Organizers
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  organizerLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerLogoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Venue
  venueSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  coordinatesText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Brand
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContent: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
});