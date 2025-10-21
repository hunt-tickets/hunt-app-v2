import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Typography } from '../../constants/fonts';
import SupportModal from '../../components/support-modal';

const { width, height } = Dimensions.get('window');

export default function VerifyOTPScreen() {
  const { theme } = useTheme();
  const { verifyOTP } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código completo');
      return;
    }

    try {
      setLoading(true);
      const success = await verifyOTP(email, otpCode);

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Código incorrecto. Intenta de nuevo.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Image */}
      <View style={styles.backgroundImageContainer}>
        <Image
          source={require('../../assets/images/login-bg.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 1)']}
          locations={[0, 0.6, 1]}
          style={styles.imageOverlay}
        />
      </View>

      {/* Top Header Bar */}
      <View style={[styles.topHeaderBar, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.backButtonGradient}
          >
            <GlassView
              glassEffectStyle="thin"
              tintColor="rgba(255,255,255,0.1)"
              style={styles.backButtonGlass}
              intensity={20}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </GlassView>
          </LinearGradient>
        </TouchableOpacity>

        <Image
          source={require('../../assets/images/hunt-logo.png')}
          style={styles.topLogo}
          resizeMode="contain"
        />

        {/* Support Button */}
        <TouchableOpacity
          style={styles.glassSupportButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowSupportModal(true);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.supportButtonGradient}
          >
            <GlassView
              glassEffectStyle="thin"
              tintColor="rgba(255,255,255,0.1)"
              style={styles.supportButtonGlass}
              intensity={20}
            >
              <Ionicons name="headset" size={20} color="#ffffff" />
            </GlassView>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Content Container */}
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -100 : -50}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>VERIFICA TU CÓDIGO</Text>
          <Text style={styles.subtitle}>Ingresa el código de 6 dígitos que enviamos a {email}</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <View key={index} style={styles.otpInputWrapper}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.otpInputGradient}
                >
                  <GlassView
                    glassEffectStyle="thin"
                    tintColor="rgba(255,255,255,0.1)"
                    style={styles.otpInputGlass}
                  >
                    <TextInput
                      ref={(ref) => {
                        if (ref) inputRefs.current[index] = ref;
                      }}
                      style={styles.otpInput}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(index, value)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      editable={!loading}
                      autoFocus={index === 0}
                    />
                  </GlassView>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ?
                ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'] :
                ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']
              }
              style={styles.verifyButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="rgba(255, 255, 255, 0.8)" size="small" />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verificar</Text>
                  <Ionicons name="checkmark" size={20} color="#000000" style={styles.buttonIcon} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend Code */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // TODO: Resend code logic
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.resendText}>¿No recibiste el código? Reenviar</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </KeyboardAvoidingView>

      {/* Support Modal */}
      <SupportModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        showMinimal={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonGradient: {
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonGlass: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  topLogo: {
    width: 80,
    height: 80,
  },
  glassSupportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  supportButtonGradient: {
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  supportButtonGlass: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 140,
    paddingBottom: 40,
    zIndex: 10,
    justifyContent: 'flex-end',
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'left',
    letterSpacing: -1,
    ...Typography.title1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: 24,
  },
  formSection: {
    paddingBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInputWrapper: {
    width: 48,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  otpInputGradient: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  otpInputGlass: {
    borderRadius: 16,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  otpInput: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
    width: '100%',
    height: '100%',
    textAlign: 'center',
  },
  verifyButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontWeight: '400',
  },
});