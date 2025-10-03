import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography } from '../constants/fonts';
import { Event, formatEventDate, getEventImageUrl, getEventVenue } from '../lib/api';

interface LiquidGlassCardProps {
  event: Event;
  onPress: () => void;
  onShare: () => void;
}

export default function LiquidGlassCard({ event, onPress, onShare }: LiquidGlassCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.eventCard,
        pressed && Platform.select({
          ios: {
            transform: [{ scale: 0.98 }],
            opacity: 0.9,
          },
          android: {
            opacity: 0.8,
          }
        })
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      android_ripple={{
        color: 'rgba(255, 255, 255, 0.1)',
        borderless: false,
      }}
    >
      <Image source={{ uri: getEventImageUrl(event) }} style={styles.eventImage} />

      {/* Enhanced Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(8, 8, 8, 0.7)', 'rgba(10, 10, 10, 0.95)']}
        style={styles.overlay}
        locations={[0.2, 0.6, 1]}
      />

      {/* Card Actions with Liquid Glass */}
      <View style={styles.cardActions}>
        {/* Share Button with Liquid Glass */}
        <Pressable
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onShare();
          }}
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={styles.actionButtonBlur}
          >
            <View style={styles.actionButtonOverlay}>
              <Ionicons name="share-outline" size={20} color="#ffffff" />
            </View>
          </BlurView>
        </Pressable>

        {/* Date Container with Liquid Glass */}
        <View style={styles.dateContainer}>
          <BlurView
            intensity={40}
            tint="dark"
            style={styles.dateBlur}
          >
            <View style={styles.dateOverlay}>
              <Text style={styles.dateNumber}>{event['date.num']}</Text>
              <Text style={styles.dateMonth}>{event['date.month']}</Text>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{event.name}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={18} color="#cccccc" />
          <Text style={styles.eventLocation}>{getEventVenue(event)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    aspectRatio: 3/4, // 4:3 ratio where 4 is height
    position: 'relative',
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // Enhanced iOS 26 Liquid Glass shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardActions: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  actionButtonOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateBlur: {
    borderRadius: 12,
  },
  dateOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
  },
  dateNumber: {
    ...Typography.title3,
    fontSize: 26,
    color: '#ffffff',
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dateMonth: {
    ...Typography.caption,
    color: '#ffffff',
    textTransform: 'lowercase',
    fontSize: 15,
    fontWeight: '600',
  },
  eventInfo: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  eventTitle: {
    ...Typography.title2,
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventLocation: {
    ...Typography.body,
    color: '#d0d0d0',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 1,
  },
});