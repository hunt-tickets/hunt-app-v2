import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Colors {
  // Backgrounds
  background: string;
  surface: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Glass effects
  glassBackground: string;
  glassBorder: string;
  glassHighlight: string;

  // Blur and overlays
  blurTint: 'light' | 'dark';
  gradientOverlay: string[];

  // Interactive elements
  primary: string;
  secondary: string;
  accent: string;

  // Status
  success: string;
  warning: string;
  error: string;

  // System
  border: string;
  shadow: string;
  disabled: string;
}

export interface Theme {
  colors: Colors;
  isDark: boolean;
}

const lightColors: Colors = {
  // Backgrounds
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',

  // Text
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Glass effects
  glassBackground: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(0, 0, 0, 0.1)',
  glassHighlight: 'rgba(255, 255, 255, 0.6)',

  // Blur and overlays
  blurTint: 'light',
  gradientOverlay: ['rgba(248, 249, 250, 0.95)', 'rgba(248, 249, 250, 0.7)', 'transparent'],

  // Interactive elements
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#FF9500',

  // Status
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // System
  border: 'rgba(0, 0, 0, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  disabled: 'rgba(0, 0, 0, 0.3)',
};

const darkColors: Colors = {
  // Backgrounds
  background: '#000000',
  surface: '#111111',
  card: '#1c1c1e',

  // Text
  text: '#ffffff',
  textSecondary: '#bbbbbb',
  textTertiary: '#888888',

  // Glass effects
  glassBackground: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassHighlight: 'rgba(255, 255, 255, 0.3)',

  // Blur and overlays
  blurTint: 'dark',
  gradientOverlay: ['#000000', 'rgba(0, 0, 0, 0.8)', 'transparent'],

  // Interactive elements
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  accent: '#FF9F0A',

  // Status
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',

  // System
  border: 'rgba(255, 255, 255, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  disabled: 'rgba(255, 255, 255, 0.3)',
};

const lightTheme: Theme = {
  colors: lightColors,
  isDark: false,
};

const darkTheme: Theme = {
  colors: darkColors,
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveTheme = async (isDarkMode: boolean) => {
    try {
      await AsyncStorage.setItem('theme', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    saveTheme(newTheme);
  };

  const setTheme = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
    saveTheme(isDarkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};