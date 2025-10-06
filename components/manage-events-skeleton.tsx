import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 160;

export default function ManageEventsSkeleton() {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const SkeletonCard = () => (
    <View style={styles.card}>
      {/* Background with subtle gradient */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Shimmer overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.03)',
            'rgba(255, 255, 255, 0.05)',
            'rgba(255, 255, 255, 0.03)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      </Animated.View>

      {/* Content skeleton structure */}
      <View style={styles.cardContent}>
        {/* Top right area for date/action buttons */}
        <View style={styles.topSection}>
          <View style={styles.statusBadge} />
          <View style={styles.topRight}>
            <View style={styles.actionButton} />
            <View style={styles.dateBox} />
          </View>
        </View>

        {/* Bottom area for title */}
        <View style={styles.bottomSection}>
          <View style={styles.titleLine} />
          <View style={styles.titleLineShort} />
        </View>
      </View>

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 10, 0.6)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.3)',
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  shimmer: {
    width: width * 0.7,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    width: 80,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
  },
  topRight: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
  },
  dateBox: {
    width: 52,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
  },
  bottomSection: {
    gap: 8,
  },
  titleLine: {
    width: '70%',
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
  },
  titleLineShort: {
    width: '40%',
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
});