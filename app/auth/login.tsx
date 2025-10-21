import React, { useState, useRef } from 'react';
import Animated, {
  FadeInDown,
  FadeOutUp,
  FadeInUp,
  FadeOutDown,
  SlideInLeft,
  SlideOutRight,
} from 'react-native-reanimated';
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
import { router } from 'expo-router';
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

export default function LoginScreen() {
  const { theme } = useTheme();
  const { sendOTP, verifyOTP } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      const result = await sendOTP(email.trim().toLowerCase());

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowOTP(true);
      } else {
        Alert.alert('Error', result.error || 'No se pudo enviar el código. Intenta de nuevo.');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', error.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
      const result = await verifyOTP(email.trim().toLowerCase(), otpCode);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', result.error || 'Código incorrecto. Intenta de nuevo.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setShowOTP(false);
    setOtp(['', '', '', '', '', '']);
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
        {/* Back Button Area */}
        <View style={styles.leftButtonContainer}>
          {showOTP && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleBackToEmail();
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
          )}
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/hunt-logo.png')}
            style={styles.topLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.rightButtonContainer}>
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
      </View>

      {/* Content Container */}
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -100 : -50}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{showOTP ? 'VERIFICA TU CÓDIGO' : 'TIME TO HUNT'}</Text>
          <Text style={styles.subtitle}>
            {showOTP
              ? `Ingresa el código de 6 dígitos que enviamos a ${email}`
              : 'Te enviaremos un código de 6 dígitos a tu email para verificar tu identidad'
            }
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {!showOTP ? (
            /* Email Input */
            <Animated.View
              style={styles.inputContainer}
              entering={FadeInUp.delay(100)}
              exiting={FadeOutUp}
            >
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputGlassWrapper}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.inputGradient}
                >
                  <GlassView
                    glassEffectStyle="thin"
                    tintColor="rgba(255,255,255,0.1)"
                    style={styles.inputGlass}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="rgba(255, 255, 255, 0.8)"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="tu@email.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      returnKeyType="go"
                      onSubmitEditing={handleSendOTP}
                      editable={!loading}
                    />
                  </GlassView>
                </LinearGradient>
              </View>
            </Animated.View>
          ) : (
            /* OTP Inputs */
            <Animated.View
              style={styles.otpContainer}
              entering={FadeInDown.delay(200)}
              exiting={FadeOutDown}
            >
              {otp.map((digit, index) => (
                <Animated.View
                  key={index}
                  style={styles.otpInputWrapper}
                  entering={SlideInLeft.delay(100 + index * 50).springify()}
                >
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
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={showOTP ? handleVerifyOTP : handleSendOTP}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ?
                ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'] :
                ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']
              }
              style={styles.sendButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="rgba(255, 255, 255, 0.8)" size="small" />
              ) : (
                <>
                  <Text style={styles.sendButtonText}>{showOTP ? 'Verificar' : 'Continuar'}</Text>
                  <Ionicons
                    name={showOTP ? 'checkmark' : 'arrow-forward'}
                    size={20}
                    color="#000000"
                    style={styles.buttonIcon}
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {showOTP && (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                try {
                  setLoading(true);
                  const result = await sendOTP(email.trim().toLowerCase());
                  if (result.success) {
                    Alert.alert('Código enviado', 'Te hemos enviado un nuevo código.');
                  } else {
                    Alert.alert('Error', result.error || 'No se pudo reenviar el código.');
                  }
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'No se pudo reenviar el código.');
                } finally {
                  setLoading(false);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.resendText}>¿No recibiste el código? Reenviar</Text>
            </TouchableOpacity>
          )}

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.infoText}>
              Al continuar, aceptas nuestros{' '}
            </Text>
            <View style={styles.termsRow}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // TODO: Navigate to terms
                }}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Términos y Condiciones</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> y </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // TODO: Navigate to privacy policy
                }}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Política de Privacidad</Text>
              </TouchableOpacity>
            </View>

            {/* Version */}
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
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
  leftButtonContainer: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 16,
  },
  rightButtonContainer: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    marginLeft: 4,
  },
  inputGlassWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  inputGradient: {
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputGlass: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  inputIcon: {
    marginRight: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  sendButton: {
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
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
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
  sendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  termsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  linkButton: {
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  linkText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '400',
  },
  // Back button styles
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
  // OTP styles
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
});