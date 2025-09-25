import React, { useEffect, memo } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SubtlePatternProps {
  width?: number;
  height?: number;
  style?: any;
}

export const SubtlePattern = memo(({
  width = screenWidth,
  height = screenHeight * 0.4,
  style = {},
}: SubtlePatternProps) => {
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    // Respiración muy sutil del gradiente
    opacity.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(opacity.value, [0.8, 1], [0.3, 0.6]),
    };
  });

  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      {/* Gradiente base negro */}
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0a0a',
      }} />
      
      {/* Gradiente animado muy sutil */}
      <Animated.View style={[animatedStyle, { position: 'absolute', width: '100%', height: '100%' }]}>
        <LinearGradient
          colors={['#0a0a0a', '#2a2a2a', '#1a1a1a', '#0a0a0a']}
          style={{
            width: '100%',
            height: '100%',
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
});

export default SubtlePattern;