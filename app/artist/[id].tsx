import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../contexts/ThemeContext';

export default function ArtistDetailsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();


  const styles = createStyles(theme, insets);

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.gradientOverlay}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />


      <View style={styles.content}>
        <Ionicons name="musical-note-outline" size={64} color="rgba(255, 255, 255, 0.6)" />
        <Text style={styles.title}>Próximamente</Text>
        <Text style={styles.message}>La página de detalles del artista estará disponible pronto.</Text>
        <Text style={styles.idText}>ID: {id}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 16,
  },
  idText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'monospace',
  },
});