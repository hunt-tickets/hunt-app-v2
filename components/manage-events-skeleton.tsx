import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const ManageEventsSkeleton = () => {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const SkeletonCard = () => (
    <View style={[styles.cardContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardContent}>
        {/* Image placeholder */}
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.card }]}>
          <Animated.View style={[styles.shimmerOverlay, { transform: [{ translateX }] }]}>
            <LinearGradient
              colors={[
                'transparent',
                theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                'transparent'
              ]}
              style={styles.shimmerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>

        {/* Content */}
        <View style={styles.textContent}>
          {/* Title */}
          <View style={[styles.titlePlaceholder, { backgroundColor: theme.colors.card }]}>
            <Animated.View style={[styles.shimmerOverlay, { transform: [{ translateX }] }]}>
              <LinearGradient
                colors={[
                  'transparent',
                  theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                  'transparent'
                ]}
                style={styles.shimmerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>

          {/* Subtitle */}
          <View style={[styles.subtitlePlaceholder, { backgroundColor: theme.colors.card }]}>
            <Animated.View style={[styles.shimmerOverlay, { transform: [{ translateX }] }]}>
              <LinearGradient
                colors={[
                  'transparent',
                  theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                  'transparent'
                ]}
                style={styles.shimmerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>

          {/* Date and status row */}
          <View style={styles.bottomRow}>
            <View style={[styles.datePlaceholder, { backgroundColor: theme.colors.card }]}>
              <Animated.View style={[styles.shimmerOverlay, { transform: [{ translateX }] }]}>
                <LinearGradient
                  colors={[
                    'transparent',
                    theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                    'transparent'
                  ]}
                  style={styles.shimmerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
            <View style={[styles.statusPlaceholder, { backgroundColor: theme.colors.card }]}>
              <Animated.View style={[styles.shimmerOverlay, { transform: [{ translateX }] }]}>
                <LinearGradient
                  colors={[
                    'transparent',
                    theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                    'transparent'
                  ]}
                  style={styles.shimmerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  cardContainer: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    height: 160,
  },
  imagePlaceholder: {
    width: 120,
    height: 128,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titlePlaceholder: {
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  subtitlePlaceholder: {
    height: 18,
    borderRadius: 9,
    marginBottom: 16,
    width: '80%',
    overflow: 'hidden',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePlaceholder: {
    height: 16,
    width: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusPlaceholder: {
    height: 24,
    width: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
    width: 300,
  },
});

export default ManageEventsSkeleton;