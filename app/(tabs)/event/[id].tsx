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

const { width, height } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock event data - in real app this would come from API or state
  const event = {
    id: id,
    title: 'MARÍA HELENA AMADOR',
    subtitle: 'ZONAS VERDES Y COLISEO CUBIERTO',
    dates: '29 SEPT - 3 OCT',
    location: 'Gimnasio Moderno',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=1000&fit=crop',
    description: 'Una experiencia única que combina música, arte y naturaleza en un espacio renovado del Gimnasio Moderno. María Helena Amador presenta su nuevo espectáculo con una propuesta innovadora.',
    price: 'Desde $75.000',
    time: '8:00 PM',
  };

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
      <StatusBar style="light" />
      
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.headerImage} />
        <View style={styles.overlay} />
        
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite ? "#FF6B6B" : "#ffffff"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerDates}>{event.dates}</Text>
          <Text style={styles.headerSubtitle}>{event.subtitle}</Text>
          <Text style={styles.headerTitle}>{event.title}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Details */}
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#ffffff" />
            <Text style={styles.detailText}>{event.dates} • {event.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#ffffff" />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={20} color="#ffffff" />
            <Text style={styles.detailText}>{event.price}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Buy Button */}
        <TouchableOpacity style={styles.buyButton} onPress={handleBuyTickets}>
          <Text style={styles.buyButtonText}>Comprar Entradas</Text>
          <Ionicons name="arrow-forward" size={20} color="#333333" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  headerDates: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
  },
  buyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 20,
    marginBottom: 40,
    gap: 8,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
});