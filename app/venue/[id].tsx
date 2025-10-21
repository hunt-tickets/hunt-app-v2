import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Typography } from '../../constants/fonts';
import { ApiService, VenueDetails } from '../../lib/api';

const { width, height } = Dimensions.get('window');

export default function VenueDetailsScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVenueDetails();
  }, [id]);

  const loadVenueDetails = async () => {
    if (!id || typeof id !== 'string') {
      setError('ID del venue inválido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const venueData = await ApiService.getVenueDetails(id, session?.accessToken);
      setVenue(venueData);
    } catch (error) {
      console.error('🔴 [VenueDetails] Error loading venue details:', error);
      setError('No se pudieron cargar los detalles del venue');
    } finally {
      setLoading(false);
    }
  };


  const handleOpenMap = async () => {
    if (!venue?.link) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Linking.openURL(venue.link);
    } catch (error) {
      console.error('Error opening map:', error);
      Alert.alert('Error', 'No se pudo abrir el mapa');
    }
  };

  const handleCall = async () => {
    if (!venue?.google_phone_number) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Linking.openURL(`tel:${venue.google_phone_number}`);
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'No se pudo realizar la llamada');
    }
  };

  const handleWebsite = async () => {
    if (!venue?.google_website_url) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Linking.openURL(venue.google_website_url);
    } catch (error) {
      console.error('Error opening website:', error);
      Alert.alert('Error', 'No se pudo abrir el sitio web');
    }
  };

  const styles = createStyles(theme, insets);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </View>
    );
  }

  if (error || !venue) {
    return (
      <View style={styles.container}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="rgba(255, 255, 255, 0.6)" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error || 'No se encontraron detalles del venue'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadVenueDetails}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.gradientOverlay}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Venue Header */}
        <View style={styles.venueHeader}>
          <View style={styles.venueLogoContainer}>
            {venue.logo ? (
              <Image source={{ uri: venue.logo }} style={styles.venueLogo} />
            ) : (
              <View style={styles.venueLogoPlaceholder}>
                <Ionicons name="business" size={32} color="rgba(255, 255, 255, 0.6)" />
              </View>
            )}
          </View>
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{venue.name}</Text>
            <Text style={styles.venueType}>{venue.venue_type?.toUpperCase() || 'VENUE'}</Text>
            {venue.google_avg_rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{venue.google_avg_rating}</Text>
                <Text style={styles.reviewsText}>({venue.google_total_reviews} reseñas)</Text>
              </View>
            )}
          </View>
        </View>

        {/* Map */}
        {venue.static_map_url && (
          <TouchableOpacity style={styles.mapContainer} onPress={handleOpenMap}>
            <Image source={{ uri: venue.static_map_url }} style={styles.mapImage} />
            <View style={styles.mapOverlay}>
              <Ionicons name="location" size={24} color="#ffffff" />
              <Text style={styles.mapText}>Ver en Maps</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.sectionTitle}>Dirección</Text>
          </View>
          <Text style={styles.addressText}>{venue.address}</Text>
          <Text style={styles.cityText}>{venue.city.name}, {venue.google_country}</Text>
        </View>

        {/* Description */}
        {venue.ai_description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.sectionTitle}>Descripción</Text>
            </View>
            <Text style={styles.descriptionText}>{venue.ai_description}</Text>
          </View>
        )}

        {/* Contact Actions */}
        <View style={styles.actionsContainer}>
          {venue.google_phone_number && (
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <GlassView
                glassEffectStyle="regular"
                tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="call" size={24} color="#ffffff" />
              <Text style={styles.actionText}>Llamar</Text>
            </TouchableOpacity>
          )}

          {venue.google_website_url && (
            <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
              <GlassView
                glassEffectStyle="regular"
                tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="globe" size={24} color="#ffffff" />
              <Text style={styles.actionText}>Sitio Web</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={handleOpenMap}>
            <GlassView
              glassEffectStyle="regular"
              tintColor={theme.isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="map" size={24} color="#ffffff" />
            <Text style={styles.actionText}>Mapa</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Accesibilidad</Text>
            <Text style={styles.infoValue}>
              {venue.wheelchair_accessible ? 'Accesible' : 'No accesible'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Zona Horaria</Text>
            <Text style={styles.infoValue}>{venue.timezone_id}</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: insets.top + 80,
    paddingBottom: insets.bottom + 32,
  },
  venueHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  venueLogoContainer: {
    marginRight: 16,
  },
  venueLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  venueLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  venueName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    ...Typography.title2,
  },
  venueType: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: 200,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  mapText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
    ...Typography.headline,
  },
  addressText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  descriptionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  infoItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});