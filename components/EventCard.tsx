import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

interface MappedEvent {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  month: string;
  status: string | null;
}

interface EventCardProps {
  event: MappedEvent;
  onPress: (event: MappedEvent) => void;
  getStatusColor: (status: string | null) => string;
  getStatusLabel: (status: string | null) => string;
}

const CARD_HEIGHT = 160;

const EventCard = React.memo<EventCardProps>(({ event, onPress, getStatusColor, getStatusLabel }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    onPress(event);
  };

  const handleSharePress = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      {/* Background Image */}
      <Image source={{ uri: event.image }} style={styles.eventImage} />

      {/* Enhanced Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(8, 8, 8, 0.7)', 'rgba(10, 10, 10, 0.95)']}
        style={styles.overlay}
        locations={[0, 0.4, 0.8]}
      />

      {/* Card Actions with Liquid Glass */}
      <View style={styles.cardActions}>
        {/* Share Button with Liquid Glass */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSharePress}
        >
          <GlassView
            style={styles.actionButtonBlur}
            tintColor="rgba(0,0,0,0.5)"
            glassEffectStyle="regular"
          >
            <View style={styles.actionButtonOverlay}>
              <Ionicons name="share-outline" size={16} color="#ffffff" />
            </View>
          </GlassView>
        </TouchableOpacity>

        {/* Date Container with Liquid Glass */}
        <View style={styles.dateContainer}>
          <GlassView
            style={styles.dateBlur}
            tintColor="rgba(0,0,0,0.5)"
            glassEffectStyle="regular"
          >
            <View style={styles.dateOverlay}>
              <Text style={styles.eventMonth}>{event.month.toUpperCase()}</Text>
              <Text style={styles.eventDay}>{event.date}</Text>
            </View>
          </GlassView>
        </View>
      </View>

      {/* Status Badge - only show if status exists */}
      {event.status && (
        <View style={styles.statusBadge}>
          <GlassView
            style={styles.statusBlur}
            tintColor="rgba(0,0,0,0.5)"
            glassEffectStyle="regular"
          >
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(event.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
              {getStatusLabel(event.status)}
            </Text>
          </GlassView>
        </View>
      )}

      {/* Event Content */}
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  eventCard: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  eventImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 2,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 60,
  },
  dateBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    lineHeight: 10,
  },
  eventDay: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 16,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 2,
  },
  statusBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

EventCard.displayName = 'EventCard';

export default EventCard;