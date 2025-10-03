import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 40;
const CARD_WIDTH = width - CARD_HORIZONTAL_PADDING;
const CARD_HEIGHT = (CARD_WIDTH * 4) / 3;

export default function EventSkeleton() {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-CARD_WIDTH, CARD_WIDTH],
  });

  return (
    <View style={[styles.skeletonCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
      {/* Background skeleton */}
      <View style={styles.skeletonBackground} />

      {/* Shimmer effect */}
      <Animated.View
        style={[
          styles.shimmerContainer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      </Animated.View>

      {/* Content skeleton overlays */}
      <View style={styles.contentOverlay}>
        {/* Top right date badge skeleton */}
        <View style={styles.dateBadgeSkeleton} />

        {/* Bottom content skeleton */}
        <View style={styles.bottomContent}>
          {/* Share button skeleton */}
          <View style={styles.shareButtonSkeleton} />

          {/* Title skeleton */}
          <View style={styles.titleSkeleton} />

          {/* Subtitle skeleton */}
          <View style={styles.subtitleSkeleton} />

          {/* Meta info skeleton */}
          <View style={styles.metaRow}>
            <View style={styles.locationSkeleton} />
            <View style={styles.priceSkeleton} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    alignSelf: 'center',
    position: 'relative',
  },
  skeletonBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'space-between',
  },
  dateBadgeSkeleton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  shareButtonSkeleton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 12,
  },
  titleSkeleton: {
    width: '80%',
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  subtitleSkeleton: {
    width: '60%',
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  locationSkeleton: {
    width: '45%',
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 4,
  },
  priceSkeleton: {
    width: '25%',
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 4,
  },
});