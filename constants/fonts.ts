import { Platform } from 'react-native';

// Font Configuration - Change this to switch fonts globally
const FONT_CONFIG = {
  name: 'SourceSans3', // Source Sans 3 font family
  weights: {
    200: 'SourceSans3_200ExtraLight',
    300: 'SourceSans3_300Light',
    400: 'SourceSans3_400Regular',
    500: 'SourceSans3_500Medium',
    600: 'SourceSans3_600SemiBold',
    700: 'SourceSans3_700Bold',
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
  };
}

export const FontFamily = createFontFamily(FONT_CONFIG);

// Typography scale - automatically uses current font with varied weights
export const Typography = {
  // Headlines - Using Medium to SemiBold
  title1: {
    fontFamily: FontFamily.SemiBold,
    fontSize: 36,
    lineHeight: 47,
    letterSpacing: -0.5,
  },
  title2: {
    fontFamily: FontFamily.Medium,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  title3: {
    fontFamily: FontFamily.Medium,
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.2,
  },
  // Body text - Using Light to Regular
  body: {
    fontFamily: FontFamily.Light,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: FontFamily.Regular,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  bodySemiBold: {
    fontFamily: FontFamily.Medium,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  // Small text - Using ExtraLight to Light
  subheadline: {
    fontFamily: FontFamily.Regular,
    fontSize: 18,
    lineHeight: 23,
    letterSpacing: 0,
  },
  footnote: {
    fontFamily: FontFamily.Light,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: FontFamily.Light,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  // Small labels - Using ExtraLight
  caption2: {
    fontFamily: FontFamily.ExtraLight,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
};