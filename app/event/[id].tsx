import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { Typography } from '../../constants/fonts';

const { width, height } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  // Event data - matches the events from home screen
  const events = [
    {
      id: 1,
      title: 'MARÍA HELENA AMADOR',
      subtitle: 'ZONAS VERDES Y COLISEO CUBIERTO',
      dates: '29 SEPT - 3 OCT',
      date: '29',
      month: 'sep',
      location: 'Gimnasio Moderno',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=1000&fit=crop',
      description: 'Una experiencia única que combina música, arte y naturaleza en un espacio renovado del Gimnasio Moderno. María Helena Amador presenta su nuevo espectáculo con una propuesta innovadora.',
      price: 'Desde $75.000',
      time: '8:00 PM',
    },
    {
      id: 2,
      title: 'INSIDE PRESENTA',
      subtitle: 'CREATIVE ENTERTAINMENT',
      dates: '20 SEPT',
      date: '20',
      month: 'sep',
      location: 'Teatro Nacional',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      description: 'Una noche única de entretenimiento creativo que combina música, teatro y arte visual en el Teatro Nacional.',
      price: 'Desde $50.000',
      time: '7:30 PM',
    },
    {
      id: 3,
      title: 'FESTIVAL DE MÚSICA',
      subtitle: 'ARTISTAS INTERNACIONALES',
      dates: '15 OCT',
      date: '15',
      month: 'oct',
      location: 'Parque Central',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop',
      description: 'El festival de música más esperado del año con artistas internacionales y nacionales en el Parque Central.',
      price: 'Desde $120.000',
      time: '6:00 PM',
    },
    {
      id: 4,
      title: 'STAND UP COMEDY',
      subtitle: 'NOCHE DE RISAS',
      dates: '22 OCT',
      date: '22',
      month: 'oct',
      location: 'Teatro Libre',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
      description: 'Una noche llena de risas con los mejores comediantes del país en el Teatro Libre.',
      price: 'Desde $35.000',
      time: '9:00 PM',
    },
  ];

  const event = events.find(e => e.id === parseInt(id as string)) || events[0];
  const styles = createStyles(theme);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `¡Mira este evento: ${event.title} en ${event.location}! 🎉`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFavorite(!isFavorite);
  };

  const handleBuyTickets = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Comprar Entradas',
      `¿Quieres comprar entradas para ${event.title}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Comprar', onPress: () => console.log('Buying tickets') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.headerImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
          locations={[0, 0.6, 1]}
          style={styles.overlay}
        />
        
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.glassButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <BlurView
              intensity={50}
              tint="dark"
              style={styles.glassButtonBlur}
            >
              <View style={styles.glassButtonOverlay}>
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
              </View>
            </BlurView>
          </TouchableOpacity>

          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.glassButton} onPress={handleShare}>
              <BlurView
                intensity={50}
                tint="dark"
                style={styles.glassButtonBlur}
              >
                <View style={styles.glassButtonOverlay}>
                  <Ionicons name="share-outline" size={20} color="#ffffff" />
                </View>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.glassButton} onPress={handleFavorite}>
              <BlurView
                intensity={50}
                tint="dark"
                style={styles.glassButtonBlur}
              >
                <View style={styles.glassButtonOverlay}>
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={20}
                    color={isFavorite ? "#FF6B6B" : "#ffffff"}
                  />
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        {/* Header Info */}
        <View style={styles.headerInfo}>
          <View style={styles.dateBadge}>
            <BlurView
              intensity={40}
              tint="dark"
              style={styles.dateBadgeBlur}
            >
              <View style={styles.dateBadgeOverlay}>
                <Text style={styles.dateNumber}>{event.date}</Text>
                <Text style={styles.dateMonth}>{event.month}</Text>
              </View>
            </BlurView>
          </View>
          <Text style={styles.headerSubtitle}>{event.subtitle}</Text>
          <Text style={styles.headerTitle}>{event.title}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Details Cards */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailCard}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Fecha y Hora</Text>
              <Text style={styles.detailValue}>{event.dates} • {event.time}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailIcon}>
              <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ubicación</Text>
              <Text style={styles.detailValue}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailIcon}>
              <Ionicons name="pricetag-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Precio</Text>
              <Text style={styles.detailValue}>{event.price}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={theme.colors.text} />
            <Text style={styles.secondaryButtonText}>Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buyButton} onPress={handleBuyTickets}>
            <Text style={styles.buyButtonText}>Comprar Entradas</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassButtonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  glassButtonOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  dateBadgeBlur: {
    borderRadius: 12,
  },
  dateBadgeOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dateNumber: {
    ...Typography.title3,
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dateMonth: {
    ...Typography.caption,
    color: '#ffffff',
    textTransform: 'uppercase',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  headerTitle: {
    ...Typography.title1,
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 40,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  detailsContainer: {
    marginBottom: 32,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailIcon: {
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
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    lineHeight: 20,
  },
  sectionTitle: {
    ...Typography.title3,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  description: {
    ...Typography.body,
    fontSize: 17,
    color: theme.colors.textSecondary,
    lineHeight: 26,
    fontWeight: '400',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
    marginBottom: 40,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  buyButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
});