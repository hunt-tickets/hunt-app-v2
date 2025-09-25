import { Platform } from 'react-native';

// Font Configuration - Change this to switch fonts globally
const FONT_CONFIG = {
  name: 'SpaceGrotesk', // Current font family
  weights: {
    100: 'SpaceGrotesk_300Light', // Fallback to 300 since 100/200 don't exist
    200: 'SpaceGrotesk_300Light', // Fallback to 300 since 100/200 don't exist
    300: 'SpaceGrotesk_300Light',
    400: 'SpaceGrotesk_400Regular',
    500: 'SpaceGrotesk_500Medium',
    600: 'SpaceGrotesk_600SemiBold',
    700: 'SpaceGrotesk_700Bold',
    800: 'SpaceGrotesk_700Bold', // Fallback to 700 since 800/900 don't exist
    900: 'SpaceGrotesk_700Bold', // Fallback to 700 since 800/900 don't exist
  }
};

// Auto-generated FontFamily based on config
function createFontFamily(config: typeof FONT_CONFIG) {
  return {
    ExtraLight: Platform.select({
      ios: config.weights[200],
      android: config.weights[200],
      web: config.weights[200],
      default: config.weights[200],
    }),
    Light: Platform.select({
      ios: config.weights[300],
      android: config.weights[300],
      web: config.weights[300],
      default: config.weights[300],
    }),
    Regular: Platform.select({
      ios: config.weights[400],
      android: config.weights[400],
      web: config.weights[400],
      default: config.weights[400],
    }),
    Medium: Platform.select({
      ios: config.weights[500],
      android: config.weights[500],
      web: config.weights[500],
      default: config.weights[500],
    }),
    SemiBold: Platform.select({
      ios: config.weights[600],
      android: config.weights[600],
      web: config.weights[600],
      default: config.weights[600],
    }),
    Bold: Platform.select({
      ios: config.weights[700],
      android: config.weights[700],
      web: config.weights[700],
      default: config.weights[700],
    }),
    ExtraBold: Platform.select({
      ios: config.weights[800],
      android: config.weights[800],
      web: config.weights[800],
      default: config.weights[800],
    }),
    Black: Platform.select({
      ios: config.weights[900],
      android: config.weights[900],
      web: config.weights[900],
      default: config.weights[900],
    }),
  };
}

export const FontFamily = createFontFamily(FONT_CONFIG);

// Typography scale - automatically uses current font
export const Typography = {
  // Headlines
  title1: {
    fontFamily: FontFamily.Bold,
    fontSize: 36, // increased from 28
    lineHeight: 47, // 130% of fontSize
    letterSpacing: -0.5,
  },
  title2: {
    fontFamily: FontFamily.Bold,
    fontSize: 28, // increased from 22
    lineHeight: 36, // 130% of fontSize
    letterSpacing: -0.5,
  },
  title3: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 24, // increased from 20
    lineHeight: 31, // 130% of fontSize
    letterSpacing: -0.5,
  },
  // Body text
  body: {
    fontFamily: FontFamily.Regular,
    fontSize: 20, // increased from 17
    lineHeight: 26, // 130% of fontSize
    letterSpacing: -0.5,
  },
  bodyMedium: {
    fontFamily: FontFamily.Medium,
    fontSize: 20, // increased from 17
    lineHeight: 26, // 130% of fontSize
    letterSpacing: -0.5,
  },
  bodySemiBold: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 20, // increased from 17
    lineHeight: 26, // 130% of fontSize
    letterSpacing: -0.5,
  },
  // Small text
  subheadline: {
    fontFamily: FontFamily.Medium,
    fontSize: 18, // increased from 15
    lineHeight: 23, // 130% of fontSize
    letterSpacing: -0.5,
  },
  footnote: {
    fontFamily: FontFamily.Regular,
    fontSize: 16, // increased from 13
    lineHeight: 21, // 130% of fontSize
    letterSpacing: -0.5,
  },
  caption: {
    fontFamily: FontFamily.Medium,
    fontSize: 15, // increased from 12
    lineHeight: 20, // 130% of fontSize
    letterSpacing: -0.5,
  },
  // Small labels
  caption2: {
    fontFamily: FontFamily.Medium,
    fontSize: 14, // increased from 11
    lineHeight: 18, // 130% of fontSize
    letterSpacing: -0.5,
  },
};