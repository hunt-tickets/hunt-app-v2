import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography, FontFamily } from '../constants/fonts';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubtlePattern from '../components/SubtlePattern';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const handleContinue = () => {
    console.log('Continue button pressed');
    router.push('/(tabs)');
  };

  const handleGoogleAuth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Google auth pressed');
    // Future: implement better-auth Google sign-in
  };

  const handleAppleAuth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Apple auth pressed');
    // Future: implement better-auth Apple sign-in
  };
  const handleSupport = () => {
    console.log('Support button pressed');
  };
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a0a" translucent={false} />
      <View style={styles.solidBackground}>
        {/* Subtle animated background - very minimal */}
        <SubtlePattern 
          width={width}
          height={height * 0.5}
          style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        />
        
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Main Title */}
          <Text style={styles.title}>Bienvenido a HUNT</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Descubre experiencias únicas</Text>

          {/* Auth Buttons */}
          <View style={styles.authButtonsContainer}>
            {/* Google Button */}
            <TouchableOpacity 
              style={[styles.authButton, styles.googleButton]} 
              onPress={handleGoogleAuth}
              activeOpacity={0.8}
            >
              <View style={styles.authButtonContent}>
                <Ionicons name="logo-google" size={20} color="#333333" />
                <Text style={styles.authButtonText}>Continuar con Google</Text>
              </View>
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity 
              style={[styles.authButton, styles.appleButton]} 
              onPress={handleAppleAuth}
              activeOpacity={0.8}
            >
              <View style={styles.authButtonContent}>
                <Ionicons name="logo-apple" size={20} color="#ffffff" />
                <Text style={[styles.authButtonText, styles.appleButtonText]}>Continuar con Apple</Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continuar como invitado</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  solidBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a', // fondo negro elegante
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 100, // increased for more bottom space
    justifyContent: 'flex-end',
  },
  title: {
    ...Typography.title1,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'left',
  },
  subtitle: {
    ...Typography.body,
    fontFamily: FontFamily.Light,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 50,
    textAlign: 'left',
  },
  authButtonsContainer: {
    gap: 16,
  },
  authButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#333333',
  },
  authButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  authButtonText: {
    ...Typography.body,
    fontFamily: FontFamily.Medium,
    color: '#333333',
  },
  appleButtonText: {
    color: '#ffffff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  dividerText: {
    ...Typography.caption,
    color: '#666666',
    marginHorizontal: 16,
  },
  continueButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    alignSelf: 'stretch',
  },
  continueButtonText: {
    ...Typography.body,
    fontFamily: FontFamily.Medium,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
  },
  pageIndicator: {
    alignItems: 'center',
    marginBottom: 40,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    opacity: 0.6,
  },
});